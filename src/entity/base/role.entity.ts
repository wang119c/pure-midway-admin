import {Column, Entity, Index} from "typeorm";
import {BaseEntity} from "../../components/core";

@Entity('base_sys_role')
export class RoleEntity extends BaseEntity {

  @Column({
    comment: "用户ID"
  })
  userId: string;

  @Index({unique: true})
  @Column({
    comment: "名称"
  })
  name: string;

  @Index({unique: true})
  @Column({comment: '角色标签', nullable: true, length: 50})
  label: string;

  @Column({
    comment: "备注",
    nullable: true
  })
  remark: string;

  @Column({
    comment: "数据权限是否关联上下级",
    default: 1
  })
  relevance: number;

  @Column({
    comment: "菜单权限",
    type: "json"
  })
  menuIdList: number[];

  @Column({
    comment: "部门权限",
    type: "json"
  })
  departmentIdList: number[];

}
