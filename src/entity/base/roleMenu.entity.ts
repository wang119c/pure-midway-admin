import {Column, Entity} from "typeorm";
import {BaseEntity} from "../../components/core";


@Entity('base_sys_role_menu')
export class RoleMenuEntity extends BaseEntity {
  @Column({
    comment: "角色ID",
    type: "bigint"
  })
  roleId: number;

  @Column({
    comment: "菜单ID",
    type: "bigint"
  })
  menuId: number;
}
