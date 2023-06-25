import {Configuration, IMidwayContainer} from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';
import {PureQueueHandle} from "./queue";

@Configuration({
  namespace: 'pure:book',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class PureTaskConfiguration {
  async onReady(container: IMidwayContainer) {
    await container.getAsync(PureQueueHandle)
  }
}
