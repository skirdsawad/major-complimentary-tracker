export enum ItemType {
  POSTER = 'POSTER',
  KEYCHAIN = 'KEYCHAIN',
  STICKER = 'STICKER',
  OTHER = 'OTHER',
}

export interface GiveawayItem {
  item_code: string;
  item_name: string;
  item_type: ItemType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
