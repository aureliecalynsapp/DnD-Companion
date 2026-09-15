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
}