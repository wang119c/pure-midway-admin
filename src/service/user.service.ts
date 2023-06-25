import {Inject, Provide} from '@midwayjs/core';
import {InjectEntityModel} from "@midwayjs/typeorm";
import {UserEntity} from "../entity/base/user.entity";
import {Repository} from "typeorm";
import {Context} from "@midwayjs/koa";
import * as _ from 'lodash';
import {sha256} from "../utils/encrypt";
import {CustomHttpError} from "../error/customHttp.error";
import {CacheManager} from "@midwayjs/cache";
import {UserRoleEntity} from "../entity/base/userRole.entity";
import {PermsService} from "./perms.service";
import {BaseService} from "../components/core/src";
import {PureCommException} from "../components/core";

@Provide()
export class UserService extends BaseService {

  @Inject()
  ctx: Context;

  @InjectEntityModel(UserEntity)
  userEntity: Repository<UserEntity>;

  @InjectEntityModel(UserRoleEntity)
  userRoleEntity: Repository<UserRoleEntity>;

  @Inject()
  permsService: PermsService;


  @Inject()
  cacheManager: CacheManager;

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
      if (!userInfo) {
        throw new CustomHttpError('用户不存在');
      }
      param.passwordV = userInfo.passwordV + 1
      await this.cacheManager.set(
        `admin:passwordVersion:${param.id}`,
        param.passwordV
      )
    } else {
      delete param.password
    }
    await this.userEntity.save(param)
  }

  // 新增
  async add(param) {
    const exists = await this.userEntity.findOneBy({
      username: param.username
    })
    if (!_.isEmpty(exists)) {
      throw new CustomHttpError('用户名已经存在~');
    }
    param.password = sha256(param.password);
    await this.userEntity.save(param)
    await this.updateUserRole(param)
    return param.id;
  }

  // 修改
  async update(param) {
    if (param.id && param.username === 'admin') {
      throw new PureCommException('非法操作~');
    }
    if (!_.isEmpty(param.password)) {
      param.password = sha256(param.password);
      const userInfo = await this.userEntity.findOneBy({id: param.id});
      if (!userInfo) {
        throw new PureCommException('用户不存在');
      }
      param.passwordV = userInfo.passwordV + 1;
      await this.cacheManager.set(
        `admin:passwordVersion:${param.id}`,
        param.passwordV
      );
    } else {
      delete param.password;
    }
    if (param.status === 0) {
      await this.forbidden(param.id);
    }
    await this.userEntity.save(param);
    await this.updateUserRole(param);
  }


  // 更新用户角色关系
  async updateUserRole(user) {
    if (_.isEmpty(user.roleIdList)) {
      return;
    }
    if (user.username === 'admin') {
      throw new CustomHttpError('非法操作~');
    }
    await this.userRoleEntity.delete({
      userId: user.id
    })
    if (user.roleIdList) {
      for (const roleId of user.roleIdList) {
        await this.userRoleEntity.save({
          userId: user.id,
          roleId
        })
      }
    }
    await this.permsService.refreshPerms(user.id)
  }

  // 禁用用户
  async forbidden(userId) {
    await this.cacheManager.del(`admin:token:${userId}`)
  }

  // 移动部门
  async move(departmentId, userIds) {
    await this.userEntity.createQueryBuilder()
      .update()
      .set({departmentId})
      .where('id in (:userIds)', {userIds})
      .execute()
  }
}
