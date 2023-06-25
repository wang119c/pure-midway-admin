import {App, Configuration, ILogger, IMidwayContainer, Logger} from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';
import * as cache from '@midwayjs/cache';
import {Application} from "@midwayjs/koa";
import {PureExceptionFilter} from "./filter/filter";
import {FuncUtil} from "./util/func";

@Configuration({
  namespace: 'Pure',
  imports: [
    cache
  ],
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class BookConfiguration {
  @Logger()
  coreLogger: ILogger;

  @App()
  app: Application;

  async onReady(container: IMidwayContainer) {
    // 常用函数处理
    await container.getAsync(FuncUtil);
    // 异常处理
    this.app.useFilter(PureExceptionFilter)
  }
}
