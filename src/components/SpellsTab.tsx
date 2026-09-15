// src/components/SpellsTab.tsx
import React from 'react';
import { Sparkles } from 'lucide-react';
import { useCharacterStore } from '../store/useCharacterStore';

export const SpellsTab: React.FC = () => {
  const character = useCharacterStore((state) => state.getActiveCharacter());
  const useSpellSlot = useCharacterStore((state) => state.useSpellSlot);

  if (!character) return null;

  // Extraction et tri numérique explicite des niveaux > 0
  const spellEntries = Object.entries(character.spellSlots || {})
    .map(([lvl, slot]) => ({
      level: Number(lvl),
      max: slot.max,
      used: slot.used, // ✅ Lecture de la bonne propriété used
    }))
    .filter((slot) => slot.max > 0)
    .sort((a, b) => a.level - b.level);

  if (spellEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 border border-dashed border-slate-800 rounded-2xl bg-slate-900/40 mt-4">
        <Sparkles className="w-10 h-10 mb-3 text-slate-600" />
        <p className="font-semibold text-slate-300 text-sm">Aucun emplacement de sort</p>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Modifiez votre fiche de personnage pour ajouter des emplacements de sorts de niveau 1 à 9.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
        Emplacements de sorts
      </h2>

      {spellEntries.map(({ level, max, used }) => {
        const remaining = Math.max(0, max - used);

        const handleSlotToggle = (slotIndex: number) => {
          // Un clic sur un slot déjà consommé le recouvre (-1 used)
          // Un clic sur un slot actif le consomme (+1 used)
          if (slotIndex < used) {
            useSpellSlot(level, -1);
          } else {
            useSpellSlot(level, 1);
          }
        };

        return (
          <div
            key={level}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-slate-200 text-sm">
                Niveau {level}
              </h3>
              <span className="text-xs font-mono text-slate-400">
                <strong className={remaining > 0 ? "text-blue-400 font-bold" : "text-slate-500"}>
                  {remaining}
                </strong> / {max} restants
              </span>
            </div>

            {/* Grille tactile adaptative */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
              {Array.from({ length: max }).map((_, index) => {
                const isUsed = index < used;

                return (
                  <button
                    key={index}
                    onClick={() => handleSlotToggle(index)}
                    type="button"
                    className={`h-14 rounded-xl border flex items-center justify-center transition-all duration-150 active:scale-95 ${
                      isUsed
                        ? 'bg-slate-950/80 border-slate-800/80 text-slate-700 shadow-inner'
                        : 'bg-blue-950/40 border-blue-500/50 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                    }`}
                  >
                    <Sparkles
                      className={`w-5 h-5 transition-opacity ${
                        isUsed ? 'opacity-15' : 'opacity-100 drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]'
                      }`}
                    />
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