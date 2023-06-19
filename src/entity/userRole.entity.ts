import {BaseEntity} from "./base.entity";
import {Column, Entity} from "typeorm";


@Entity('base_sys_user_role')
export class UserRoleEntity extends BaseEntity {

  @Column({
    comment: "用户ID",
    type: "bigint"
  })
  userId: number;

  @Column({
    comment: "角色ID",
    type: "bigint"
  })
  roleId: number;
}
