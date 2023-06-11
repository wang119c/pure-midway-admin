import {BaseError} from "./base.error";
import {RES_CODE, RES_MESSAGE} from "../constant";


/**
 * 校验异常
 */
export class ValidateError extends BaseError {
  constructor(message: string) {
    super(
      'ValidateError',
      RES_CODE.ValidateFail,
      message ? message : RES_MESSAGE.ValidateFail
    );
  }
}
