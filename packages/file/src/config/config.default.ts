import {MODETYPE, PureFileConfig} from "../interface";

export default  {
  pure: {
    file: {
      // 上传模式
      mode: MODETYPE.LOCAL,
      // 文件路径前缀 本地上传模式下 有效
      domain: 'http://127.0.0.1:7001'
    } as PureFileConfig
  }
}
