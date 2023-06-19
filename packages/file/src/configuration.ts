import {Configuration, IMidwayContainer} from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';
import * as upload from '@midwayjs/upload';
import {PureFile} from "./file";
@Configuration({
  namespace: 'pure:file',
  importConfigs: [
    {
      default: DefaultConfig,
    },
    upload
  ],
})
export class PureConfiguration {
  async onReady(container: IMidwayContainer) {
      await container.getAsync(PureFile)
  }
}
