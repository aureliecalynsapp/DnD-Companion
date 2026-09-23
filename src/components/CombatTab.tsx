import React, { useState } from 'react';
import { Shield, Zap, Eye, Minus, Plus, GraduationCap, Sparkles, ChevronDown, Skull, HeartPulse, Check, X, Sword, Swords } from 'lucide-react';
import { useCharacterStore } from '../store/useCharacterStore';
import { getAbilityModifier, getProficiencyBonus, useArmorClass } from '../utils/dnd';
import { getSpellSaveDC, getSpellAttackBonus, getSpellcastingModifier } from '../utils/dnd';
import type { Item, categoryEquipment } from '../types/character';

// Importation depuis la sous-bibliothèque Game Icons de react-icons
import { 
  GiVisoredHelm,  // Casque / Tête
  GiChestArmor,   // Plastron / Torse
  GiBroadsword,   // Arme
  GiRoundShield,  // Bouclier
  GiBoots,        // Bottes / Pieds
  GiRing,          // Anneau / Bijou
  GiEmeraldNecklace,
  GiQuiver,
  //GiDiceSixFacesFour, //d4
  //GiDiceSixFacesSix, //d6
  //GiDiceEightFacesEight, //d8
  //GiDiceTwentyFacesTwenty, //d20
} from 'react-icons/gi';

interface EquipmentSlotConfig {
  id: categoryEquipment;
  label: string;
  icon: React.ElementType;
  gridClass?: string;
}

export const CombatTab: React.FC = () => {
  // Configuration des emplacements basée directement sur l'enum categoryEquipment
  const EQUIPMENT_SLOTS: EquipmentSlotConfig[] = [
    { id: 'necklace', label: 'Amulette', icon: GiEmeraldNecklace },
    { id: 'head', label: 'Tête', icon: GiVisoredHelm },
    { id: 'quiver', label: 'Carquois', icon: GiQuiver },
    { id: 'shield', label: 'Bouclier', icon: GiRoundShield },
    { id: 'chest', label: 'Torse', icon: GiChestArmor },
    { id: 'weapon', label: 'Arme', icon: GiBroadsword },
    { id: 'ring', label: 'Anneau', icon: GiRing },
    { id: 'feet', label: 'Pieds', icon: GiBoots, gridClass: 'col-start-2' }, // Centrage parfait sur la grille 3 colonnes
  ];

  // Récupération sécurisée de l'inventaire du personnage actif via le store Zustand
  const inventory = useCharacterStore((state) => state.getActiveCharacter().inventory) || [];
  const toggleEquipItem = useCharacterStore((state) => state.toggleEquipItem);
  const [activeSlot, setActiveSlot] = useState<EquipmentSlotConfig | null>(null);

  // Recherche de l'objet actuellement équipé pour une catégorie donnée
  const getEquippedItemForSlot = (category: categoryEquipment): Item | undefined => {
    return inventory.find((item) => item.isEquipped && item.categoryEquipment === category);
  };

  // --- ÉTATS GLOBAUX (Zustand) ---
  const character = useCharacterStore((state) => state.getActiveCharacter());
  const updateHp = useCharacterStore((state) => state.updateHp);
  const updateCharacterData = useCharacterStore((state) => state.updateCharacterData);
  const useSpellSlot = useCharacterStore((state) => state.useSpellSlot);

  // --- ÉTATS LOCAUX DE NAVIGATION & PLIAGE ---
  const [isDeathSavesOpen, setIsDeathSavesOpen] = useState(false); // Fermé par défaut
  const [isActifEquipmentOpen, setIsActifEquipmentOpen] = useState(false); // Fermé par défaut
  const [isSpellSlotsOpen, setIsSpellSlotsOpen] = useState(true);   // Ouvert par défaut

  if (!character) return null;

  // --- CALCULS DE STATS DE COMBAT & MAGIE ---
  const pb = getProficiencyBonus(character.level || 1);
  const wisScore = character.abilities?.WIS?.value ?? 10;
  const isWisProficient = character.abilities?.WIS?.proficient ?? false;
  const wisMod = getAbilityModifier(wisScore);
  
  const dexScore = character.abilities?.DEX?.value ?? 10;
  const dexMod = getAbilityModifier(dexScore);  
  const passivePerception = 10 + wisMod + (isWisProficient ? pb : 0);
  const armorClass = useArmorClass();
  
  const initiativeBonus = dexMod;
  const deathSaves = character.deathSaves || { successes: 0, failures: 0 };
  
  const spellMod = getSpellcastingModifier(character);
  const spellDC = getSpellSaveDC(character);
  const spellAttack = getSpellAttackBonus(character);

  // Gestion des sauvegardes de mort (bascule des points de succès/échec)
  const handleToggleDeathSave = (type: 'successes' | 'failures', index: number) => {
    const currentCount = deathSaves[type];
    const newCount = index < currentCount ? index : index + 1;
    updateCharacterData({
      deathSaves: {
        ...deathSaves,
        [type]: newCount,
      },
    });
  };
    
  // Récupération et tri des emplacements de sorts par niveau
  const spellEntries = Object.entries(character.spellSlots || {})
    .map(([lvl, slot]) => ({
      level: Number(lvl),
      max: Math.min(slot.max, 9),
      used: slot.used,
    }))
    .filter((slot) => slot.max > 0)
    .sort((a, b) => a.level - b.level);

  return (
    <div className="h-full flex flex-col gap-2 overflow-y-auto pr-1 pb-0.5 scrollbar-thin scrollbar-thumb-slate-700">

      <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl relative">
          <button
            type="button"
            onClick={() => setIsActifEquipmentOpen(!isActifEquipmentOpen)}
            className="w-full flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors">
                Équipement Actif
              </h2>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                isActifEquipmentOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isActifEquipmentOpen && (
            <div className="mt-2">
              {/* Grille 3 colonnes optimisée mobile-first */}
              <div className="grid grid-cols-3 gap-1">
                {EQUIPMENT_SLOTS.map((slot) => {
                  const IconComponent = slot.icon;
                  const equippedItem = getEquippedItemForSlot(slot.id);
                  const isEquipped = !!equippedItem;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setActiveSlot(slot)}
                      className={`flex items-center gap-1 p-2 rounded-xl border text-left transition-all active:scale-95 ${
                        slot.gridClass || ''
                      } ${
                        isEquipped
                          ? 'bg-slate-800/90 border-amber-500/50 text-white shadow-sm'
                          : 'bg-slate-950/40 border-slate-800/60 text-slate-600 hover:border-slate-700'
                      }`}
                    >
                      {/* Conteneur d'icône adaptatif */}
                      <div className={`p-1.5 rounded-lg text-lg flex items-center justify-center shrink-0 ${
                        isEquipped ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-900 text-slate-700'
                      }`}>
                        <IconComponent />
                      </div>

                      {/* Libellé et nom de l'objet équipé */}
                      <div className="flex flex-col min-w-0">
                          {/* Le libellé prend toute la largeur si non équipé, sinon 1 colonne */}
                          <span className={`text-[9px] uppercase tracking-wider font-bold text-slate-500`}>
                            {slot.label}
                          </span>
                          
                          {/* Affichage des dés 1 main / 2 mains si l'objet est équipé */}
                          {isEquipped && equippedItem.onHandeddamageDice && (
                            <div className="grid grid-cols-2 gap-1 items-center">
                              <span className="text-xl font-black text-white">
                                <Sword className="w-3 h-3 text-amber-400 shrink-0" />
                                <span>{equippedItem?.onHandeddamageDice || '-'}</span>
                              </span>
                              <span className="text-xl font-black text-white">
                                <Swords className="w-3 h-3 text-amber-400 shrink-0" />
                                <span>{equippedItem?.twoHandeddamageDice || '-'}</span>
                              </span>
                            </div>
                          )}
                          {/* Affichage des munitions si l'objet est un carquois */}
                          {isEquipped && equippedItem.categoryEquipment === "quiver" && (
                            <div className="text-xl font-black text-white">
                                <span>{equippedItem?.quantity || '-'}</span>
                            </div>
                          )}

                        {/* Nom de l'objet ou état vide */}
                        <span className={`text-xs truncate ${isEquipped ? 'text-slate-200 font-medium' : 'italic text-slate-600'}`}>
                          {equippedItem ? equippedItem.name : 'Vide'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

            {/* MODALE DE SÉLECTION RAPIDE DEPUIS LE SAC */}
            {activeSlot && (
              <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-sm p-3 rounded-2xl flex flex-col animate-in fade-in duration-150">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-amber-400">
                    Équiper : {activeSlot.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveSlot(null)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Liste filtrée des objets correspondants dans l'inventaire */}
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {inventory.filter((item) => item.categoryEquipment === activeSlot.id).length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs italic">
                      Aucun objet disponible dans le sac pour cette catégorie.
                    </div>
                  ) : (
                    inventory
                      .filter((item) => item.categoryEquipment === activeSlot.id)
                      .map((item) => {
                        const isCurrentEquipped = item.isEquipped;

                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              toggleEquipItem(item.id);
                              setActiveSlot(null); // Fermeture automatique après sélection au pouce
                            }}
                            className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
                              isCurrentEquipped
                                ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                          <div className="flex items-center justify-between gap-2 w-full min-w-0">
                            <span className="text-xs font-bold text-slate-200 truncate flex-1 min-w-0">{item.name}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">Qté : {item.quantity}</span>
                            {item.armorClassBase && (
                              <span className="text-[10px] font-mono text-slate-300"> CA : {item.armorClassBase}</span>
                            )}
                            {item.armorClassDexBonus && !item.armorClassMaxBonus && (
                              <span className="text-[10px] font-mono text-slate-300"> + {dexMod}</span>
                            )}
                            {item.armorClassMaxBonus && (
                              <span className="text-[10px] font-mono text-slate-300"> + {item.armorClassMaxBonus}</span>
                            )}
                            {item.onHandeddamageDice && (
                              <div className="flex items-center gap-1.5 shrink-0 bg-slate-950/40 px-2 py-0.5 rounded border border-slate-800">
                                <div className="flex items-center gap-0.5">
                                  <Sword className="w-3 h-3 text-amber-400 shrink-0" />
                                  <span className="text-[10px] font-mono text-slate-300">
                                    {item.onHandeddamageDice}
                                  </span>
                                </div>
                                {item.twoHandeddamageDice && (
                                  <div className="flex items-center gap-0.5 border-l border-slate-800 pl-1.5">
                                    <Swords className="w-3 h-3 text-amber-400 shrink-0" />
                                    <span className="text-[10px] font-mono text-slate-300">
                                      {item.twoHandeddamageDice}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                            {isCurrentEquipped && (
                              <span className="p-1 bg-amber-500 text-slate-950 rounded-full shrink-0">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            )}
      </div>

      {/* ================= STATS CLÉS (CARTES INSTANTANÉES) ================= */}
      <div className="grid grid-cols-3 gap-2 shrink-0">
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-2 text-center flex flex-col items-center justify-center shadow-lg">
          <Shield className="w-5 h-5 text-blue-400 mb-1" />
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-0.5">Armure</span>
          <span className="text-2xl font-black text-white">{armorClass}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-2 text-center flex flex-col items-center justify-center shadow-lg">
          <Zap className="w-5 h-5 text-amber-400 mb-1" />
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-0.5">Initiative</span>
          <span className="text-2xl font-black text-white">
            {initiativeBonus >= 0 ? `+${initiativeBonus}` : initiativeBonus}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-2 text-center flex flex-col items-center justify-center shadow-lg">
          <Eye className="w-5 h-5 text-emerald-400 mb-1" />
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-0.5">Perception</span>
          <span className="text-2xl font-black text-white">{passivePerception}</span>
        </div>
      </div>

      {/* ================= AJUSTEMENT PV TACTILE ================= */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-2 space-y-2 shadow-lg shrink-0">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-red-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Ajuster les PV</h2>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <button 
            type="button"
            onClick={() => updateHp(-5)} 
            className="bg-red-950/40 hover:bg-red-950/60 border border-red-900/60 text-red-300 active:scale-95 py-3 rounded-xl font-bold text-base flex items-center justify-center gap-0.5 transition-all"
          >
            <Minus className="w-3.5 h-3.5" />5
          </button>
          <button 
            type="button"
            onClick={() => updateHp(-1)} 
            className="bg-red-950/40 hover:bg-red-950/60 border border-red-900/60 text-red-300 active:scale-95 py-3 rounded-xl font-bold text-base flex items-center justify-center gap-0.5 transition-all"
          >
            <Minus className="w-3.5 h-3.5" />1
          </button>
          <button 
            type="button"
            onClick={() => updateHp(1)} 
            className="bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-900/60 text-emerald-300 active:scale-95 py-3 rounded-xl font-bold text-base flex items-center justify-center gap-0.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />1
          </button>
          <button 
            type="button"
            onClick={() => updateHp(5)} 
            className="bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-900/60 text-emerald-300 active:scale-95 py-3 rounded-xl font-bold text-base flex items-center justify-center gap-0.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />5
          </button>
        </div>
      </div>

      {/* ================= SAUVEGARDES DE MORT (PLIABLE) ================= */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-2 space-y-2 shadow-lg shrink-0">
        <button
          type="button"
          onClick={() => setIsDeathSavesOpen(!isDeathSavesOpen)}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Skull className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-colors" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors">
              Sauvegardes de Mort
            </h2>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isDeathSavesOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isDeathSavesOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 animate-in fade-in duration-200">
            <div className="flex justify-between items-center bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
              <span className="text-xs font-semibold text-emerald-400">Succès</span>
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <button 
                    key={i} 
                    type="button"
                    onClick={() => handleToggleDeathSave('successes', i)}
                    className={`w-6 h-6 rounded-full border transition-all active:scale-90 ${
                      i < deathSaves.successes 
                        ? 'bg-emerald-500 border-emerald-400 shadow-sm shadow-emerald-500/50' 
                        : 'border-slate-700 bg-slate-900'
                    }`} 
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
              <span className="text-xs font-semibold text-red-400">Échecs</span>
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <button 
                    key={i} 
                    type="button"
                    onClick={() => handleToggleDeathSave('failures', i)}
                    className={`w-6 h-6 rounded-full border transition-all active:scale-90 ${
                      i < deathSaves.failures 
                        ? 'bg-red-500 border-red-400 shadow-sm shadow-red-500/50' 
                        : 'border-slate-700 bg-slate-900'
                    }`} 
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= STATISTIQUES DE SORT (MOD, DD, ATT) ================= */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-2 flex items-center justify-between gap-2 shadow-lg shrink-0">
        <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800/60 shrink-0 text-xs font-bold text-slate-200">
          <GraduationCap className="w-4 h-4 text-blue-400 shrink-0" /> 
          <span>{character.spellcastingAbility || 'Aucune'}</span>                
        </div>

        {character.spellcastingAbility && character.spellcastingAbility !== 'NONE' ? (
          <div className="grid grid-cols-3 gap-2 flex-1">
            <div className="flex flex-col items-center justify-center bg-slate-950/60 py-1.5 px-1 rounded-xl border border-slate-800/60">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Mod.</span>
              <span className="text-xl font-black text-white">
                {spellMod >= 0 ? `+${spellMod}` : spellMod}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center bg-slate-950/60 py-1.5 px-1 rounded-xl border border-slate-800/60">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">DD</span>
              <span className="text-xl font-black text-white">
                {spellDC}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center bg-slate-950/60 py-1.5 px-1 rounded-xl border border-slate-800/60">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Att.</span>
              <span className="text-xl font-black text-white">
                {spellAttack >= 0 ? `+${spellAttack}` : spellAttack}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1 text-center text-xs text-slate-500 italic">
            Pas de caractéristique magique configurée
          </div>
        )}
      </div>

      {/* ================= EMPLACEMENTS DES SORTS (PLIABLE) ================= */}
      {spellEntries.length > 0 && (
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-2 space-y-3 shadow-lg shrink-0">
          <button
            type="button"
            onClick={() => setIsSpellSlotsOpen(!isSpellSlotsOpen)}
            className="w-full flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors">
                Emplacements des Sorts
              </h2>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                isSpellSlotsOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isSpellSlotsOpen && (
            <div className="grid grid-cols-3 gap-0.5 pt-1 animate-in fade-in duration-200">
              {spellEntries.map(({ level, max, used }) => {
                const remaining = Math.max(0, max - used);
                return (
                  <div key={level} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-1 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-2">
                      <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-bold">
                        Niv. {level}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        <strong className={remaining > 0 ? 'text-blue-400 font-bold' : 'text-slate-500'}>
                          {remaining}
                        </strong>
                        /{max}
                      </span>
                    </div>
                    {/* Grille de cases carrées avec un border-radius modéré (rounded-lg) */}
                    <div className="grid grid-cols-3 gap-1 justify-items-center">
                      {Array.from({ length: max }).map((_, index) => {
                        const isUsed = index < used;
                        return (
                          <button
                            key={index}
                            onClick={() => useSpellSlot(level, isUsed ? -1 : 1)}
                            type="button"
                            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all active:scale-90 ${
                              isUsed
                                ? 'bg-slate-900/60 border-slate-800 text-slate-700'
                                : 'bg-blue-950/40 hover:bg-blue-950/60 border-blue-500/40 text-blue-400 shadow-sm'
                            }`}
                          >
                            <Sparkles className={`w-4 h-4 ${isUsed ? 'opacity-20' : 'opacity-100'}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};