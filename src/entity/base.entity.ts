import {CreateDateColumn, Index, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import * as dayjs from 'dayjs';

const dateTransformer = {
  from: (value: Date | number) => {
    return dayjs(typeof value === 'number' ? value : value).format(
      'YYYY-MM-DD HH:mm:ss'
    );
  },
  to: () => new Date(),
};

export abstract class BaseEntity {
  @PrimaryGeneratedColumn("increment", {
    comment: "ID"
  })
  id: number;

  @Index()
  @CreateDateColumn({
    comment: "创建时间",
    type: 'timestamp',
    transformer: dateTransformer,
  })
  createTime: Date;

  @Index()
  @UpdateDateColumn({
    comment: "更新时间",
    type: 'timestamp',
    transformer: dateTransformer,
  })
  updateTime: Date;
}
