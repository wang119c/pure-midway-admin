import {saveClassMetadata, saveModule, Scope, ScopeEnum} from "@midwayjs/core";
import {JobsOptions} from 'bullmq';

export const PURE_TASK_KEY = 'decorator:pure:task';

export function PureQueue(
  config = {type: 'comm', queue: {}, worker: {}} as {
    type?: 'comm' | 'getter' | 'noworker' | 'single';
    queue?: JobsOptions;
    worker?: WorkerOptions;
  }
): ClassDecorator {
  return (target: any) => {
    // 将装饰的类，绑定到该装饰器，用于后续能获取到 class
    saveModule(PURE_TASK_KEY, target)
    // 保存一些元数据信息，任意你希望存的东西
    saveClassMetadata(PURE_TASK_KEY, config, target)
    // 指定 IoC 容器创建实例的作用域，这里注册为请求作用域，这样能取到 ctx
    Scope(ScopeEnum.Singleton)(target)
  }
}
