import React from 'react';
import { Minus, Plus } from 'lucide-react';

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
  const handleDecrement = () => {
    if (value > min) onChange(value - step);
  };

  const handleIncrement = () => {
    if (value < max) onChange(value + step);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
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
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-slate-400 flex items-center gap-1 text-[11px] select-none">
          {icon}
          {label}
        </label>
      )}
      <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden focus-within:border-blue-500 transition">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className="w-10 h-10 flex items-center justify-center bg-slate-900/60 active:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:active:bg-transparent touch-manipulation select-none shrink-0"
        >
          <Minus className="w-4 h-4" />
        </button>

        <input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          className="w-full bg-transparent text-center font-mono font-bold text-white text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className="w-10 h-10 flex items-center justify-center bg-slate-900/60 active:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:active:bg-transparent touch-manipulation select-none shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};