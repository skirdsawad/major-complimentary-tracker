import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('branch_item_stocks')
@Unique(['branch_code', 'item_code'])
export class BranchItemStock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  branch_code: string;

  @Column({ type: 'varchar' })
  item_code: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @UpdateDateColumn()
  updated_at: Date;
}
