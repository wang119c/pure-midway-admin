import {Configuration, App} from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import {join} from 'path';
// import { DefaultErrorFilter } from './filter/default.filter';
// import { NotFoundFilter } from './filter/notfound.filter';
import {ReportMiddleware} from './middleware/report.middleware';
import * as axios from '@midwayjs/axios';
import * as swagger from '@midwayjs/swagger';
import * as bull from '@midwayjs/bull';
import * as jwt from '@midwayjs/jwt';
import * as upload from '@midwayjs/upload';
import * as captcha from '@midwayjs/captcha';
import * as redis from '@midwayjs/redis';
import * as cache from '@midwayjs/cache';
import * as orm from '@midwayjs/typeorm';
import {ExceptionFilter} from "./filter/exception.filter";

@Configuration({
  imports: [
    koa,
    validate,
    axios,
    bull,
    jwt,
    upload,
    captcha,
    redis,
    cache,
    orm,
    {
      component: swagger,
      enabledEnvironment: ['local']
    },
    {
      component: info,
      enabledEnvironment: ['local'],
    },
  ],
  importConfigs: [join(__dirname, './config')],
})
export class ContainerLifeCycle {
  @App()
  app: koa.Application;

  async onReady() {
    // add middleware
    this.app.useMiddleware([ReportMiddleware]);
    // add filter
    this.app.useFilter([ExceptionFilter]);
  }
}
