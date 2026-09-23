import type { categoryEquipment } from './character';

export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  equipmentCategory: string;
  gearCategory: string | null;
  cost?: {
      quantity: number,
      unit: string | null;
  };
  weight: number;
  armorCategory?: string | null;
  armorClass?: {
    base: number;
    dex_bonus: boolean;
    max_bonus: number;
  } | null;
  capacity?: string | null;
  categoryRange?: string | null;
  contents?: CatalogItemContent[];
  damage?: {
    damage_dice: string;
    damage_type: {
      index: string;
      name: string;
      url: string;
    };
  } | null;
  properties?: Array<{
    index: string;
    name: string;
    url: string;
  }>;
  quantity?: number;
  range?: {
    normal: number;
    long?: number;
  } | null;
  speed?: {
    quantity: number;
    unit: string;
  } | null;
  stealthDisadvantage?: boolean;
  strMinimum?: number;
  throwRange?: {
    normal: number;
    long: number;
  } | null;
  toolCategory?: string | null;
  twoHandedDamage?: {
    damage_dice: string;
    damage_type: {
      index: string;
      name: string;
      url: string;
    };
  } | null;
  vehicleCategory?: string | null;
  weaponCategory?: string | null;
  weaponRange?: string | null;
  categoryEquipment?: categoryEquipment;
}

export interface CatalogItemContent {
  item: {
    id: string;
    name: string;
  };
  quantity: number;
}