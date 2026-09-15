import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Character, Item, Currency } from '../types/character';

// Personnage par défaut pour l'initialisation
const DEFAULT_CHARACTER: Character = {
  id: 'char-default-1',
  name: 'Valeros',
  class: 'Guerrier',
  level: 1,
  race: 'Humain',
  hp: { current: 12, max: 12, temp: 0 },
  /*hitDice: { current: 1, total: 1, dieType: 'd10' },*/
  abilities: {
    STR: { value: 16, proficient: true },
    DEX: { value: 14, proficient: false },
    CON: { value: 15, proficient: true },
    INT: { value: 9, proficient: false },
    WIS: { value: 11, proficient: false },
    CHA: { value: 13, proficient: false },
  },
  spellSlots: {
    1: { max: 4, used: 0 },
    2: { max: 3, used: 0 },
    3: { max: 2, used: 0 },
  },
  inventory: [
    { id: 'item-1', name: 'Épée longue', quantity: 1, weight: 3 },
    { id: 'item-2', name: 'Rations (1 jour)', quantity: 5, weight: 2 },
  ],
  currency: { cp: 10, sp: 5, ep: 0, gp: 15, pp: 0 },
  armorClass : 16,
  initiativeBonus : 0,
  deathSaves: {
    successes: 0,
    failures: 0,
  },
};

interface CharacterStoreState {
  // --- ÉTAT MULTI-PERSONNAGES ---
  characters: Character[];
  activeCharacterId: string;

  // --- GETTER HELPER ---
  getActiveCharacter: () => Character;

  // --- ACTIONS MULTI-PERSONNAGES & SWITCH ---
  setActiveCharacter: (id: string) => void;
  createCharacter: (name?: string) => void;
  deleteCharacter: (id: string) => void;
  importOrUpdateCharacter: (char: Character) => void;
  resetCharacter: () => void;

  // --- ACTIONS LIVE COMBAT & SANTE ---
  updateHp: (delta: number) => void;
  setTempHp: (amount: number) => void;
  /*useHitDice: () => void;*/

  // --- ACTIONS SORTS & EMPLACEMENTS ---
  useSpellSlot: (level: number, delta?: number) => void;

  // --- ACTIONS INVENTAIRE ---
  addItem: (item: Omit<Item, 'id'>) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, delta: number) => void;

  // --- ACTIONS DEVISES / MONNAIE ---
  updateCurrency: (deltaCurrency: Partial<Currency>) => void;

  // --- ACTIONS SESSION & REPOS ---
  longRest: () => void;
  receiveTrade: (payload: { items?: Omit<Item, 'id'>[]; currency?: Partial<Currency> }) => void;
  updateCharacterData: (data: Partial<Character>) => void;
}

export const useCharacterStore = create<CharacterStoreState>()(
  persist(
    (set, get) => {
      // Helper interne pour appliquer une mutation sur le personnage actif
      const updateActive = (mutator: (char: Character) => Partial<Character>) => {
        set((state) => {
          const updatedCharacters = state.characters.map((c) => {
            if (c.id === state.activeCharacterId) {
              return { ...c, ...mutator(c) };
            }
            return c;
          });
          return { characters: updatedCharacters };
        });
      };

      return {
        characters: [DEFAULT_CHARACTER],
        activeCharacterId: 'char-default-1',

        // Helper pour récupérer le perso actif dans le code JSX
        getActiveCharacter: () => {
          const { characters, activeCharacterId } = get();
          return characters.find((c) => c.id === activeCharacterId) || characters[0] || DEFAULT_CHARACTER;
        },

        // --- GESTION DES PERSONNAGES ---
        setActiveCharacter: (id) => set({ activeCharacterId: id }),

        createCharacter: (name = 'Nouveau Héros') => {
          const newChar: Character = {
            ...DEFAULT_CHARACTER,
            id: `char_${Date.now()}`,
            name,
          };
          set((state) => ({
            characters: [...state.characters, newChar],
            activeCharacterId: newChar.id,
          }));
        },

        deleteCharacter: (id) => {
          set((state) => {
            if (state.characters.length <= 1) return state;
            const filtered = state.characters.filter((c) => c.id !== id);
            const nextActive = state.activeCharacterId === id ? filtered[0].id : state.activeCharacterId;
            return {
              characters: filtered,
              activeCharacterId: nextActive,
            };
          });
        },

        importOrUpdateCharacter: (char) => {
          set((state) => {
            const exists = state.characters.some((c) => c.id === char.id);
            let updatedList: Character[];
            if (exists) {
              updatedList = state.characters.map((c) => (c.id === char.id ? char : c));
            } else {
              const importedChar = { ...char, id: char.id || `char_${Date.now()}` };
              updatedList = [...state.characters, importedChar];
              return {
                characters: updatedList,
                activeCharacterId: importedChar.id,
              };
            }
            return {
              characters: updatedList,
              activeCharacterId: char.id,
            };
          });
        },

        resetCharacter: () => {
          updateActive(() => ({ ...DEFAULT_CHARACTER, id: get().activeCharacterId }));
        },

        updateCharacterData: (data) => {
          updateActive(() => data);
        },

        // --- MANIPULATION DES PV & DÉS DE VIE ---
        updateHp: (delta) => {
          updateActive((char) => {
            let { current, temp } = char.hp;
            if (delta < 0) {
              const damage = Math.abs(delta);
              if (temp > 0) {
                if (temp >= damage) {
                  temp -= damage;
                  return { hp: { ...char.hp, temp } };
                } else {
                  const remainingDamage = damage - temp;
                  temp = 0;
                  current = Math.max(0, current - remainingDamage);
                  return { hp: { ...char.hp, current, temp } };
                }
              }
              current = Math.max(0, current - damage);
            } else {
              current = Math.min(char.hp.max, current + delta);
            }
            return { hp: { ...char.hp, current } };
          });
        },

        setTempHp: (amount) => {
          updateActive((char) => ({
            hp: { ...char.hp, temp: Math.max(0, amount) },
          }));
        },

        /*useHitDice: () => {
          updateActive((char) => {
            if (char.hitDice.current <= 0) return {};
            return {
              hitDice: { ...char.hitDice, current: char.hitDice.current - 1 },
            };
          });
        },*/

        // --- SORTS ---
        useSpellSlot: (level: number, delta: number = 1) => {
            updateActive((char) => {
                const currentSlot = char.spellSlots?.[level];
                if (!currentSlot) return char;

                // Calcul du nouvel usage en le bornant entre 0 et max
                const newUsed = Math.min(
                currentSlot.max,
                Math.max(0, currentSlot.used + delta)
                );

                return {
                ...char,
                spellSlots: {
                    ...char.spellSlots,
                    [level]: {
                    ...currentSlot,
                    used: newUsed,
                    },
                },
                };
            });
            },

        /*useSpellSlot: (level) => {
          updateActive((char) => ({
            spellSlots: char.spellSlots.map((slot) =>
              slot.level === level ? { ...slot, current: Math.max(0, slot.current - 1) } : slot
            ),
          }));
        },

        restoreSpellSlot: (level) => {
          updateActive((char) => ({
            spellSlots: char.spellSlots.map((slot) =>
              slot.level === level ? { ...slot, current: Math.min(slot.max, slot.current + 1) } : slot
            ),
          }));
        },*/

        // --- INVENTAIRE ---
        addItem: (newItem) => {
          updateActive((char) => {
            const itemWithId: Item = { ...newItem, id: `item_${Date.now()}` };
            return { inventory: [...char.inventory, itemWithId] };
          });
        },

        removeItem: (itemId) => {
          updateActive((char) => ({
            inventory: char.inventory.filter((i) => i.id !== itemId),
          }));
        },

        updateItemQuantity: (itemId, delta) => {
          updateActive((char) => {
            const updatedInventory = char.inventory
              .map((item) => {
                if (item.id === itemId) {
                  const newQty = item.quantity + delta;
                  return newQty > 0 ? { ...item, quantity: newQty } : null;
                }
                return item;
              })
              .filter(Boolean) as Item[];

            return { inventory: updatedInventory };
          });
        },

        // --- DEVISES ---
        updateCurrency: (deltaCurrency) => {
          updateActive((char) => ({
            currency: {
              cp: Math.max(0, char.currency.cp + (deltaCurrency.cp || 0)),
              sp: Math.max(0, char.currency.sp + (deltaCurrency.sp || 0)),
              ep: Math.max(0, char.currency.ep + (deltaCurrency.ep || 0)),
              gp: Math.max(0, char.currency.gp + (deltaCurrency.gp || 0)),
              pp: Math.max(0, char.currency.pp + (deltaCurrency.pp || 0)),
            },
          }));
        },

        // --- REPOS LONG & ÉCHANGES ---
        longRest: () => {
          updateActive((char) => ({
            hp: { ...char.hp, current: char.hp.max, temp: 0 },
            /*hitDice: { ...char.hitDice, current: char.hitDice.total },*/
            spellSlots: Object.fromEntries(
                Object.entries(char.spellSlots || {}).map(([lvl, slot]) => [
                    lvl,
                    { ...slot, used: 0 },
                ])
                ),
          }));
        },

        receiveTrade: ({ items, currency }) => {
          updateActive((char) => {
            let updatedInventory = [...char.inventory];

            if (items) {
              items.forEach((tradeItem) => {
                const existingIndex = updatedInventory.findIndex(
                  (i) => i.name.toLowerCase() === tradeItem.name.toLowerCase()
                );
                if (existingIndex >= 0) {
                  updatedInventory[existingIndex].quantity += tradeItem.quantity;
                } else {
                  updatedInventory.push({
                    ...tradeItem,
                    id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
                  });
                }
              });
            }

            const updatedCurrency = { ...char.currency };
            if (currency) {
              Object.keys(currency).forEach((k) => {
                const key = k as keyof Currency;
                updatedCurrency[key] = (updatedCurrency[key] || 0) + (currency[key] || 0);
              });
            }

            return { inventory: updatedInventory, currency: updatedCurrency };
          });
        },
      };
    },
    {
      name: 'dnd_companion_characters',
      storage: createJSONStorage(() => localStorage),
    }
  )
);