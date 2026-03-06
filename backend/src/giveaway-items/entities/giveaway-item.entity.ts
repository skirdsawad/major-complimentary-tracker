import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ItemType } from '../../common/enums/item-type.enum';

@Entity('giveaway_items')
export class GiveawayItem {
  @PrimaryColumn({ type: 'varchar' })
  item_code: string;

  @Column({ type: 'varchar' })
  item_name: string;

  @Column({ type: 'enum', enum: ItemType })
  item_type: ItemType;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
