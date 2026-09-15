// src/components/BagTab.tsx
import React, { useState } from 'react';
import { Coins, Backpack, Plus, Minus, Trash2, ArrowRightLeft } from 'lucide-react';
import { useCharacterStore } from '../store/useCharacterStore';
import { TradeModal } from './TradeModal';
import { NumberInput } from './common/NumberInput';
import type { Currency } from '../types/character';

export const BagTab: React.FC = () => {
  const { character, addItem, removeItem, updateItemQuantity, updateCurrency } = useCharacterStore();
  const inventory = character.inventory || [];
  const currency = character.currency || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };

  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [isTradeOpen, setIsTradeOpen] = useState(false);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    addItem({ name: newItemName.trim(), quantity: newItemQty });
    setNewItemName('');
    setNewItemQty(1);
  };

  const currencyLabels: { key: keyof Currency; label: string; color: string }[] = [
    { key: 'cp', label: 'PC', color: 'text-amber-700 border-amber-800/60 bg-amber-950/30' },
    { key: 'sp', label: 'PA', color: 'text-slate-300 border-slate-700/60 bg-slate-900/30' },
    { key: 'ep', label: 'PE', color: 'text-cyan-400 border-cyan-800/60 bg-cyan-950/30' },
    { key: 'gp', label: 'PO', color: 'text-amber-400 border-amber-600/40 bg-amber-950/50' },
    { key: 'pp', label: 'PP', color: 'text-indigo-300 border-indigo-700/60 bg-indigo-950/30' },
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* HEADER + BOUTON D'ÉCHANGE */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Backpack className="w-5 h-5 text-amber-400" />
          Sac à dos
        </h2>
        <button
          onClick={() => setIsTradeOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-semibold active:scale-95 transition-all"
        >
          <ArrowRightLeft className="w-4 h-4" />
          Échange P2P
        </button>
      </div>

      {/* BOURSE (MONNAIE D'AVENTURIER) */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
          <Coins className="w-4 h-4 text-amber-400" />
          Bourse & Pièces
        </h3>
        
        {/* Grille responsive : 2 colonnes sur mobile, 3 sur tablette, 3 sur desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3">
          {currencyLabels.map(({ key, label, color }) => (
            <div key={key} className={`rounded-xl border p-2 ${color}`}>
              <NumberInput
                label={label}
                value={currency[key] || 0}
                max={999999}
                onChange={(newVal) => {
                  const delta = newVal - (currency[key] || 0);
                  updateCurrency({ [key]: delta });
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* AJOUT D'OBJET */}
      <form onSubmit={handleAddItem} className="flex gap-2">
        <input
          type="text"
          placeholder="Nom de l'objet..."
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="flex-grow bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
        />
        <input
          type="number"
          min="1"
          value={newItemQty}
          onChange={(e) => setNewItemQty(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-16 bg-slate-900 border border-slate-800 rounded-xl px-2 py-3 text-sm font-mono text-center text-slate-100 focus:outline-none focus:border-amber-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="submit"
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 rounded-xl font-bold active:scale-95 transition-all flex items-center justify-center"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </form>

      {/* LISTE DE L'INVENTAIRE */}
      <section className="space-y-2">
        {inventory.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs italic bg-slate-900/40 border border-slate-800/50 rounded-2xl">
            Votre sac à dos est vide.
          </div>
        ) : (
          inventory.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-sm"
            >
              <div className="flex-grow pr-3">
                <p className="text-sm font-semibold text-slate-200">{item.name}</p>
                {item.weight && (
                  <p className="text-[10px] text-slate-500">{item.weight * item.quantity} lb</p>
                )}
              </div>

              {/* CONTROLES DE QUANTITÉ TACTILES */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => updateItemQuantity(item.id, -1)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg active:scale-90 transition-transform"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-mono font-bold text-amber-400">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateItemQuantity(item.id, 1)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg active:scale-90 transition-transform"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="p-2.5 text-slate-500 hover:text-red-400 rounded-xl hover:bg-slate-800 active:scale-90 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* MODAL TRADEMODAL */}
      {isTradeOpen && <TradeModal onClose={() => setIsTradeOpen(false)} />}
    </div>
  );
};