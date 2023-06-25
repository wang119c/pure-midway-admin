import { RESCODE, RESMESSAGE } from '../constant/global';
import { BaseException } from './base';

/**
 * 通用异常
 */
export class PureCommException extends BaseException {
  constructor(message: string) {
    super(
      'PureCommException',
      RESCODE.COMMFAIL,
      message ? message : RESMESSAGE.COMMFAIL
    );
  }
}
