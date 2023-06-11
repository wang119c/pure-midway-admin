import {MidwayConfig} from '@midwayjs/core';
import * as redisStore from 'cache-manager-ioredis'

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1685888787316_7780',
  koa: {
    port: 7001,
  },
  jwt: {
    secret: 'hkdfhskdhfksdhfkshdfkshdk',
    expiresIn: '2d',
  },
  cache: {
    store: redisStore,
    options: {
      host: "127.0.0.1",
      port: 6379,
      password: '123456',
      db: 0,
      keyPrefix: "cache:"
    }
  },
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: "127.0.0.1",
        port: 3306,
        username: "root",
        password: "Wang118c",
        synchronize: false,     // 如果第一次使用，不存在表，有同步的需求可以写 true，注意会丢数据
        logging: false,
        entities: [
          '**/entity/*.entity{.ts,.js}'
        ]
      }
    }
  },
  redis: {
    client: {
      port: 6379, // Redis port
      host: "127.0.0.1", // Redis host
      password: "123456",
      db: 0,
    },
  },
} as MidwayConfig;
