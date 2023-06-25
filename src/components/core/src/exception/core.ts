import { RESCODE, RESMESSAGE } from '../constant/global';
import { BaseException } from './base';

/**
 * 核心异常
 */
export class PureCoreException extends BaseException {
  constructor(message: string) {
    super(
      'PureCoreException',
      RESCODE.COREFAIL,
      message ? message : RESMESSAGE.COREFAIL
    );
  }
}
