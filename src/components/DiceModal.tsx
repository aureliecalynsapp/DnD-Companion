import React, { useState } from 'react';
import { X, Dices, RotateCcw } from 'lucide-react';
import { 
  GiDiceSixFacesFour, 
  GiDiceSixFacesSix, 
  GiDiceEightFacesEight, 
  GiDiceTwentyFacesTwenty 
} from 'react-icons/gi';
import { NumberInput } from './common/NumberInput';

interface DiceModalProps {
  onClose: () => void;
}

interface RollResult {
  diceType: number;
  rolls: number[];
  subtotal: number;
}

export const DiceModal: React.FC<DiceModalProps> = ({ onClose }) => {
  // États locaux pour le nombre de dés de chaque type (0 par défaut)
  const [d4, setD4] = useState(0);
  const [d6, setD6] = useState(0);
  const [d8, setD8] = useState(0);
  const [d10, setD10] = useState(0);
  const [d12, setD12] = useState(0);
  const [d20, setD20] = useState(0);

  // État pour stocker le dernier résultat du lancer
  const [rollResult, setRollResult] = useState<{
    total: number;
    details: RollResult[];
  } | null>(null);

  // Fonction pour effectuer le lancer de dés
  const handleRoll = () => {
    const diceConfig = [
      { type: 4, count: d4 },
      { type: 6, count: d6 },
      { type: 8, count: d8 },
      { type: 10, count: d10 },
      { type: 12, count: d12 },
      { type: 20, count: d20 },
    ];

    let totalSum = 0;
    const details: RollResult[] = [];

    diceConfig.forEach(({ type, count }) => {
      if (count > 0) {
        const rolls: number[] = [];
        let subtotal = 0;
        for (let i = 0; i < count; i++) {
          const roll = Math.floor(Math.random() * type) + 1;
          rolls.push(roll);
          subtotal += roll;
        }
        totalSum += subtotal;
        details.push({ diceType: type, rolls, subtotal });
      }
    });

    if (details.length === 0) {
      setRollResult(null);
      return;
    }

    setRollResult({ total: totalSum, details });
  };

  // Réinitialiser tous les dés à 0 et effacer le résultat
  const handleReset = () => {
    setD4(0);
    setD6(0);
    setD8(0);
    setD10(0);
    setD12(0);
    setD20(0);
    setRollResult(null);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col p-3 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))] overflow-hidden animate-in fade-in duration-150">
      
      {/* En-tête de la modale (fixe) */}
      <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-800 shrink-0">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <GiDiceTwentyFacesTwenty className="w-5 h-5 text-amber-400" />
          Lancer de dés
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            title="Réinitialiser"
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-all active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Corps principal : Grille fixe des dés et bouton */}
      <div className="flex flex-col gap-3 shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <NumberInput 
            label="Dés D4" 
            value={d4} 
            onChange={setD4} 
            min={0} 
            max={20} 
            icon={<GiDiceSixFacesFour className="w-3.5 h-3.5 text-blue-400" />} 
          />
          <NumberInput 
            label="Dés D6" 
            value={d6} 
            onChange={setD6} 
            min={0} 
            max={20} 
            icon={<GiDiceSixFacesSix className="w-3.5 h-3.5 text-emerald-400" />} 
          />
          <NumberInput 
            label="Dés D8" 
            value={d8} 
            onChange={setD8} 
            min={0} 
            max={20} 
            icon={<GiDiceEightFacesEight className="w-3.5 h-3.5 text-purple-400" />} 
          />
          <NumberInput 
            label="Dés D10" 
            value={d10} 
            onChange={setD10} 
            min={0} 
            max={20} 
            icon={<span className="font-bold text-xs text-amber-400">D10</span>} 
          />
          <NumberInput 
            label="Dés D12" 
            value={d12} 
            onChange={setD12} 
            min={0} 
            max={20} 
            icon={<span className="font-bold text-xs text-rose-400">D12</span>} 
          />
          <NumberInput 
            label="Dés D20" 
            value={d20} 
            onChange={setD20} 
            min={0} 
            max={20} 
            icon={<GiDiceTwentyFacesTwenty className="w-3.5 h-3.5 text-amber-500" />} 
          />
        </div>

        {/* Bouton d'action principal tactile */}
        <button
          type="button"
          onClick={handleRoll}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-black rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Dices className="w-5 h-5" />
          LANCER LES DÉS
        </button>
      </div>

      {/* Zone de résultat avec scrollbar customisée uniquement sur les détails */}
      {rollResult && (
        <div className="flex-1 min-h-0 bg-slate-900 border border-amber-500/30 rounded-2xl p-3 flex flex-col gap-2 shadow-xl animate-in fade-in duration-200 mt-2">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2 shrink-0">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Résultat Total</span>
            <span className="text-2xl font-black text-amber-400">{rollResult.total}</span>
          </div>

          <div className="flex flex-col flex-1 min-h-0 space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 shrink-0">Détails des lancers</span>
            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700">
              {rollResult.details.map((res) => (
                <div key={res.diceType} className="flex items-center justify-between bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800/80">
                  <span className="text-xs font-bold text-slate-300">
                    D{res.diceType} <span className="text-slate-500 font-normal">({res.rolls.length})</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">
                      [{res.rolls.join(', ')}]
                    </span>
                    <span className="text-xs font-bold font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      = {res.subtotal}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};