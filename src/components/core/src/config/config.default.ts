import {PureConfig} from "../interface";

export const customKey = {
  pure: {
    // 是否自动导入数据库
    initDB: false,
    // crud配置
    crud: {
      // 软删除
      softDelete: true,
      // 分页查询每页条数
      pageSize: 15
    }
  } as PureConfig
};
