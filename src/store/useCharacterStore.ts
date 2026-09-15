import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Character } from '../types/character';

export const getModifier = (score: number): number => Math.floor((score - 10) / 2);
export const getProficiencyBonus = (level: number): number => Math.ceil(1 + level / 4);

interface CharacterStore {
  character: Character;
  updateHp: (delta: number) => void;
  setTempHp: (amount: number) => void;
  toggleDeathSave: (type: 'successes' | 'failures', index: number) => void;
  toggleSpellSlot: (level: number, slotIndex: number) => void;
  shortRest: () => void;
  longRest: () => void;
  importCharacter: (data: Character) => void;
  resetCharacter: () => void;
  updateCharacter: (updates: Partial<Character>) => void;
  setSpellSlotUsage: (level: number, usedCount: number) => void;
}

const initialCharacter: Character = {
  name: 'Grog le Destructeur',
  class: 'Barbare',
  level: 5,
  race: 'Demi-Orc',
  hp: { current: 28, max: 35, temp: 0 },
  armorClass: 16,
  initiativeBonus: 2,
  abilities: {
    STR: { value: 18, proficient: true },
    DEX: { value: 14, proficient: false },
    CON: { value: 16, proficient: true },
    INT: { value: 8, proficient: false },
    WIS: { value: 12, proficient: false },
    CHA: { value: 10, proficient: false },
  },
  deathSaves: { successes: 0, failures: 0 },
  spellSlots: {
    1: { max: 4, used: 2 },
    2: { max: 3, used: 1 },
    3: { max: 2, used: 0 },
  },
};

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set) => ({
      character: initialCharacter,

      updateHp: (delta) =>
        set((state) => {
          const { current, max } = state.character.hp;
          const newHp = Math.min(max, Math.max(0, current + delta));
          return {
            character: {
              ...state.character,
              hp: { ...state.character.hp, current: newHp },
            },
          };
        }),

      setTempHp: (amount) =>
        set((state) => ({
          character: {
            ...state.character,
            hp: { ...state.character.hp, temp: Math.max(0, amount) },
          },
        })),

      toggleDeathSave: (type, index) =>
        set((state) => {
          const current = state.character.deathSaves[type];
          const newCount = current === index + 1 ? index : index + 1;
          return {
            character: {
              ...state.character,
              deathSaves: {
                ...state.character.deathSaves,
                [type]: newCount,
              },
            },
          };
        }),

      toggleSpellSlot: (level, slotIndex) =>
        set((state) => {
          const slot = state.character.spellSlots[level];
          if (!slot) return state;
          const isCurrentlyUsed = slotIndex < slot.used;
          const newUsed = isCurrentlyUsed ? slotIndex : slotIndex + 1;

          return {
            character: {
              ...state.character,
              spellSlots: {
                ...state.character.spellSlots,
                [level]: { ...slot, used: newUsed },
              },
            },
          };
        }),

      shortRest: () =>
        set((state) => ({
          character: state.character,
        })),

      longRest: () =>
        set((state) => {
          const resetSlots = { ...state.character.spellSlots };
          Object.keys(resetSlots).forEach((lvl) => {
            resetSlots[Number(lvl)].used = 0;
          });

          return {
            character: {
              ...state.character,
              hp: { ...state.character.hp, current: state.character.hp.max, temp: 0 },
              deathSaves: { successes: 0, failures: 0 },
              spellSlots: resetSlots,
            },
          };
        }),

      importCharacter: (data) => set({ character: data }),

      resetCharacter: () => set({ character: initialCharacter }),

      updateCharacter: (updates) =>
        set((state) => ({
            character: {
            ...state.character,
            ...updates,
            // Recalcule les PV Max si le niveau ou la constitution changent (optionnel)
            hp: updates.hp ? { ...state.character.hp, ...updates.hp } : state.character.hp,
            },
        })),

      setSpellSlotUsage: (level: number, usedCount: number) => 
        set((state) => ({
            character: {
            ...state.character,
            spellSlots: {
                ...state.character.spellSlots,
                [level]: {
                ...state.character.spellSlots[level],
                used: Math.max(0, Math.min(usedCount, state.character.spellSlots[level].max)), // Sécurité min/max
                },
            },
            },
        })),
    }),
    {
      name: 'dnd-character-storage',
      storage: createJSONStorage(() => localStorage),
      skipHydration: false,
    }
  )
);