import {Inject, Provide} from "@midwayjs/core";
import {InjectEntityModel} from "@midwayjs/typeorm";
import {DepartmentEntity} from "../entity/base/department.entity";
import {RoleDepartmentEntity} from "../entity/base/roleDepartment.entity";
import * as _ from 'lodash'
import {Repository} from "typeorm";
import {BaseService} from "../components/core/src";
import {PermsService} from "./perms.service";
import {Context} from "@midwayjs/koa";

/**
 * 部门
 */
@Provide()
export class DepartmentService extends BaseService {

  @InjectEntityModel(DepartmentEntity)
  departmentEntity: Repository<DepartmentEntity>;

  @InjectEntityModel(RoleDepartmentEntity)
  roleDepartmentEntity: Repository<RoleDepartmentEntity>;

  @Inject()
  permsService: PermsService;

  @Inject()
  ctx: Context;


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

  // 获得部门排序
  async order(params) {
    for (const e of params) {
      await this.departmentEntity.update(e.id, e)
    }
  }

  // 获得部门菜单
  async list() {
    // 部门权限
    const permsDepartmentArr = await this.permsService.departmentIds(this.ctx.admin.userId)
    // 过滤部门权限
    const find = this.departmentEntity.createQueryBuilder();
    if (this.ctx.admin.username !== 'admin')
      find.andWhere('id in (:ids)', {
        ids: !_.isEmpty(permsDepartmentArr) ? permsDepartmentArr : [null],
      });
    find.addOrderBy('orderNum', 'ASC');
    const departments: DepartmentEntity[] = await find.getMany();
    if (!_.isEmpty(departments)) {
      departments.forEach(e => {
        const parentMenu = departments.filter(m => {
          e.parentId = parseInt(e.parentId + '');
          if (e.parentId == m.id) {
            return m.name;
          }
        });
        if (!_.isEmpty(parentMenu)) {
          e.parentName = parentMenu[0].name;
        }
      });
    }
    return departments;
  }

  // 删除
  async delete(ids: number[]) {
    // @ts-ignore
    const {deleteUser} = this.ctx.request.body;
    await super.delete(ids);
    if (deleteUser) {
      await this.nativeQuery(
        'delete from base_sys_user where departmentId in (?)',
        [ids]
      );
    } else {
      const topDepartment = await this.departmentEntity
        .createQueryBuilder()
        .where('parentId is null')
        .getOne();
      if (topDepartment) {
        await this.nativeQuery(
          'update base_sys_user a set a.departmentId = ? where a.departmentId in (?)',
          [topDepartment.id, ids]
        );
      }
    }
  }

}
