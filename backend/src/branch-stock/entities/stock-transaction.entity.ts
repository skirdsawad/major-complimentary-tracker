import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StockTransactionType } from '../../common/enums/stock-transaction-type.enum';

@Entity('stock_transactions')
export class StockTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  branch_code: string;

  @Column({ type: 'varchar' })
  item_code: string;

  @Column({ type: 'enum', enum: StockTransactionType })
  transaction_type: StockTransactionType;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int' })
  previous_balance: number;

  @Column({ type: 'int' })
  new_balance: number;

  @Column({ type: 'varchar', nullable: true })
  reason: string | null;

  @Column({ type: 'varchar' })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;
}
