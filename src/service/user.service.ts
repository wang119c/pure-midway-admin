import {Inject, Provide} from '@midwayjs/core';
import {InjectEntityModel} from "@midwayjs/typeorm";
import {UserEntity} from "../entity/user.entity";
import {Repository} from "typeorm";
import {Context} from "@midwayjs/koa";
import * as _ from 'lodash';
import {sha256} from "../utils/encrypt";
import {CustomHttpError} from "../error/customHttp.error";
import {CacheManager} from "@midwayjs/cache";

@Provide()
export class UserService {

  @Inject()
  ctx: Context;

  @InjectEntityModel(UserEntity)
  userEntity: Repository<UserEntity>;

  @Inject()
  cacheManger: CacheManager ;

  // 获取个人信息
  async person() {
    const info = await this.userEntity.findOneBy({
      id: this.ctx.admin?.userId,
    })
    delete info?.password;
    return info;
  }

  // 修改个人信息
  async personUpdate(param) {
    param.id = this.ctx.admin.userId;
    if (!_.isEmpty(param.password)) {
      param.password = sha256(param.password)
      const userInfo = await this.userEntity.findOneBy({
        id: param.id
      })
      if( !userInfo ) {
        throw new CustomHttpError('用户不存在');
      }
      param.passwordV = userInfo.passwordV + 1
      await this.cacheManger.set(
        `admin:passwordVersion:${param.id}`,
        param.passwordV
      )
    } else {
      delete param.password
    }
    await this.userEntity.save(param)
  }


}
