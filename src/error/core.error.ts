import {BaseError} from "./base.error";
import {RES_CODE, RES_MESSAGE} from "../constant";

/**
 * 核心异常
 */
export class CoreError extends BaseError {
  constructor(message: string) {
    super(
      'CoreError',
      RES_CODE.Fail,
      message ? message : RES_MESSAGE.Fail
    );
  }
}
