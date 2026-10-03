// src/types/character.ts

export type Ability = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

export interface AbilityScore {
  value: number;
  proficient: boolean;
}

export interface SpellSlot {
  max: number;
  used: number; // Nombre d'emplacements dépensés
}

export interface Spell {
  id: string;
  name: string;
  level: number; // 0 = Mineur
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
}

export type SpellcastingAbility = 'INT' | 'WIS' | 'CHA' | 'NONE';
export type categoryEquipment = 'ring' | 'head' | 'necklace' | 'shield' | 'chest' | 'weapon' | 'feet' | 'quiver';

export interface Character {
  id: string;
  name: string;
  class: string;
  level: number;
  race: string;
  alignment: string;
  xp: number;
  personality: string;
  ideals: string;
  links: string;
  faults: string;
  age: number;
  height: number;
  weight: number;
  eyes: string;
  skin: string;
  hair: string;
  appearance: string;
  allies: string;
  history: string;
  additionalAbility: string;
  hp: {
    current: number;
    max: number;
    temp: number;
  };
  hpNote: string;
  armorClass: number;
  armorClassNote: string;
  initiativeBonus: number;
  initiativeBonusNote: string;
  abilities: Record<Ability, AbilityScore>;
  deathSaves: {
    successes: number;
    failures: number;
  };
  spellSlots: Record<number, SpellSlot>;
  spellcastingAbility?: SpellcastingAbility;
  knownSpellIds?: string[];     // IDs des sorts appris / présents dans le grimoire
  preparedSpellIds?: string[];  // IDs des sorts actuellement préparés (pour le combat)
  inventory: Item[];
  currency: Currency;
}

// Objet unifié présent dans l'inventaire du personnage (gère catalogue et custom)
export interface Item {
  id: string;                 // UUID unique de l'instance dans le sac
  catalogId?: string;         // ID officiel du catalogue (ex: "longsword", optionnel si créé sur mesure)
  name: string;
  quantity: number;
  weight?: number;
  description?: string;
  equipmentCategory?: string; // Catégorie principale (Arme, Armure, Équipement d'aventurier...)
  categoryEquipment?: categoryEquipment; // Slot d'équipement corporel si applicable
  isEquipped?: boolean;       // Si l'objet est actuellement équipé

  // Valeur et coût
  cost?: {
    quantity: number;
    unit: string | null;
  };

  // Spécificités : Armures
  armorCategory?: string | null;
  armorClass?: {
    base: number;
    dex_bonus: boolean;
    max_bonus: number;
  } | null;
  stealthDisadvantage?: boolean;
  strMinimum?: number;

  // Spécificités : Armes & Dégâts
  weaponCategory?: string | null;
  weaponRange?: string | null;
  damage?: {
    damage_dice: string;
    damage_type: {
      index: string;
      name: string;
      url: string;
    };
  } | null;
  twoHandedDamage?: {
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
  range?: {
    normal: number;
    long?: number;
  } | null;

  // Spécificités : Outils, Véhicules, Équipement
  gearCategory?: string | null;
  toolCategory?: string | null;
  vehicleCategory?: string | null;
  speed?: {
    quantity: number;
    unit: string;
  } | null;
  capacity?: string | null;
}

export interface Currency {
  pc: number; // Pièces de Cuivre
  pa: number; // Pièces d'Argent
  po: number; // Pièces d'Or
  pp: number; // Pièces de Platine
}