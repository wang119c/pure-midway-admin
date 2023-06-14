import { Provide } from '@midwayjs/core';
import { RES_CODE, RES_MESSAGE } from '../constant';

@Provide()
export abstract class BaseController {
  // 成功返回
  ok(data?: any) {
    return {
      code: RES_CODE.Success,
      message: RES_MESSAGE.Success,
      data: data || null,
    };
  }

  // 失败返回
  fail(message?: string, code?: RES_CODE) {
    return {
      code: code ? code : RES_CODE.CoreFail,
      message: message
        ? message
        : code === RES_CODE.ValidateFail
        ? RES_MESSAGE.ValidateFail
        : RES_MESSAGE.CommFail,
    };
  }
}
