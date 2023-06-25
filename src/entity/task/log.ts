import {Column, Entity, Index} from "typeorm";
import {BaseEntity} from "../../components/core";

@Entity('task_log')
export class TaskLogEntity extends BaseEntity {
  @Index()
  @Column({
    comment: '任务ID',
    nullable: true,
    type: "bigint"
  })
  taskId: number;

  @Column({ comment: '状态 0-失败 1-成功', default: 0, type: 'tinyint' })
  status: number;

  @Column({ comment: '详情描述', nullable: true, type: 'text' })
  detail: string;

}
