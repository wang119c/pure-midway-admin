import { Middleware, IMiddleware } from '@midwayjs/core'
import {Context, NextFunction} from "@midwayjs/koa";

// not used
@Middleware()
export class ExceptionMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      console.log("===222222===")
      try {
        await next()
      } catch (err) {
        ctx.logger.error(`[Exception] ${err}`)
        ctx.set('Content-Type', 'application/json')
        const status = err.status
        const message =
          status === 500 && ctx.app.env === 'prod'
            ? '服务器好像出了点问题...稍后再试试'
            : err.message
        ctx.status = status
        ctx.body = { message, code: status }
      }
    }
  }
}
