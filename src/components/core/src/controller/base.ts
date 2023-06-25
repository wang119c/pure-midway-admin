import {App, getClassMetadata, IMidwayApplication, Provide} from '@midwayjs/core';
import {RESCODE, RESMESSAGE} from "../constant/global";
import {ControllerOption, CurdOption} from "../decorator/controller";
import {CONTROLLER_KEY, Init, Inject} from "@midwayjs/decorator";
import {Context} from "@midwayjs/koa";
import {BaseService} from "../service/base";
import {TypeORMDataSourceManager} from "@midwayjs/typeorm";

@Provide()
export abstract class BaseController {

  @Inject('ctx')
  baseCtx: Context;

  @Inject()
  service: BaseService;

  @Inject()
  typeORMDataSourceManager: TypeORMDataSourceManager;

  @App()
  baseApp: IMidwayApplication;

  curdOption: CurdOption;

  connectionName;

  @Init()
  async init() {
    const option: ControllerOption = getClassMetadata(CONTROLLER_KEY, this)
    const curdOption: CurdOption = option.curdOption;
    this.curdOption = curdOption;
    if (!this.curdOption) {
      return;
    }
    // 操作之前
    await this.before(curdOption);
    // 设置service
    await this.setService(curdOption);
    // 设置实体
    await this.setEntity(curdOption);
  }

  private async before(curdOption: CurdOption) {
    if (!curdOption?.before) {
      return;
    }
    await curdOption.before(this.baseCtx, this.baseApp)
  }

  // 设置service
  private async setService(curdOption: CurdOption) {
    if (curdOption.service) {
      this.service = await this.baseCtx.requestContext.getAsync(
        curdOption.service
      );
    }
  }

  // 设置实体
  private async setEntity(curdOption: CurdOption) {
    const entity = curdOption?.entity;
    if (entity) {
      const dataSourceName =
        this.typeORMDataSourceManager.getDataSourceNameByModel(entity);
      let entityModel = this.typeORMDataSourceManager
        .getDataSource(dataSourceName)
        .getRepository(entity);
      this.service.setEntity(entityModel);
    }
  }


  // 新增
  async add() {
    await this.insertParam(this.curdOption)
    const {body} = this.baseCtx.request;
    return this.ok(await this.service.add(body))
  }

  // 删除
  async delete() {
    // @ts-ignore
    const {ids} = this.baseCtx.request.body
    return this.ok(await this.service.delete(ids))
  }

  // 更新
  async update() {
    const {body} = this.baseCtx.request;
    return this.ok(await this.service.update(body));
  }

  // 分页查询
  async page() {
    const {body} = this.baseCtx.request;
    return this.ok(
      await this.service.page(
        body,
        this.curdOption.pageQueryOp,
        this.connectionName
      )
    )
  }

  // 列表查询
  async list() {
    const {body} = this.baseCtx.request;
    return this.ok(
      await this.service.list(
        body,
        this.curdOption.listQueryOp,
        this.connectionName
      )
    );
  }

  // 根据ID查询信息
  async info() {
    const {id} = this.baseCtx.query;
    return this.ok(
      await this.service.info(id, this.curdOption.infoIgnoreProperty)
    );
  }

  // 插入参数值
  private async insertParam(curdOption: CurdOption) {
    if (!curdOption?.insertParam) {
      return;
    }
    this.baseCtx.request.body = {
      // @ts-ignore
      ...this.baseCtx.request.body,
      ...(await curdOption.insertParam(this.baseCtx, this.baseApp)),
    };
  }


  /**
   * 成功返回
   * @param data 返回数据
   */
  ok(data?: any) {
    const res = {
      code: RESCODE.SUCCESS,
      message: RESMESSAGE.SUCCESS,
    };
    if (data || data == 0) {
      res["data"] = data;
    }
    return res;
  }

  /**
   * 失败返回
   * @param message
   * @param code
   */
  fail(message?: string, code?: RESCODE) {
    return {
      code: code ? code : RESCODE.COMMFAIL,
      message: message
        ? message
        : code == RESCODE.VALIDATEFAIL
          ? RESMESSAGE.VALIDATEFAIL
          : RESMESSAGE.COMMFAIL,
    };
  }
}
