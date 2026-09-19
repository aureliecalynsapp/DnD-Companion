import React, { useState } from 'react';
import { Shield, Zap, Eye, Minus, Plus, GraduationCap, Sparkles, ChevronDown, Skull, HeartPulse } from 'lucide-react';
import { useCharacterStore } from '../store/useCharacterStore';
import { getAbilityModifier, getProficiencyBonus } from '../utils/dnd';
import { getSpellSaveDC, getSpellAttackBonus, getSpellcastingModifier } from '../utils/dnd';

export const CombatTab: React.FC = () => {
  // --- ÉTATS GLOBAUX (Zustand) ---
  const character = useCharacterStore((state) => state.getActiveCharacter());
  const updateHp = useCharacterStore((state) => state.updateHp);
  const updateCharacterData = useCharacterStore((state) => state.updateCharacterData);
  const useSpellSlot = useCharacterStore((state) => state.useSpellSlot);

  // --- ÉTATS LOCAUX DE NAVIGATION & PLIAGE ---
  const [isDeathSavesOpen, setIsDeathSavesOpen] = useState(false); // Fermé par défaut
  const [isSpellSlotsOpen, setIsSpellSlotsOpen] = useState(true);   // Ouvert par défaut

  if (!character) return null;

  // --- CALCULS DE STATS DE COMBAT & MAGIE ---
  const pb = getProficiencyBonus(character.level || 1);
  const wisScore = character.abilities?.WIS?.value ?? 10;
  const isWisProficient = character.abilities?.WIS?.proficient ?? false;
  const wisMod = getAbilityModifier(wisScore);
  
  const passivePerception = 10 + wisMod + (isWisProficient ? pb : 0);
  const armorClass = character.armorClass ?? 10;
  
  const dexScore = character.abilities?.DEX?.value ?? 10;
  const initiativeBonus = character.initiativeBonus ?? getAbilityModifier(dexScore);

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
    <div className="h-full flex flex-col gap-3 overflow-y-auto pr-1 pb-24 scrollbar-thin scrollbar-thumb-slate-700">
      
      {/* ================= STATS CLÉS (CARTES INSTANTANÉES) ================= */}
      <div className="grid grid-cols-3 gap-2 shrink-0">
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-3 text-center flex flex-col items-center justify-center shadow-lg">
          <Shield className="w-5 h-5 text-blue-400 mb-1" />
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-0.5">Armure</span>
          <span className="text-2xl font-black text-white">{armorClass}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-3 text-center flex flex-col items-center justify-center shadow-lg">
          <Zap className="w-5 h-5 text-amber-400 mb-1" />
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-0.5">Initiative</span>
          <span className="text-2xl font-black text-white">
            {initiativeBonus >= 0 ? `+${initiativeBonus}` : initiativeBonus}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-3 text-center flex flex-col items-center justify-center shadow-lg">
          <Eye className="w-5 h-5 text-emerald-400 mb-1" />
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-0.5">Perception</span>
          <span className="text-2xl font-black text-white">{passivePerception}</span>
        </div>
      </div>

      {/* ================= AJUSTEMENT PV TACTILE ================= */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 space-y-3 shadow-lg shrink-0">
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
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 space-y-3 shadow-lg shrink-0">
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
      <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-2xl flex items-center justify-between gap-2 shadow-lg shrink-0">
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
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-1 space-y-3 shadow-lg shrink-0">
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