import { BaseError } from './base.error';
import { RES_CODE, RES_MESSAGE } from '../constant';

/**
 * 通用异常
 */
export class CommError extends BaseError {
  constructor(message: string) {
    super(
      'CommError',
      RES_CODE.CommFail,
      message ? message : RES_MESSAGE.CommFail
    );
  }
}
