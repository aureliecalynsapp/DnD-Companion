// src/store/useCharacterStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Character, Item, Currency } from '../types/character';

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

  // Actions Inventaire
  addItem: (item: Omit<Item, 'id'>) => void;
  removeItem: (id: string) => void;
  updateItemQuantity: (id: string, delta: number) => void;
  updateCurrency: (currency: Partial<Currency>) => void;

  // Action Échange (Réception)
  receiveTrade: (tradeData: { items?: Omit<Item, 'id'>[]; currency?: Partial<Currency> }) => void;
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
  inventory: [
    { id: '1', name: 'Hache à deux mains', quantity: 1, weight: 7 },
    { id: '2', name: 'Rations (1 jour)', quantity: 5, weight: 2 },
  ],
  currency: {
    cp: 0,
    sp: 0,
    ep: 0,
    gp: 3,
    pp: 0,
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
                used: Math.max(0, Math.min(usedCount, state.character.spellSlots[level].max)),
              },
            },
          },
        })),

      // --- INVENTAIRE ---
      addItem: (newItem) =>
        set((state) => ({
          character: {
            ...state.character,
            inventory: [...(state.character.inventory || []), { ...newItem, id: crypto.randomUUID() }],
          },
        })),

      removeItem: (id) =>
        set((state) => ({
          character: {
            ...state.character,
            inventory: (state.character.inventory || []).filter((item) => item.id !== id),
          },
        })),

      updateItemQuantity: (id, delta) =>
        set((state) => ({
          character: {
            ...state.character,
            inventory: (state.character.inventory || [])
              .map((item) => {
                if (item.id === id) {
                  const newQty = item.quantity + delta;
                  return newQty > 0 ? { ...item, quantity: newQty } : null;
                }
                return item;
              })
              .filter(Boolean) as Item[],
          },
        })),

      // --- BOURSE ---
      updateCurrency: (changes) =>
        set((state) => {
          const currentCurrency = state.character.currency || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
          const updatedCurrency = { ...currentCurrency };

          (Object.keys(changes) as (keyof Currency)[]).forEach((coin) => {
            const delta = changes[coin] || 0;
            updatedCurrency[coin] = Math.max(0, (currentCurrency[coin] || 0) + delta);
          });

          return {
            character: {
              ...state.character,
              currency: updatedCurrency,
            },
          };
        }),

      // --- ÉCHANGE P2P (RÉCEPTION DEPUIS QR CODE) ---
        receiveTrade: (tradeData: { items?: Omit<Item, 'id'>[]; currency?: Partial<Currency> }) => {
        set((state) => {
            const updatedInventory = [...(state.character.inventory || [])];

            // 1. Fusion des objets reçus
            if (tradeData.items) {
            tradeData.items.forEach((newItem) => {
                const existingIndex = updatedInventory.findIndex(
                (i) => i.name.toLowerCase().trim() === newItem.name.toLowerCase().trim()
                );

                if (existingIndex >= 0) {
                // L'objet existe déjà -> On cumule la quantité
                updatedInventory[existingIndex] = {
                    ...updatedInventory[existingIndex],
                    quantity: updatedInventory[existingIndex].quantity + newItem.quantity,
                };
                } else {
                // Nouvel objet -> On l'ajoute avec un ID unique
                updatedInventory.push({
                    id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                    name: newItem.name,
                    quantity: newItem.quantity,
                    weight: newItem.weight,
                });
                }
            });
            }

            // 2. Fusion des pièces reçues
            const updatedCurrency = { ...(state.character.currency || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }) };
            if (tradeData.currency) {
            Object.entries(tradeData.currency).forEach(([key, val]) => {
                const k = key as keyof Currency;
                updatedCurrency[k] = (updatedCurrency[k] || 0) + (val || 0);
            });
            }

            return {
            character: {
                ...state.character,
                inventory: updatedInventory,
                currency: updatedCurrency,
            },
            };
        });
        },
    }),
    {
      name: 'dnd-character-storage',
      storage: createJSONStorage(() => localStorage),
      skipHydration: false,
    }
  )
);