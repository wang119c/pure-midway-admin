import { ILogger } from '@midwayjs/core';
import { Catch, Logger } from '@midwayjs/decorator';
import { RES_CODE } from '../constant';

/**
 * 全局异常处理
 */
@Catch()
export class ExceptionFilter {
  @Logger()
  coreLogger: ILogger;

  async catch(err) {
    this.coreLogger.error(err);
    return {
      code: err.status || RES_CODE.CommFail,
      message: err.message,
      data: null,
    };
  }
}
