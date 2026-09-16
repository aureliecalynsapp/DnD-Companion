// src/utils/dnd.ts
import type { Character } from '../types/character';

export const calculateModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

export const formatModifier = (modifier: number): string => {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

export const calculatePassivePerception = (
  wisScore: number, 
  proficient: boolean, 
  proficiencyBonus: number
): number => {
  const base = 10 + calculateModifier(wisScore);
  return proficient ? base + proficiencyBonus : base;
};

// Calcul du modificateur d'une statistique (ex: 16 -> +3)
export const getAbilityModifier = (score: number = 10): number => {
  return Math.floor((score - 10) / 2);
};

// Calcul du bonus de maîtrise selon le niveau
export const getProficiencyBonus = (level: number = 1): number => {
  return Math.ceil(1 + level / 4);
};

// Obtenir le modificateur d'incantation du personnage
export const getSpellcastingModifier = (character: Character): number => {
  const ability = character.spellcastingAbility || 'NONE';
  if (ability === 'NONE' || !character.abilities) return 0;

  // On récupère le score de la caractéristique (ex: character.stats.int)
  const score = character.abilities[ability as keyof typeof character.abilities]?.value ?? 10;
  return getAbilityModifier(score);
};

// Calcul du DD de sauvegarde des sorts
export const getSpellSaveDC = (character: Character): number => {
  const pb = getProficiencyBonus(character.level);
  const mod = getSpellcastingModifier(character);
  return 8 + pb + mod;
};

// Calcul du bonus d'attaque magique
export const getSpellAttackBonus = (character: Character): number => {
  const pb = getProficiencyBonus(character.level);
  const mod = getSpellcastingModifier(character);
  return pb + mod;
};