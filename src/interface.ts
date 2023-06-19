import {MiddlewareParamArray} from "@midwayjs/koa";

/**
 * @description User-Service parameters
 */
export class ModuleConfig{
  // 名称
  name: string;
  // 描述
  description: string;
  // 模块中间件
  middlewares?: MiddlewareParamArray;
  // 全局中间件
  globalMiddlewares?: MiddlewareParamArray;
  // 模块加载顺序，默认为0，值越大越优先加载
  order?: number;
}
