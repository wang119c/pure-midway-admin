import {saveClassMetadata, saveModule} from "@midwayjs/decorator";


export const PURE_URL_TAG_KEY = 'decorator:pure:url:tag';

export enum TagTypes {
  IGNORE_TOKEN = "ignoreToken",
  IGNORE_SIGN = 'ignoreSign'
}

export interface PureUrlTagConfig {
  key: TagTypes | string;
  value: string[]
}

// 打标记
export function PureUrlTag(data: PureUrlTagConfig): ClassDecorator {
  return (target: any) => {
    // 将装饰的类，绑定到该装饰器，用于后续能获取到 class
    saveModule(PURE_URL_TAG_KEY, target);
    // 保存一些元数据信息，任意你希望存的东西
    saveClassMetadata(PURE_URL_TAG_KEY, data, target)
  }
}
