// src/components/SpellsTab.tsx
import React from 'react';
import { Sparkles } from 'lucide-react';
import { useCharacterStore } from '../store/useCharacterStore';

export const SpellsTab: React.FC = () => {
  const character = useCharacterStore((state) => state.character);
  const setSpellSlotUsage = useCharacterStore((state) => state.setSpellSlotUsage); // <-- Modifié dans le store (voir point 7)

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Emplacements de Sorts</h2>
      {Object.entries(character.spellSlots).map(([lvlStr, slot]) => {
        const level = Number(lvlStr);
        return (
          <div key={level} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-blue-300">Niveau {level}</span>
              <span className="text-xs text-slate-400 font-mono">{slot.max - slot.used} / {slot.max} restants</span>
            </div>
            <div className="flex gap-3 pt-1">
              {Array.from({ length: slot.max }).map((_, sIdx) => {
                const isUsed = sIdx < slot.used;
                return (
                  <button
                    key={sIdx}
                    // <-- AJOUT : Logique de clic rapide. S'il clique sur le dernier utilisé, on l'enlève, sinon on remplit jusqu'ici.
                    onClick={() => setSpellSlotUsage(level, (isUsed && sIdx === slot.used - 1) ? sIdx : sIdx + 1)}
                    className={`flex-1 h-12 rounded-xl border flex items-center justify-center transition-all ${
                      isUsed 
                        ? 'bg-slate-950 border-slate-800 text-slate-700' 
                        : 'bg-blue-600/20 border-blue-500 text-blue-400 active:bg-blue-600/40'
                    }`}
                  >
                    <Sparkles className={`w-5 h-5 ${isUsed ? 'opacity-20' : 'opacity-100'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};