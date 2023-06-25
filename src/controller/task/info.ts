import {ALL, Body, Get, Inject, Post, Provide, Query} from "@midwayjs/core";
import {BaseController, PureController} from "../../components/core";
import {TaskInfoEntity} from "../../entity/task/info";
import {TaskInfoService} from "../../service/task/info";


@Provide()
@PureController({
  prefix: '/admin/task/info',
  api: ['add', 'delete', 'update', 'info', 'page'],
  entity: TaskInfoEntity,
  service: TaskInfoService,
  before: ctx => {
    ctx.request.body.limit = ctx.request.body.repeatCount;
  },
  pageQueryOp: {
    fieldEq: ['status', 'type'],
  },
})
export class TaskInfoController extends BaseController {
  @Inject()
  taskInfoService: TaskInfoService;

  // 手动执行一次
  @Post('/once', {
    summary: '执行一次'
  })
  async once(@Body('id') id: number) {
    await this.taskInfoService.once(id)
    this.ok()
  }

  // 暂停任务
  @Post('/stop' , {
    summary: "停止"
  })
  async Stop(@Body('id') id: number) {
    await this.taskInfoService.stop(id)
    this.ok()
  }

  /**
   * 开始任务
   */
  @Post('/start', { summary: '开始' })
  async start(@Body('id') id: number, @Body('type') type: number) {
    await this.taskInfoService.start(id, type);
    this.ok();
  }

  /**
   * 日志
   */
  @Get('/log', { summary: '日志' })
  async log(@Query(ALL) params: any) {
    return this.ok(await this.taskInfoService.log(params));
  }


}

