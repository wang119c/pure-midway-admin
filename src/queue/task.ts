import {BasePureQueue, PureQueue} from "../components/task/src";
import {App, IMidwayApplication, Inject} from "@midwayjs/core";
import {TaskInfoService} from "../service/task/info";

@PureQueue()
export abstract class TaskInfoQueue extends BasePureQueue{
  @App()
  app: IMidwayApplication;

  @Inject()
  taskInfoService: TaskInfoService;

  async data(job , done: any) :Promise<void> {
    try {
      const result = await this.taskInfoService.invokeService(job.data.service);
      await this.taskInfoService.record(job.data, 1, JSON.stringify(result));
    } catch (error) {
      await this.taskInfoService.record(job.data, 0, error.message);
    }
    if (!job.data.isOnce) {
      await this.taskInfoService.updateNextRunTime(job.data.id);
      await this.taskInfoService.updateStatus(job.data.id);
    }
    done()
  }

}
