export type Ability = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

export interface AbilityScore {
  value: number;
  proficient: boolean;
}

export interface SpellSlot {
  max: number;
  used: number;
}

export interface Character {
  name: string;
  class: string;
  level: number;
  race: string;
  hp: {
    current: number;
    max: number;
    temp: number;
  };
  armorClass: number;
  initiativeBonus: number;
  abilities: Record<Ability, AbilityScore>;
  deathSaves: {
    successes: number;
    failures: number;
  };
  spellSlots: Record<number, SpellSlot>;
  inventory: Item[];
  currency: Currency;
}

export interface Item {
  id: string;
  name: string;
  quantity: number;
  weight?: number; // en lb
  description?: string;
}

export interface Currency {
  cp: number; // Pièces de Cuivre
  sp: number; // Pièces d'Argent
  ep: number; // Pièces d'Électrum
  gp: number; // Pièces d'Or
  pp: number; // Pièces de Platine
}
