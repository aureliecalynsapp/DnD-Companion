import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Character, Item, Currency, SpellcastingAbility } from '../types/character';

// Personnage par défaut pour l'initialisation
const DEFAULT_CHARACTER: Character = {
  id: 'char-default-1',
  name: 'Valeros',
  class: 'Guerrier',
  level: 1,
  race: 'Humain',
  alignment : '',
  xp: 0,
  personality: '',
  ideals: '',
  links: '',
  faults: '',
  age: 30,
  height: 180,
  weight: 80,
  eyes: '',
  skin: '',
  hair: '',
  appearance: '',
  allies: '',
  history: '',
  additionalAbility: '',
  hp: { current: 12, max: 12, temp: 0 },
  hpNote: '',
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
    1: { max: 1, used: 0 },
  },
  spellcastingAbility: 'INT' as const,
  knownSpellIds: [],
  preparedSpellIds: [],
  inventory: [],
  currency: { pc: 10, pa: 5, po: 15, pp: 0 },
  armorClass : 16,
  armorClassNote : '',
  initiativeBonus : 0,
  initiativeBonusNote : '',
  deathSaves: {
    successes: 0,
    failures: 0,
  },
};

interface CharacterStoreState {
  // --- ÉTAT MULTI-PERSONNAGES ---
  characters: Character[];
  activeCharacterId: string;

  // --- ÉTAT ACCESSIBILITÉ / ZOOM ---
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;

  // --- GETTER HELPER ---
  getActiveCharacter: () => Character;
  toggleEquipItem: (itemId: string) => void;

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
  toggleKnownSpell: (spellId: string) => void;
  togglePreparedSpell: (spellId: string) => void;
  setSpellcastingAbility: (ability: SpellcastingAbility) => void;
  setSpellSlotMax: (level: number, max: number) => void;

  // --- ACTIONS INVENTAIRE ---
  addItem: (item: Item) => void;
  removeItem: (itemId: string) => void;
  updateItem: (itemId: string, updatedFields: Partial<Item>) => void;
  updateItemQuantity: (itemId: string, newQuantity: number) => void;
  incrementItemQuantity: (itemId: string, delta: number) => void;

  // --- ACTIONS DEVISES / MONNAIE ---
  updateCurrency: (deltaCurrency: Partial<Currency>) => void;

  // --- ACTIONS SESSION & REPOS ---
  longRest: () => void;
  receiveTrade: (payload: { items?: Item[]; currency?: Partial<Currency> }) => void;
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

        // --- GESTION DU ZOOM GLOBAL ---
        zoomLevel: 100,
        setZoomLevel: (zoom: number) => set({ zoomLevel: zoom }),

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
        // --- RAJOUT : Définir le max d'emplacements par niveau ---
        setSpellSlotMax: (level, max) =>
            set((state) => {
            const activeId = state.activeCharacterId;
            if (!activeId) return state;

            return {
                characters: state.characters.map((char) => {
                if (char.id !== activeId) return char;

                const currentSlots = char.spellSlots || {};
                const slot = currentSlots[level] || { max: 0, used: 0 };

                return {
                    ...char,
                    spellSlots: {
                    ...currentSlots,
                    [level]: { max, used: Math.min(slot.used, max) },
                    },
                };
                }),
            };
            }),

        // --- RAJOUT : Ajouter / Retirer du Grimoire ---
        toggleKnownSpell: (spellId) =>
            set((state) => {
            const activeId = state.activeCharacterId;
            if (!activeId) return state;

            return {
                characters: state.characters.map((char) => {
                if (char.id !== activeId) return char;

                const known = char.knownSpellIds || [];
                const prepared = char.preparedSpellIds || [];
                const isKnown = known.includes(spellId);

                const updatedKnown = isKnown
                    ? known.filter((id) => id !== spellId)
                    : [...known, spellId];

                // Si le sort est retiré du grimoire, on l'enlève aussi des préparés
                const updatedPrepared = isKnown
                    ? prepared.filter((id) => id !== spellId)
                    : prepared;

                return {
                    ...char,
                    knownSpellIds: updatedKnown,
                    preparedSpellIds: updatedPrepared,
                };
                }),
            };
            }),

        // --- RAJOUT : Préparer / Dépréparer un sort ---
        togglePreparedSpell: (spellId) =>
            set((state) => {
            const activeId = state.activeCharacterId;
            if (!activeId) return state;

            return {
                characters: state.characters.map((char) => {
                if (char.id !== activeId) return char;

                const prepared = char.preparedSpellIds || [];
                const isPrepared = prepared.includes(spellId);

                return {
                    ...char,
                    preparedSpellIds: isPrepared
                    ? prepared.filter((id) => id !== spellId)
                    : [...prepared, spellId],
                };
                }),
            };
            }),

        // --- RAJOUT : Caractéristique d'incantation ---
        setSpellcastingAbility: (ability) =>
            set((state) => {
            const activeId = state.activeCharacterId;
            if (!activeId) return state;

            return {
                characters: state.characters.map((char) =>
                char.id === activeId ? { ...char, spellcastingAbility: ability } : char
                ),
            };
            }),

        // --- INVENTAIRE ---
        addItem: (newItem) => {
          updateActive((char) => {
            const itemWithId: Item = { 
              ...newItem, 
              id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
              // On conserve l'id du catalogue s'il est présent dans newItem, sinon undefined
              catalogId: newItem.catalogId || undefined 
            };
            return { inventory: [...char.inventory, itemWithId] };
          });
        },

        removeItem: (itemId) => {
          updateActive((char) => ({
            inventory: char.inventory.filter((i) => i.id !== itemId),
          }));
        },
        // Extrait de useCharacterStore.ts
        updateItem: (itemId: string, updatedFields: Partial<Item>) => {
          updateActive((char) => {
            const updatedInventory = char.inventory.map((item) =>
              item.id === itemId ? { ...item, ...updatedFields } : item
            );
            return { inventory: updatedInventory };
          });
        },

        // Fixe une quantité absolue (ex: saisie directe dans un input)
        updateItemQuantity: (itemId: string, newQuantity: number) => {
          updateActive((char) => {
            const updatedInventory = char.inventory.reduce((acc, item) => {
              if (item.id === itemId) {
                if (item.catalogId && newQuantity <= 0) {
                  return acc; // Suppression si objet du catalogue et qté à 0
                }
                acc.push({ ...item, quantity: Math.max(0, newQuantity) });
              } else {
                acc.push(item);
              }
              return acc;
            }, [] as Item[]);

            return { inventory: updatedInventory };
          });
        },

        // Incrémente ou décrémente la quantité (ex: boutons + / -, achat catalogue)
        incrementItemQuantity: (itemId: string, delta: number) => {
          updateActive((char) => {
            const updatedInventory = char.inventory.reduce((acc, item) => {
              if (item.id === itemId) {
                const newTotal = item.quantity + delta;

                // Si c'est un objet du catalogue et que le total atteint 0 ou moins, on le supprime
                if (item.catalogId && newTotal <= 0) {
                  return acc; 
                }

                acc.push({ ...item, quantity: Math.max(0, newTotal) });
              } else {
                acc.push(item);
              }
              return acc;
            }, [] as Item[]);

            return { inventory: updatedInventory };
          });
        },

        // --- DEVISES ---
        updateCurrency: (deltaCurrency) => {
          updateActive((char) => ({
            currency: {
              pc: Math.max(0, char.currency.pc + (deltaCurrency.pc || 0)),
              pa: Math.max(0, char.currency.pa + (deltaCurrency.pa || 0)),
              po: Math.max(0, char.currency.po + (deltaCurrency.po || 0)),
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

// --- RECEVOIR UN ÉCHANGE P2P (QR CODE) ---
      receiveTrade: ({ items, currency }) => {
        updateActive((char) => {
          let updatedInventory = [...char.inventory];

          if (items) {
            items.forEach((tradeItem) => {
              //console.log("📦 [DEBUG TRADE] Objet reçu :", tradeItem);

              // RÈGLE DE MATCHING :
              // - Si l'objet possède un catalogId (objet du catalogue) -> match sur catalogId
              // - Sinon (objet personnalisé) -> match sur l'id unique
              const existingIndex = updatedInventory.findIndex((i) => {
                if (tradeItem.catalogId) {
                  return i.catalogId === tradeItem.catalogId;
                } else {
                  return i.id === tradeItem.id;
                }
              });

              if (existingIndex >= 0) {
                // Si l'objet existe déjà, on cumule les quantités sur l'élément existant
                updatedInventory[existingIndex] = {
                  ...updatedInventory[existingIndex],
                  quantity: updatedInventory[existingIndex].quantity + tradeItem.quantity,
                };
              } else {
                // Sinon, on ajoute le nouvel objet à l'inventaire
                updatedInventory.push({
                  ...tradeItem,
                  id: tradeItem.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
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






// Dans le corps du store (retour de create) :
toggleEquipItem: (itemId) => {
  updateActive((char) => {
    const targetItem = char.inventory.find((i) => i.id === itemId);
    if (!targetItem) return char;

    const willBeWeared = !targetItem.isEquipped;
    const category = targetItem.categoryEquipment;

    // Met à jour l'inventaire : active/désactive l'objet 
    // et déséquipe les autres objets de la même catégorie (sauf anneaux si cumulables)
    const updatedInventory = char.inventory.map((item) => {
      if (item.id === itemId) {
        return { ...item, isEquipped: willBeWeared };
      }
      if (willBeWeared && category && item.categoryEquipment === category && category !== 'ring') {
        return { ...item, isEquipped: false };
      }
      return item;
    });

    return { inventory: updatedInventory };
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