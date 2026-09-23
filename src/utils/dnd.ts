// src/utils/dnd.ts
import type { Character } from '../types/character';
import { useCharacterStore } from '../store/useCharacterStore';

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

export const useArmorClass = (): number => {
  // 1. Récupération dynamique depuis le store Zustand
  const inventory = useCharacterStore((state) => state.getActiveCharacter().inventory) || [];
  const dexValue = useCharacterStore((state) => state.getActiveCharacter().abilities.DEX.value);
  
  // Calcul du modificateur de DEX (ex: 14 -> +2)
  const dexMod = getAbilityModifier(dexValue);

  // Filtrer les objets équipés
  const equippedItems = inventory.filter((item) => item.isEquipped);

  let baseAC = 0;
  let hasArmor = false;
  let maxDexBonus = dexMod; // Par défaut pour armure légère ou sans armure

  // 2. Analyse des objets équipés
  equippedItems.forEach((item) => {
    // Si c'est un bouclier, on cumule (+2 généralement)
    if (item?.categoryEquipment === 'shield') {
      baseAC += item.armorClassBase;
    } 
    // Si c'est une armure corporelle
    else if (item?.categoryEquipment === 'chest' && item?.armorClassBase) {
      hasArmor = true;
      baseAC += item.armorClassBase;
      maxDexBonus = Math.min(dexMod, item?.armorClassMaxBonus || dexMod);
    }
  });
  // 3. Si aucune armure n'est portée, on applique la formule nue (10 + DEX)
  if (!hasArmor) {
    return baseAC + 10 + dexMod;
  }
  // 4. Retourne la CA totale de l'armure + le bonus de DEX autorisé + bouclier éventuel
  return baseAC + maxDexBonus;
};