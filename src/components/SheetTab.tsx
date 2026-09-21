import React from 'react';
import { useCharacterStore } from '../store/useCharacterStore';
import { getAbilityModifier } from '../utils/dnd';
import { ABILITIES_INFO } from '../constants/abilities';

export const SheetTab: React.FC = () => {
  // Récupération dynamique du personnage actif
  const character = useCharacterStore((state) => state.getActiveCharacter());
  
  // Sécurisation contre l'absence temporaire du dictionnaire d'attributs
  const abilities = character.abilities || {
    STR: { value: 10, proficient: false },
    DEX: { value: 10, proficient: false },
    CON: { value: 10, proficient: false },
    INT: { value: 10, proficient: false },
    WIS: { value: 10, proficient: false },
    CHA: { value: 10, proficient: false },
  };

  return (
    <div className="space-y-2 pb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Caractéristiques
        </h2>
        <span className="text-[10px] text-slate-500 italic">JdS = Jet de Sauvegarde</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(abilities).map(([key, attr]) => {
          const mod = getAbilityModifier(attr.value);
          const formatMod = mod >= 0 ? `+${mod}` : `${mod}`;
          const info = ABILITIES_INFO[key] || { fullLabel: key, description: '' };

          return (
            <div 
              key={key} 
              title={info.description}
              className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex justify-between items-center shadow-sm hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-bold text-slate-200 block">{key}</span>
                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-[70px]">
                    ({info.fullLabel})
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-mono">Score: {attr.value}</span>
              </div>

              <div className="text-right shrink-0">
                <span className="text-2xl font-black text-amber-400 block leading-none">{formatMod}</span>
                {attr.proficient && (
                  <span className="text-[9px] bg-amber-950/80 text-amber-300 px-1.5 py-0.5 rounded border border-amber-800/80 mt-1 inline-block font-semibold">
                    JdS
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};