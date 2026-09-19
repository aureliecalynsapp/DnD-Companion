import React, { useState } from 'react';
import { Coins, Backpack, Plus, Minus, Trash2, ArrowRightLeft, ChevronDown, AlertTriangle } from 'lucide-react';
import { useCharacterStore } from '../store/useCharacterStore';
import { TradeModal } from './TradeModal';
import { NumberInput } from './common/NumberInput';
import type { Currency } from '../types/character';

export const BagTab: React.FC = () => {
  // Récupération dynamique du personnage actif et des actions
  const character = useCharacterStore((state) => state.getActiveCharacter());
  const addItem = useCharacterStore((state) => state.addItem);
  const removeItem = useCharacterStore((state) => state.removeItem);
  const updateItemQuantity = useCharacterStore((state) => state.updateItemQuantity);
  const updateCurrency = useCharacterStore((state) => state.updateCurrency);

  const inventory = character.inventory || [];
  const currency = character.currency || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
  
  // Récupération de la Force pour calculer la capacité maximale (Force * 15 lb)
  const strength = character.abilities?.STR?.value || 10;
  const maxWeight = strength * 15;

  // Calcul du poids de la monnaie (50 pièces = 1 lb)
  const totalCoins = Object.values(currency).reduce((sum, qty) => sum + (qty || 0), 0);
  const coinsWeight = Number((totalCoins / 50).toFixed(1));

  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  
  // État local pour plier/déplier la bourse (fermée par défaut)
  const [isBourseOpen, setIsBourseOpen] = useState(false);
  
  // État local pour plier/déplier le sac (ouvert par défaut)
  const [isBagOpen, setIsBagOpen] = useState(true);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    addItem({ name: newItemName.trim(), quantity: newItemQty });
    setNewItemName('');
    setNewItemQty(1);
  };

  // Calcul du poids total de l'inventaire (Objets + Monnaie)
  const itemsWeight = inventory.reduce((sum, item) => {
    const itemWeight = item.weight || 0;
    return sum + itemWeight * item.quantity;
  }, 0);

  const totalWeight = Number((itemsWeight + coinsWeight).toFixed(1));
  const isOverloaded = totalWeight > maxWeight;

  const currencyLabels: { key: keyof Currency; label: string; color: string }[] = [
    { key: 'cp', label: 'Pièce Cuivre', color: 'text-amber-700 border-amber-800/60 bg-amber-950/30' },
    { key: 'ep', label: 'Pièce Électrum', color: 'text-cyan-400 border-cyan-800/60 bg-cyan-950/30' },
    { key: 'sp', label: 'Pièce Argent', color: 'text-slate-300 border-slate-700/60 bg-slate-900/30' },
    { key: 'gp', label: 'Pièce Or', color: 'text-amber-400 border-amber-600/40 bg-amber-950/50' },
    { key: 'pp', label: 'Pièce Platine', color: 'text-indigo-300 border-indigo-700/60 bg-indigo-950/30' },
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* HEADER + BOUTON D'ÉCHANGE */}
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Backpack className="w-5 h-5 text-amber-400" />
          Sac à dos
        </h2>
            {/* BADGE DE POIDS DYNAMIQUE (ROUGE SI SURCHARGÉ) */}
            <span
              className={`flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border transition-colors ${
                isOverloaded
                  ? 'bg-red-950/60 border-red-800/80 text-red-400'
                  : 'bg-slate-950/60 border-slate-800/60 text-slate-500'
              }`}
            >
              {isOverloaded && <AlertTriangle className="w-3 h-3" />}
              {totalWeight} / {maxWeight} lb
            </span>
            </div>
        <button
          onClick={() => setIsTradeOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-semibold active:scale-95 transition-all"
        >
          <ArrowRightLeft className="w-4 h-4" />
          Échange P2P
        </button>
      </div>

      {/* BOURSE (MONNAIE D'AVENTURIER) AVEC OPTION PLIER / DÉPLIER */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <button
          type="button"
          onClick={() => setIsBourseOpen(!isBourseOpen)}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider group-hover:text-slate-300 transition-colors">
              <Coins className="w-4 h-4 text-amber-400" />
              Bourse & Pièces
            </h3>
            <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800/60">
              {coinsWeight} lb
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isBourseOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        
        {isBourseOpen && (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-2 pt-1 animate-in fade-in duration-200">
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
        )}
      </section>

      {/* SECTION DU SAC & DE L'INVENTAIRE (PLIABLE) */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
        <button
          type="button"
          onClick={() => setIsBagOpen(!isBagOpen)}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider group-hover:text-slate-300 transition-colors">
              <Backpack className="w-4 h-4 text-amber-400" />
              Sac d'objets
            </h3>
            {/* BADGE DE POIDS DYNAMIQUE (ROUGE SI SURCHARGÉ) */}
            <span
              className="text-[10px] font-mono font-medium text-slate-500 bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800/60"
            >
              {itemsWeight} lb
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isBagOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        
        {isBagOpen && (
          <div className="space-y-4 pt-1 animate-in fade-in duration-200">
            {/* AJOUT D'OBJET */}
            <form onSubmit={handleAddItem} className="flex gap-2">
              <input
                type="text"
                placeholder="Nom de l'objet..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="flex-grow bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
              <input
                type="number"
                min="1"
                value={newItemQty}
                onChange={(e) => setNewItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 bg-slate-950 border border-slate-800 rounded-xl px-2 py-2.5 text-sm font-mono text-center text-slate-100 focus:outline-none focus:border-amber-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 rounded-xl font-bold active:scale-95 transition-all flex items-center justify-center"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </button>
            </form>

            {/* LISTE DE L'INVENTAIRE COMPACTE AVEC SCROLL FLUIDE */}
            <div className="space-y-2">
              {inventory.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs italic bg-slate-950/40 border border-slate-800/50 rounded-2xl">
                  Votre sac à dos est vide.
                </div>
              ) : (
                <div className="max-h-[45vh] overflow-y-auto pr-1.5 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-950">
                  {inventory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 shadow-sm"
                    >
                      <div className="flex-grow pr-3 flex items-baseline gap-2">
                        <p className="text-sm font-semibold text-slate-200">{item.name}</p>
                        <span className="text-[10px] font-mono text-slate-500">
                          {item.weight ? `${item.weight * item.quantity} lb` : '0 lb'}
                        </span>
                      </div>

                      {/* CONTROLES DE QUANTITÉ TACTILES COMPACTS */}
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.id, -1)}
                            className="p-1 text-slate-400 hover:text-white rounded-md active:scale-90 transition-transform"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-mono font-bold text-amber-400">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.id, 1)}
                            className="p-1 text-slate-400 hover:text-white rounded-md active:scale-90 transition-transform"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-900 active:scale-90 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* MODAL TRADEMODAL */}
      {isTradeOpen && <TradeModal onClose={() => setIsTradeOpen(false)} />}
    </div>
  );
};