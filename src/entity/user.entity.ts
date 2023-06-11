import {Column, Entity} from "typeorm";
import {BaseEntity} from "./base.entity";


@Entity("user")
export class UserEntity extends BaseEntity {
  @Column()
  name: string;
}
