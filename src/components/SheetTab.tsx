// src/components/SheetTab.tsx
import React from 'react';
import { useCharacterStore, getModifier } from '../store/useCharacterStore';

export const SheetTab: React.FC = () => {
  const character = useCharacterStore((state) => state.character);

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Caractéristiques</h2>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(character.abilities).map(([key, attr]) => {
          const mod = getModifier(attr.value);
          const formatMod = mod >= 0 ? `+${mod}` : `${mod}`;
          return (
            <div key={key} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-400 font-medium block">{key}</span>
                <span className="text-xs text-slate-500 font-mono">Score: {attr.value}</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-amber-400 block leading-none">{formatMod}</span>
                {attr.proficient && (
                  <span className="text-[9px] bg-amber-950 text-amber-300 px-1 rounded border border-amber-800">
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