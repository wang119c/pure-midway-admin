import {Provide} from "@midwayjs/core";
import {BaseService} from "./base.service";
import {InjectEntityModel} from "@midwayjs/typeorm";
import {DepartmentEntity} from "../entity/department.entity";
import {RoleDepartmentEntity} from "../entity/roleDepartment.entity";
import * as _ from 'lodash'
import {Repository} from "typeorm";

/**
 * 部门
 */
@Provide()
export class DepartmentService extends BaseService {

  @InjectEntityModel(DepartmentEntity)
  departmentEntity: Repository<DepartmentEntity>;

  @InjectEntityModel(RoleDepartmentEntity)
  roleDepartmentEntity: Repository<RoleDepartmentEntity>;


  /**
   * 根据多个ID获得部门权限信息
   * @param roleIds
   * @param isAdmin
   */
  async getByRoleIds(roleIds: number[], isAdmin) {
    if (!_.isEmpty(roleIds)) {
      if (isAdmin) {
        const result = await this.departmentEntity.find();
        return result.map(e => {
          return e.id
        })
      }
      const result = await this.roleDepartmentEntity
        .createQueryBuilder()
        .where('roleId in (:roleIds)', {roleIds})
        .getMany()
      if (!_.isEmpty(result)) {
        return _.uniq(
          result.map(e => {
            return e.departmentId
          })
        )
      }
    }
    return []
  }


}
