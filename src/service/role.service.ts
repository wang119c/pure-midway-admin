import {Provide} from "@midwayjs/core";
import {BaseService} from "./base.service";
import {InjectEntityModel} from "@midwayjs/typeorm";
import {UserRoleEntity} from "../entity/userRole.entity";
import {Repository} from "typeorm";
import * as  _ from 'lodash';

@Provide()
export class RoleService extends BaseService {

  @InjectEntityModel(UserRoleEntity)
  userRoleEntity: Repository<UserRoleEntity>;

  /**
   * 根据用户ID获得所有用户角色
   * @param userId
   */
  async getByUser(userId: number): Promise<number[]> {
    const userRole = await this.userRoleEntity.findBy({
      userId
    })
    if (!_.isEmpty(userRole)) {
      return userRole.map(e => {
        return e.roleId
      })
    }
    return []
  }

}
