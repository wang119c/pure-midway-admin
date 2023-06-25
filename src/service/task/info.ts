import {App, ILogger, IMidwayApplication, Inject, Logger, Provide, ScopeEnum} from "@midwayjs/core";
import {Scope} from "@midwayjs/decorator";
import {BaseService} from "../../components/core/src";
import {Repository} from "typeorm";
import {TaskInfoEntity} from "../../entity/task/info";
import {InjectEntityModel} from "@midwayjs/typeorm";
import {TaskInfoQueue} from "../../queue/task";
import * as _ from 'lodash'
import {Utils} from "../../utils/utils";
import {TaskLogEntity} from "../../entity/task/log";

@Provide()
@Scope(ScopeEnum.Request, {allowDowngrade: true})
export class TaskInfoService extends BaseService {
  @InjectEntityModel(TaskInfoEntity)
  taskInfoEntity: Repository<TaskInfoEntity>

  @Logger()
  logger: ILogger;

  @Inject()
  taskInfoQueue: TaskInfoQueue;

  @Inject()
  utils: Utils;

  @App()
  app: IMidwayApplication;

  @InjectEntityModel(TaskLogEntity)
  taskLogEntity: Repository<TaskLogEntity>;


  // 手动执行一次
  async once(id) {
    const task = await this.taskInfoEntity.findOneBy({id})
    if (task) {
      await this.taskInfoQueue.add({
        ...task,
        isOnce: true
      }, {
        jobId: task.id.toString(),
        removeOnComplete: true,
        removeOnFail: false
      })
    }
  }

  // 检查任务是否存在
  async exist(jobId) {
    const result = await this.taskInfoQueue.getRepeatableJobs();
    const ids = result.map(e => {
      return e.id
    })
    return ids.includes(jobId.toString());
  }

  // 停止任务
  async stop(id) {
    const task = await this.taskInfoEntity.findOneBy({id})
    if (task) {
      const result = await this.taskInfoQueue.getRepeatableJobs()
      const job = _.find(result, {
        id: task.id + ''
      })
      if (job) {
        await this.taskInfoQueue.removeRepeatableByKey(job.key)
      }
      task.status = 0
      await this.taskInfoEntity.update(task.id, task)
      await this.updateNextRunTime(task.id)
    }
  }

  // 更新下次执行时间
  async updateNextRunTime(jobId) {
    await this.nativeQuery(
      `update task_info a set a.nextRunTime = ? where a.id = ?`,
      [await this.getNextRunTime(jobId), jobId]
    )
  }

  // 任务ID
  async getNextRunTime(jobId) {
    let nextRunTime;
    const result = await this.taskInfoQueue.getRepeatableJobs()
    const task = _.find(result, {id: jobId + ''});
    if (task) {
      nextRunTime = new Date(task.next)
    }
    return nextRunTime
  }

  // 开始任务
  async start(id, type?) {
    const task = await this.taskInfoEntity.findOneBy({id})
    task.status = 1
    if (type || type === 0) {
      task.type = type;
    }
    await this.addOrUpdate(task)
  }

  // 新增或修改
  async addOrUpdate(params) {
    delete params.repeatCount;
    let repeatConf;
    await this.getOrmManager().transaction(async transactionalEntityManager => {
      if (params.taskType === 0) {
        params.limit = null;
        params.every = null;
      } else {
        params.cron = null;
      }
      await transactionalEntityManager.save(TaskInfoEntity, params);
      if (params.status === 1) {
        const exist = await this.exist(params.id)
        if (exist) {
          await this.remove(params.id);
        }
        const {every, limit, startDate, endDate, cron} = params;
        const repeat = {
          every,
          limit,
          jobId: params.id,
          startDate,
          endDate,
          cron
        }
        await this.utils.removeEmptyP(repeat)
        const result = await this.taskInfoQueue.add(params, {
          jobId: params.id,
          removeOnComplete: true,
          removeOnFail: true,
          repeat
        })
        if (!result) {
          throw new Error('任务添加失败，请检查任务配置');
        }
        repeatConf = result.opts;
      }
    })
    if (params.status === 1) {
      await this.utils.sleep(1000);
      await this.updateNextRunTime(params.id);
      await this.nativeQuery(
        'update task_info a set a.repeatConf = ? where a.id = ?',
        [JSON.stringify(repeatConf.repeat), params.id]
      );
    }
  }

  // 任务日志
  async log(query) {
    const {id, status} = query;
    return this.sqlRenderPage(
      `SELECT
          a.*,
          b.NAME AS taskName
      FROM
      task_log a
      JOIN task_info b ON a.taskId = b.id
      where 1=1 ${this.setSql(id, 'and a.taskId = ?', [id])} ${this.setSql(status, 'and a.status = ?', [status])}`, query
    )
  }

  // 移除任务
  async remove(taskId) {
    const result = await this.taskInfoQueue.getRepeatableJobs()
    const job = _.find(result, {
      id: taskId + ''
    })
    await this.taskInfoQueue.removeRepeatableByKey(job.key);
  }

  // 调用service
  async invokeService(serviceStr) {
    if (serviceStr) {
      const arr = serviceStr.split('.')
      const service = await this.app.getApplicationContext().getAsync(arr[0])
      for (const child of arr) {
        if (child.includes('(')) {
          const lastArr = child.split('(');
          const param = lastArr[1].replace(')', '');
          if (!param) {
            return service[lastArr[0]]();
          } else {
            return service[lastArr[0]](JSON.parse(param));
          }
        }
      }
    }
  }

  // 保存任务记录，成功任务每个任务保留最新20条日志，失败日志不会删除
  async record(task, status, detail?) {
    await this.taskLogEntity.save({
      taskId: task.id,
      status,
      detail: detail || '',
    });
    await this.nativeQuery(
      `DELETE a
      FROM
      task_log a,
          ( SELECT id FROM task_log where taskId = ? AND status = 1 ORDER BY id DESC LIMIT ?, 1 ) b
      WHERE
      a.taskId = ? AND
      a.status = 1 AND
      a.id < b.id`,
      [task.id, 19, task.id]
    ); // 日志保留最新的20条
  }

  // 刷新任务状态
  async updateStatus(jobId) {
    const result = await this.taskInfoQueue.getRepeatableJobs();
    const job = _.find(result, {id: jobId + ''});
    if (!job) {
      return;
    }
    const task = await this.taskInfoEntity.findOneBy({id: job.id});
    const nextTime = await this.getNextRunTime(task.id)
    if (task) {
      task.nextRunTime = nextTime
    }
    await this.taskInfoEntity.update(task.id, task);
  }
}
