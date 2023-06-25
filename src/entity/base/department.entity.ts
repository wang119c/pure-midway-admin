import {Column, Entity} from "typeorm";
import {BaseEntity} from "../../components/core";


@Entity("base_sys_department")
export class DepartmentEntity extends BaseEntity {

  @Column({
    comment: "部门名称"
  })
  name: string;

  @Column({
    comment: "上级部门ID",
    type: "bigint",
    nullable: true
  })
  parentId: number;

  @Column({
    comment: "排序",
    default: 0
  })
  orderNum: number;

  parentName: string;
}
