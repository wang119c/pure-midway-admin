import {IMiddleware, Inject, Middleware} from "@midwayjs/core";
import {Context, NextFunction} from "@midwayjs/koa";
import {JwtService} from "@midwayjs/jwt";
import {CustomHttpError} from "../error/customHttp.error";


@Middleware()
export class AuthorityMiddleware implements IMiddleware<Context, NextFunction> {
  @Inject()
  jwtService: JwtService;

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const authorization = ctx.get("Authorization")
      if (!authorization) {
        throw new CustomHttpError('token已过期或未授权')
      }
      const parts = authorization.trim().split(' ');
      if (parts.length !== 2) {
        throw new CustomHttpError('token已过期或未授权')
      }
      const [scheme, token] = parts;
      if (/^Bearer$/i.test(scheme)) {
        try {
          await this.jwtService.verify(token, {
            complete: true
          });
        } catch (error) {
          throw new CustomHttpError('token已过期或未授权')
        }
        await next()
      }
    }
  };

  match(ctx: Context): boolean {
    const ignore = ctx.path.indexOf("/open/") !== -1
    return !ignore
  }

  static getName(): string {
    return 'authMiddleware'
  }

}
