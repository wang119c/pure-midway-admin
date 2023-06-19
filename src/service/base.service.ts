import {Init, Inject, Provide} from "@midwayjs/core";
import * as _ from 'lodash';
import * as SqlString from 'sqlstring';
import {TypeORMDataSourceManager} from "@midwayjs/typeorm";

@Provide()
export abstract class BaseService {

  @Inject()
  typeORMDataSourceManager: TypeORMDataSourceManager;

  protected sqlParams;

  // 初始化
  @Init()
  init() {
    this.sqlParams = []
  }

  /**
   * 设置sql
   * @param condition
   * @param sql
   * @param params
   */
  setSql(condition, sql, params) {
    let rSql = false
    if (condition || condition === 0 && condition !== '') {
      rSql = true
      this.sqlParams = this.sqlParams.concat(params)
    }
    return rSql ? sql : ""
  }


  // 原生查询
  async nativeQuery(sql, params?, connectionName ?) {
    if (_.isEmpty(params)) {
      params = this.sqlParams
    }
    let newParams = []
    newParams = newParams.concat(params)
    this.sqlParams = [];
    for (const param of newParams) {
      SqlString.escape(param)
    }
    return await this.getOrmManager(connectionName).query(sql, newParams || [])
  }

  // 获得ORM管理
  getOrmManager(connectionName = "default") {
    return this.typeORMDataSourceManager.getDataSource(connectionName)
  }

}
