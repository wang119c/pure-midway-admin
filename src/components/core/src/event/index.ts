import * as Events from "events";
import {App, getClassMetadata, IMidwayApplication, listModule, Provide, ScopeEnum} from "@midwayjs/core";
import {Init, Scope} from "@midwayjs/decorator";
import {PURE_CLS_EVENT_KEY, PURE_EVENT_KEY} from "../decorator/event";

@Provide()
@Scope(ScopeEnum.Singleton)
export class PureEventManager extends Events {
  @App()
  app: IMidwayApplication;

  @Init()
  async init() {
    const eventModules = listModule(PURE_CLS_EVENT_KEY)
    for (const module of eventModules) {
      await this.handlerEvent(module);
    }
  }

  async handlerEvent(module) {
    const events = getClassMetadata(PURE_EVENT_KEY, module);
    for (const event of events) {
      const method = event.eventName ? event.eventName : event.propertyKey;
      this.on(method, async (...args) => {
        const moduleInstance = await this.app.getApplicationContext().getAsync(module)
        moduleInstance[event.propertyKey](...args);
      })
    }
  }
}
