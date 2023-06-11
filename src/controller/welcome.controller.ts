import {Controller, Get, Inject} from "@midwayjs/core";
import {Utils} from "../utils/utils";
import {Context} from "@midwayjs/koa";
import {CustomHttpError} from "../error/customHttp.error";

@Controller('/')
export class WelcomeController {
  @Inject()
  utils: Utils;
  @Inject()
  ctx: Context;

  @Get('/')
  async welcome(): Promise<string> {
    throw new CustomHttpError("111111")

    return 'hello world'
  }
}
