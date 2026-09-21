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

export interface Character {
  id: string;
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
  spellcastingAbility?: SpellcastingAbility;
  knownSpellIds?: string[];     // IDs des sorts appris / présents dans le grimoire
  preparedSpellIds?: string[];  // IDs des sorts actuellement préparés (pour le combat)
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
  pc: number; // Pièces de Cuivre
  pa: number; // Pièces d'Argent
  po: number; // Pièces d'Or
  pp: number; // Pièces de Platine
}
