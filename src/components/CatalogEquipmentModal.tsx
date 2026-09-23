// src/components/CatalogEquipmentModal.tsx
import React, { useState } from 'react';
import { Plus, AlertTriangle, CheckCircle2, Search, X, PackageOpen, Coins } from 'lucide-react';
import { useCharacterStore } from '../store/useCharacterStore';
import type { CatalogItem } from '../types/catalogEquipment.js';
import type { Currency } from '../types/character';
import equipmentDataJson from '../data/equipment_fr.json';
import { translateEquipmentCategory, unitMap, formatCostDisplay } from '../utils/equipmentUtils.js';
import { DetailEquipmentModal } from './DetailEquipmentModal';

const equipmentData = equipmentDataJson as CatalogItem[];

interface CatalogEquipmentModalProps {
  onClose: () => void;
}

export const CatalogEquipmentModal: React.FC<CatalogEquipmentModalProps> = ({ onClose }) => {
  // --- ÉTATS GLOBAUX (Zustand) ---
  const character = useCharacterStore((state) => state.getActiveCharacter());
  const inventory = character.inventory || [];
  const updateItemQuantity = useCharacterStore((state) => state.updateItemQuantity);
  const addItem = useCharacterStore((state) => state.addItem);
  const updateCurrency = useCharacterStore((state) => state.updateCurrency);
  const currency = character.currency || { pc: 0, pa: 0, po: 0, pp: 0 };
  
  // --- ÉTATS LOCAUX ---
  const [catalogCategory, setCatalogCategory] = useState<string>('ALL');
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [catalogSearch, setCatalogSearch] = useState('');
  
  // État pour la modale de détail d'un objet (cliqué depuis le catalogue)
  const [selectedItemDetail, setSelectedItemDetail] = useState<CatalogItem | null>(null);

  // Fonction utilitaire pour retrouver un objet du catalogue par son index ou son nom
  const findCatalogItemByRef = (itemRef: { id: string; name: string }): CatalogItem | undefined => {
    return equipmentData.find(
      (eq) => eq.id === itemRef.id || eq.name.toLowerCase() === itemRef.name.toLowerCase()
    );
  };

  // Tentative d'achat/ajout d'un objet depuis le catalogue
  const handleAddFromCatalog = (catalogItem: CatalogItem) => {
    setPurchaseError(null);
    setPurchaseSuccess(null);

    // Vérification des fonds si l'objet est payant
    if (catalogItem.cost && catalogItem.cost.unit && catalogItem.cost.quantity > 0) {
      const unitKey = catalogItem.cost.unit.toLowerCase();
      const unitDisplay = unitMap[unitKey] || catalogItem.cost.unit;
      const requiredAmount = catalogItem.cost.quantity;
      const currentAmount = currency[unitDisplay as keyof Currency] || 0;

      if (currentAmount < requiredAmount) {
        setPurchaseError(`Fonds insuffisants ! Il vous manque des pièces (${unitDisplay.toUpperCase()}).`);
        return;
      }
    }

    // Débit des pièces dans la bourse du personnage
    if (catalogItem.cost && catalogItem.cost.unit && catalogItem.cost.quantity > 0) {
      const unitKey = catalogItem.cost.unit.toLowerCase();
      const unitDisplay = unitMap[unitKey] || catalogItem.cost.unit;
      const currencyUpdates: Partial<Currency> = { [unitDisplay]: -catalogItem.cost.quantity };
      updateCurrency(currencyUpdates);
    }

    // Gestion de l'ajout (contenu d'un pack ou objet unique)
    if (catalogItem.contents && catalogItem.contents.length > 0) {
      catalogItem.contents.forEach((contentEntry) => {
        const subItemRef = contentEntry.item;
        const subQuantity = contentEntry.quantity || 1;
        const foundSubCatalog = findCatalogItemByRef(subItemRef);

        const subName = foundSubCatalog ? foundSubCatalog.name : subItemRef.name;
        const subId = foundSubCatalog ? foundSubCatalog.id : subItemRef.id;
        const subWeight = foundSubCatalog ? foundSubCatalog.weight : 0;
        const subOnHandeddamageDice = foundSubCatalog ? foundSubCatalog.damage.damage_dice : null;
        const subTwoHandeddamageDice = foundSubCatalog ? foundSubCatalog.twoHandedDamage.damage_dice : null;
        const subArmorClassBase = foundSubCatalog ? foundSubCatalog.armorClass.base : null;
        const subArmorClassDexBonus = foundSubCatalog ? foundSubCatalog.armorClass.dex_bonus : null;
        const subArmorClassMaxBonus = foundSubCatalog ? foundSubCatalog.armorClass.max_bonus : null;

        const existingItem = inventory.find((inv) => inv.name.toLowerCase() === subName.toLowerCase());

        if (existingItem) {
          updateItemQuantity(existingItem.id, subQuantity);
        } else {
          addItem({ 
            name: subName, 
            quantity: subQuantity, 
            weight: subWeight, 
            catalogId: subId,
            categoryEquipment: catalogItem.categoryEquipment,
            isEquipped: false, 
            onHandeddamageDice: subOnHandeddamageDice,
            twoHandeddamageDice: subTwoHandeddamageDice,
            armorClassBase: subArmorClassBase,
            armorClassDexBonus: subArmorClassDexBonus,
            armorClassMaxBonus: subArmorClassMaxBonus,
            });
        }
      });
      setPurchaseSuccess(`Pack acheté ! Les composants de "${catalogItem.name}" ont été ajoutés à votre sac.`);
    } else {
      const existingItem = inventory.find((item) => item.name.toLowerCase() === catalogItem.name.toLowerCase());

      if (existingItem) {
        updateItemQuantity(existingItem.id, 1);
      } else {
        addItem({ 
            name: catalogItem.name, 
            quantity: 1, 
            weight: catalogItem.weight, 
            catalogId: catalogItem.id,
            categoryEquipment: catalogItem.categoryEquipment, 
            isEquipped: false,
            onHandeddamageDice: catalogItem.damage?.damage_dice,
            twoHandeddamageDice: catalogItem.twoHandedDamage?.damage_dice || null, 
            armorClassBase: catalogItem.armorClass?.base,
            armorClassDexBonus: catalogItem.armorClass?.dex_bonus || null,
            armorClassMaxBonus: catalogItem.armorClass?.max_bonus || null,
            });
      }
      setPurchaseSuccess(`Achat réussi ! "${catalogItem.name}" a été ajouté à votre sac.`);
    }
  };

  // Liste des catégories dynamiques extraites du JSON
  const categories = ['ALL', ...Array.from(new Set(equipmentData.map((i) => i.equipmentCategory))).sort()];
  
  // Filtrage et tri alphabétique du catalogue
  const filteredCatalog = equipmentData
    .filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(catalogSearch.toLowerCase());
      const matchesCategory = catalogCategory === 'ALL' || item.equipmentCategory === catalogCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col p-2 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))] animate-in fade-in duration-150">
      
      {/* HEADER DE LA MODALE */}
      <div className="flex justify-between items-center mb-2 pb-3 border-b border-slate-800 shrink-0">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PackageOpen className="w-5 h-5 text-amber-400" />
            Catalogue d'Objets
          </h3>
          <p className="text-[11px] text-slate-400">Ajoutez des objets officiels à votre sac (le coût est débité)</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-all active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* BANDEAUX DE FEEDBACK ACHAT (ERREUR / SUCCÈS) */}
      {purchaseError && (
        <div className="mb-3 flex items-center gap-2 bg-red-950/80 border border-red-800 text-red-300 px-3 py-2 rounded-xl text-xs shrink-0 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{purchaseError}</span>
        </div>
      )}

      {purchaseSuccess && (
        <div className="mb-3 flex items-center gap-2 bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-3 py-2 rounded-xl text-xs shrink-0 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{purchaseSuccess}</span>
        </div>
      )}

      {/* BARRE DE RECHERCHE TEXTUELLE */}
      <div className="relative mb-2 shrink-0">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Rechercher dans le catalogue..."
          value={catalogSearch}
          onChange={(e) => setCatalogSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 rounded-xl outline-none focus:border-amber-500 transition-colors"
        />
      </div>

      {/* CONTENEUR PRINCIPAL : FILTRES LATÉRAUX & LISTE DES ITEMS */}
      <div className="flex-1 flex gap-2 min-h-0 overflow-hidden">
        
        {/* COLONNE DES CATÉGORIES (Tactile & Scrollable) */}
        <div className="w-auto shrink-0 flex flex-col gap-1 overflow-y-auto pr-0.5 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCatalogCategory(cat)}
              className={`py-2 px-2.5 text-[10px] font-bold rounded-xl text-left transition-all shrink-0 whitespace-nowrap ${
                catalogCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'Tous' : translateEquipmentCategory(cat)}
            </button>
          ))}
        </div>

        {/* LISTE DES RÉSULTATS DU CATALOGUE */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-950">
          {filteredCatalog.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs italic bg-slate-900/50 border border-slate-800/60 rounded-2xl">
              Aucun équipement ne correspond à votre recherche.
            </div>
          ) : (
            filteredCatalog.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between gap-2 hover:border-slate-700 transition-all"
              >
                {/* PARTIE CLIQUABLE POUR OUVRIR LA FICHE DÉTAIL */}
                <div 
                  onClick={() => setSelectedItemDetail(item)}
                  className="flex flex-col flex-1 min-w-0 cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-800 text-amber-400 rounded shrink-0 border border-slate-700/50">
                      {translateEquipmentCategory(item.equipmentCategory)}
                    </span>
                    <span className="font-bold text-xs text-slate-200 group-hover:text-amber-300 truncate transition-colors">
                      {item.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-mono">
                    <span>{item.weight ?? 0} lb</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-300/90">
                      <Coins className="w-3 h-3 text-amber-400" />
                      {formatCostDisplay(item.cost)}
                    </span>
                  </div>
                </div>

                {/* BOUTON D'ACHAT / AJOUT */}
                <button
                  type="button"
                  onClick={() => handleAddFromCatalog(item)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shrink-0 flex items-center gap-1 active:scale-95 shadow-sm"
                  title={item.contents && item.contents.length > 0 ? "Acheter et déballer les composants dans le sac" : "Acheter"}
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* ================= MODAL : FICHE DÉTAIL D'UN OBJET ================= */}
      {selectedItemDetail && (
        <DetailEquipmentModal 
          initialItem={selectedItemDetail} 
          onClose={() => setSelectedItemDetail(null)} 
        />
      )}
      
    </div>
  );
};