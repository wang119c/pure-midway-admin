import { RESCODE, RESMESSAGE } from '../constant/global';
import { BaseException } from './base';

/**
 * 校验异常
 */
export class PureValidateException extends BaseException {
  constructor(message: string) {
    super(
      'PureValidateException',
      RESCODE.VALIDATEFAIL,
      message ? message : RESMESSAGE.VALIDATEFAIL
    );
  }
}
