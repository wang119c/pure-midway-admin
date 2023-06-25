import {Column, Entity} from "typeorm";
import {BaseEntity} from "../../components/core";

/**
 * 角色部门
 */
@Entity('base_sys_role_department')
export class RoleDepartmentEntity extends BaseEntity {

  @Column({
    comment: "角色ID",
    type: "bigint"
  })
  roleId: number;

  @Column({
    comment: "部门ID",
    type: "bigint"
  })
  departmentId: number;
}
