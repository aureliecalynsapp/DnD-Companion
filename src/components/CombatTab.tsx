// src/components/CombatTab.tsx
import React from 'react';
import { Shield, Zap, Eye, Minus, Plus } from 'lucide-react';
import { useCharacterStore, getModifier, getProficiencyBonus } from '../store/useCharacterStore';

export const CombatTab: React.FC = () => {
  const character = useCharacterStore((state) => state.character);
  const updateHp = useCharacterStore((state) => state.updateHp);
  const toggleDeathSave = useCharacterStore((state) => state.toggleDeathSave);

  const pb = getProficiencyBonus(character.level);
  const wisMod = getModifier(character.abilities.WIS.value);
  const passivePerception = 10 + wisMod + (character.abilities.WIS.proficient ? pb : 0);
  //const passivePerception = 10 + wisMod + (character.skills?.perception?.proficient ? pb : 0);

  return (
    <div className="space-y-4">
      {/* Stats Clés (Combat Instantané) */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center flex flex-col items-center justify-center">
          <Shield className="w-5 h-5 text-blue-400 mb-1" />
          <span className="text-2xl font-black text-white">{character.armorClass}</span>
          <span className="text-[10px] uppercase font-semibold text-slate-400">Armure (CA)</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center flex flex-col items-center justify-center">
          <Zap className="w-5 h-5 text-amber-400 mb-1" />
          <span className="text-2xl font-black text-white">+{character.initiativeBonus}</span>
          <span className="text-[10px] uppercase font-semibold text-slate-400">Initiative</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center flex flex-col items-center justify-center">
          <Eye className="w-5 h-5 text-emerald-400 mb-1" />
          <span className="text-2xl font-black text-white">{passivePerception}</span>
          <span className="text-[10px] uppercase font-semibold text-slate-400">Perception</span>
        </div>
      </div>

      {/* Ajustement PV Tactile */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Ajuster les PV</h2>
        <div className="grid grid-cols-4 gap-2">
          <button 
            onClick={() => updateHp(-5)} 
            className="bg-red-950/80 border border-red-800 text-red-200 active:bg-red-900 py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-0.5"
          >
            <Minus className="w-4 h-4" />5
          </button>
          <button 
            onClick={() => updateHp(-1)} 
            className="bg-red-950/80 border border-red-800 text-red-200 active:bg-red-900 py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-0.5"
          >
            <Minus className="w-4 h-4" />1
          </button>
          <button 
            onClick={() => updateHp(1)} 
            className="bg-emerald-950/80 border border-emerald-800 text-emerald-200 active:bg-emerald-900 py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-0.5"
          >
            <Plus className="w-4 h-4" />1
          </button>
          <button 
            onClick={() => updateHp(5)} 
            className="bg-emerald-950/80 border border-emerald-800 text-emerald-200 active:bg-emerald-900 py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-0.5"
          >
            <Plus className="w-4 h-4" />5
          </button>
        </div>
      </div>

      {/* Sauvegardes de Mort */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sauvegardes de Mort</h2>
        <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-sm text-emerald-400 font-medium">Succès</span>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <button 
                key={i} 
                onClick={() => toggleDeathSave('successes', i)}
                className={`w-7 h-7 rounded-full border transition-colors ${
                  i < character.deathSaves.successes 
                    ? 'bg-emerald-500 border-emerald-400' 
                    : 'border-slate-700 bg-slate-800'
                }`} 
              />
            ))}
          </div>
        </div>
        <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-sm text-red-400 font-medium">Échecs</span>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <button 
                key={i} 
                onClick={() => toggleDeathSave('failures', i)}
                className={`w-7 h-7 rounded-full border transition-colors ${
                  i < character.deathSaves.failures 
                    ? 'bg-red-500 border-red-400' 
                    : 'border-slate-700 bg-slate-800'
                }`} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};