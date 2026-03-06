import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('cinema_branches')
export class CinemaBranch {
  @PrimaryColumn({ type: 'varchar' })
  branch_code: string;

  @Column({ type: 'varchar' })
  branch_name: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
