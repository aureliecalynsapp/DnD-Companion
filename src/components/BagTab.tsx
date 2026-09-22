// src/components/BagTab.tsx
import React, { useState } from 'react';
import { Coins, Backpack, Plus, Trash2, ArrowRightLeft, ChevronDown, AlertTriangle, Search } from 'lucide-react';
import { useCharacterStore } from '../store/useCharacterStore';
import { TradeModal } from './TradeModal';
import { CatalogEquipmentModal } from './CatalogEquipmentModal';
import { DetailEquipmentModal } from './DetailEquipmentModal';
import { NumberInput } from './common/NumberInput';
import type { Currency, Item } from '../types/character';
import type { CatalogItem } from '../types/catalogEquipment.js';
import equipmentDataJson from '../data/equipment_fr.json';

const equipmentData = equipmentDataJson as CatalogItem[];

export const BagTab: React.FC = () => {
  // --- ÉTATS GLOBAUX (Zustand) ---
  const character = useCharacterStore((state) => state.getActiveCharacter());
  const removeItem = useCharacterStore((state) => state.removeItem);
  const updateItemQuantity = useCharacterStore((state) => state.updateItemQuantity);
  const updateCurrency = useCharacterStore((state) => state.updateCurrency);

  const inventory = character.inventory || [];
  const currency = character.currency || { pc: 0, pa: 0, po: 0, pp: 0 };
  
  // Calcul de la capacité de transport basée sur la Force (STR * 15 lb)
  const strength = character.abilities?.STR?.value || 10;
  const maxWeight = strength * 15;

  // Calcul du poids de la monnaie (50 pièces = 1 lb)
  const totalCoins = Object.values(currency).reduce((sum, qty) => sum + (qty || 0), 0);
  const coinsWeight = Number((totalCoins / 50).toFixed(1));

  // --- ÉTATS LOCAUX ---
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [isBourseOpen, setIsBourseOpen] = useState(false);
  const [isBagOpen, setIsBagOpen] = useState(true);

  // États pour la recherche et la modale du catalogue
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [bagSearch, setBagSearch] = useState('');
  
  // État pour la modale de détail d'un objet (cliqué depuis l'inventaire personnel)
  const [selectedItemDetail, setSelectedItemDetail] = useState<CatalogItem | null>(null);

  const handleOpenDetail = (item: Item) => {
  // Recherche prioritaire par catalogId s'il existe, sinon fallback sur le nom
  const found = equipmentData.find(
    (eq) => eq.id === item.catalogId || eq.name.toLowerCase() === item.name.toLowerCase()
  );

  if (found) {
    setSelectedItemDetail(found);
  } else {
    setSelectedItemDetail({
      id: item.id,
      name: item.name,
      equipmentCategory: "Équipement d'aventurier",
      gearCategory: null,
      weight: item.weight || 0,
      cost: { quantity: 0, unit: 'po' },
      description: "Objet personnalisé ou absent du catalogue officiel."
    });
  }
};

  // --- CALCULS DE POIDS ---
  const itemsWeight = inventory.reduce((sum, item) => {
    const itemWeight = item.weight || 0;
    return sum + itemWeight * item.quantity;
  }, 0);

  const totalWeight = Number((itemsWeight + coinsWeight).toFixed(1));
  const isOverloaded = totalWeight > maxWeight;

  // Configuration de la grille 2x2 avec les dénominations françaises
  const currencyLabels = [
    { key: 'pc', label: 'Pièce Cuivre (PC)', color: 'text-amber-700 border-amber-800/60 bg-amber-950/30' },
    { key: 'pa', label: 'Pièce Argent (PA)', color: 'text-slate-300 border-slate-700/60 bg-slate-900/30' },
    { key: 'po', label: 'Pièce Or (PO)', color: 'text-amber-400 border-amber-600/40 bg-amber-950/50' },
    { key: 'pp', label: 'Pièce Platine (PP)', color: 'text-indigo-300 border-indigo-700/60 bg-indigo-950/30' },
  ] as const;

  // Filtrage et tri alphabétique de l'inventaire personnel
  const filteredInventory = inventory
    .filter((item) => item.name.toLowerCase().includes(bagSearch.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));

  return (
    <div className="flex flex-col h-full space-y-2 overflow-hidden">
      
      {/* HEADER + POIDS + BOUTON D'ÉCHANGE */}
      <div className="flex items-center justify-between gap-3 shrink-0">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Backpack className="w-5 h-5 text-amber-400" />
          Sac
        </h2>
        
        {/* Badge dynamique d'encombrement */}
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

        <button
          onClick={() => setIsTradeOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-semibold active:scale-95 transition-all"
        >
          <ArrowRightLeft className="w-4 h-4" />
          Échange
        </button>
      </div>

      {/* SECTION BOURSE & PIÈCES (GRILLE 2x2, PLIABLE) */}
      <section className="bg-slate-900 border border-slate-800/80 rounded-2xl p-2 space-y-2 shadow-lg shrink-0">
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
          <div className="grid grid-cols-2 gap-1 pt-1 animate-in fade-in duration-250">
            {currencyLabels.map(({ key, label, color }) => (
              <div key={key} className={`rounded-xl border p-2 ${color}`}>
                <NumberInput
                  label={label}
                  value={currency[key as keyof Currency] || 0}
                  max={9999}
                  onChange={(newVal) => {
                    const delta = newVal - (currency[key as keyof Currency] || 0);
                    updateCurrency({ [key]: delta });
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION DU SAC D'OBJETS */}
      <section className={`bg-slate-900 border border-slate-800/80 rounded-2xl p-2 flex flex-col space-y-1 ${isBagOpen ? 'flex-1 min-h-0' : 'shrink-0'}`}>
        <button
          type="button"
          onClick={() => setIsBagOpen(!isBagOpen)}
          className="w-full flex items-center justify-between text-left cursor-pointer group shrink-0"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider group-hover:text-slate-300 transition-colors">
              <Backpack className="w-4 h-4 text-amber-400" />
              Sac d'objets
            </h3>
            <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800/60">
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
          <div className="flex flex-col flex-1 min-h-0 space-y-1 pt-1 animate-in fade-in duration-200">
            
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filtrer mes objets..."
                  value={bagSearch}
                  onChange={(e) => setBagSearch(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 rounded-xl outline-none focus:border-amber-500/50"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsCatalogOpen(true)}
                className="p-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold transition-all active:scale-95 shadow-sm flex items-center justify-center shrink-0"
                title="Ajouter des objets depuis la Bible"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* LISTE DE L'INVENTAIRE (Triée alphabétiquement et utilisant NumberInput) */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-950">
              {inventory.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs italic bg-slate-950/60 border border-slate-800/50 rounded-2xl">
                  Votre sac à dos est vide. Cliquez sur <span className="text-amber-400 font-bold">+</span> pour ajouter des objets.
                </div>
              ) : filteredInventory.length === 0 ? (
                <div className="text-center py-4 text-slate-500 text-xs bg-slate-950/60 border border-slate-800/50 rounded-xl">
                  Aucun objet ne correspond à votre recherche.
                </div>
              ) : (
                filteredInventory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-slate-950/60 border border-slate-800 rounded-xl p-1 shadow-sm gap-2"
                  >
                    {/* ZONE CLIQUABLE POUR OUVRIR LES DÉTAILS DE L'OBJET DU SAC */}
                    <div
                      onClick={() => handleOpenDetail(item)}
                      className="flex items-center gap-2 truncate flex-1 cursor-pointer group"
                    >
                      <p className="text-sm font-semibold text-slate-200 group-hover:text-amber-300 truncate transition-colors">
                        {item.name}
                      </p>
                      <span className="text-[8px] font-mono text-slate-500 shrink-0">
                        {item.weight ? `${item.weight * item.quantity} lb` : '0 lb'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-28">
                        <NumberInput
                          value={item.quantity}
                          min={0}
                          max={999}
                          onChange={(newVal) => {
                            const delta = newVal - item.quantity;
                            if (delta !== 0) { updateItemQuantity(item.id, delta); }
                          }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-slate-500 hover:text-red-400 rounded-xl hover:bg-slate-900 active:scale-90 transition-all border border-slate-800/80"
                        title="Supprimer l'objet"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </section>

      {/* ================= MODAL FULLSCREEN : CATALOGUE ================= */}
      {isCatalogOpen && (
        <CatalogEquipmentModal onClose={() => setIsCatalogOpen(false)} />
      )}

      {/* ================= MODAL : FICHE DÉTAIL D'UN OBJET DEPUIS LE SAC ================= */}
      {selectedItemDetail && (
        <DetailEquipmentModal
          initialItem={selectedItemDetail}
          onClose={() => setSelectedItemDetail(null)}
        />
      )}

      {/* MODAL TRADEMODAL */}
      {isTradeOpen && <TradeModal onClose={() => setIsTradeOpen(false)} />}
    </div>
  );
};