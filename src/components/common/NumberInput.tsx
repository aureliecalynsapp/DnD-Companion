// src/components/common/NumberInput.tsx
import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { UI } from '../../utils/themes';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  icon?: React.ReactNode;
  step?: number;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min = 0,
  max = 99,
  label,
  icon,
  step = 1,
}) => {
  // Utilitaire pour éviter les erreurs d'arrondi des nombres flottants (ex: 0.2 + 0.1)
  const precision = (step.toString().split('.')[1] || '').length;

  const roundToPrecision = (val: number) => {
    return parseFloat(val.toFixed(precision));
  };

  const handleDecrement = () => {
    if (value > min) {
      const newValue = Math.max(min, roundToPrecision(value - step));
      onChange(newValue);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      const newValue = Math.min(max, roundToPrecision(value + step));
      onChange(newValue);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (isNaN(val)) {
      onChange(min);
    } else {
      onChange(Math.min(max, Math.max(min, val)));
    }
  };

  // Sélectionne tout le texte au focus pour écraser la valeur immédiatement sans effacer
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className={UI.label}>
          {icon}
          {label}
        </label>
      )}
      <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden focus-within:border-blue-500 transition">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className="w-8 h-8 flex items-center justify-center bg-slate-900/60 active:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:active:bg-transparent touch-manipulation select-none shrink-0"
        >
          <Minus className="w-4 h-4" />
        </button>

        <input
          type="number"
          inputMode="decimal"
          step={step}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          className="w-full bg-transparent text-center font-mono font-bold text-white text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className="w-8 h-8 flex items-center justify-center bg-slate-900/60 active:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:active:bg-transparent touch-manipulation select-none shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};