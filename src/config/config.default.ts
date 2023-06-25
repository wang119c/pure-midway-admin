import {MidwayConfig} from '@midwayjs/core';
import * as redisStore from 'cache-manager-ioredis';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1685888787316_7780',
  koa: {
    port: 7001,
  },
  jwt: {
    secret: 'hkdfhskdhfksdhfkshdfkshdk',
    expiresIn: '2d',
    // token
    token: {
      // 2小时过期，需要用刷新token
      expire: 2 * 3600,
      // 15天内，如果没操作过就需要重新登录
      refreshExpire: 24 * 3600 * 15,
    },
  },
  cache: {
    store: redisStore,
    options: {
      host: '127.0.0.1',
      port: 6379,
      password: '123456',
      db: 0,
      keyPrefix: 'cache:',
      ttl: null
    },
  },
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: '127.0.0.1',
        port: 3306,
        database: 'pure_midway_admin',
        username: 'root',
        password: 'Wang118c',
        synchronize: true, // 如果第一次使用，不存在表，有同步的需求可以写 true，注意会丢数据
        logging: true,
        entities: ['**/entity/*/*{.ts,.js}'],
      },
    },
  },
  redis: {
    client: {
      port: 6379, // Redis port
      host: '127.0.0.1', // Redis host
      password: '123456',
      db: 0,
    },
  }
} as MidwayConfig;
