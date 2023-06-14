import {Body, Controller, Get, Inject, Post, Query} from '@midwayjs/core';
import { BaseController } from './base.controller';
import { LoginService } from '../service/login.service';
import {LoginDTO} from "../dto/login.dto";

@Controller('/')
export class OpenController extends BaseController {
  @Inject()
  loginService: LoginService;

  @Get('/captcha', {
    summary: '验证码',
  })
  async captcha(
    @Query('width') width: number,
    @Query('height') height: number
  ) {
    const res = await this.loginService.captcha(width, height);
    return this.ok(res);
  }

  @Post('/login', {summary: "登录"})
  async login(@Body() login: LoginDTO) {
     const res = await this.loginService.login(login)
     console.log(res)
     // return this.ok(res)
  }



  @Get('/refreshToken', {
    summary: '刷新Token',
  })
  async refreshToken(@Query('refreshToken') refreshToken: string) {
    const res = await this.loginService.refreshToken(refreshToken);
    return this.ok(res);
  }
}
