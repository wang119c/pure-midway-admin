/**
 * 返回码
 */
export enum RES_CODE {
  // 成功
  Success = 1000,
  // 失败
  Fail = 1001,
  // 参数验证失败
  ValidateFail = 1002,
  // 参数验证失败
  CoreFail = 1003,
}

/**
 * 返回信息
 */
export enum RES_MESSAGE {
  // 成功
  Success = "success",
  // 失败
  Fail = "comm fail",
  // 参数验证失败
  ValidateFail = "validate fail",
  // 核心异常
  CoreFail = "core fail",
}

/**
 * 错误提示
 */
export enum ERR_INFO {
  NoEntity = "未设置操作实体",
  NoId = "查询参数[id]不存在",
  SortField = "排序参数不正确",
}

/**
 * 事件
 */
export enum EVENT {
  // 软删除
  SoftDelete = "onSoftDelete",
  // 服务成功启动
  ServerReady = "onServerReady",
  // 服务就绪
  Ready = "onReady",
  // ES 数据改变
  EsDataChange = "esDataChange",
}
