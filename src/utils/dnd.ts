// src/utils/dnd.ts

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