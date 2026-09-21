import React, { useState } from 'react';
import { Coins, Backpack, Plus, Minus, Trash2, ArrowRightLeft, ChevronDown, AlertTriangle, CheckCircle2, Search, X, PackageOpen, ChevronRight, Swords, Shield, Compass } from 'lucide-react';
import { useCharacterStore } from '../store/useCharacterStore';
import { TradeModal } from './TradeModal';
import { NumberInput } from './common/NumberInput';
import type { Currency } from '../types/character';
import equipmentDataJson from '../data/equipment_fr.json';

export interface CatalogItemContent {
  item: {
    index: string;
    name: string;
    url: string;
  };
  quantity: number;
}

export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  equipmentCategory: string;
  gearCategory: string | null;
  cost?: {
      quantity: number,
      unit: string | null;
  };
  weight: number;
  armorCategory?: string | null;
  armorClass?: {
    base: number;
    dex_bonus: boolean;
  } | null;
  capacity?: string | null;
  categoryRange?: string | null;
  contents?: CatalogItemContent[];
  damage?: {
    damage_dice: string;
    damage_type: {
      index: string;
      name: string;
      url: string;
    };
  } | null;
  properties?: Array<{
    index: string;
    name: string;
    url: string;
  }>;
  quantity?: number;
  range?: {
    normal: number;
    long?: number;
  } | null;
  speed?: {
    quantity: number;
    unit: string;
  } | null;
  stealthDisadvantage?: boolean;
  strMinimum?: number;
  throwRange?: {
    normal: number;
    long: number;
  } | null;
  toolCategory?: string | null;
  twoHandedDamage?: {
    damage_dice: string;
    damage_type: {
      index: string;
      name: string;
      url: string;
    };
  } | null;
  vehicleCategory?: string | null;
  weaponCategory?: string | null;
  weaponRange?: string | null;
}

const equipmentData = equipmentDataJson as CatalogItem[];

// Dictionnaire de mapping pour traduire les catégories d'équipement anglaises du JSON en français
export const equipmentCategoryMap: Record<string, string> = {
  'Tools': "Outil",
  'Mounts and Vehicles': "Monture",
  'Weapon': "Arme",
  'Armor': "Armure",
  'Adventuring Gear': "Autre",
};

// Dictionnaire de traduction pour les catégories d'armes (weaponCategory)
export const weaponCategoryMap: Record<string, string> = {
  'Martial': 'Guerre',
  'Simple': 'Courante',
};

// Dictionnaire de traduction pour le type de portée d'arme (weaponRange)
export const weaponRangeMap: Record<string, string> = {
  'Melee': 'Corps à corps',
  'Ranged': 'À distance',
};

// Dictionnaire de traduction pour les catégories d'armures (armorCategory)
export const armorCategoryMap: Record<string, string> = {
  'Light': 'Légère',
  'Medium': 'Intermédiaire',
  'Heavy': 'Lourde',
  'Shield': 'Bouclier',
};

// Dictionnaire de traduction pour les catégories de véhicules et montures (vehicleCategory)
export const vehicleCategoryMap: Record<string, string> = {
  'Mounts and Other Animals': 'Montures et autres animaux',
  'Tack, Harness, and Drawn Vehicles': 'Harnachements, bâts et véhicules tirés',
  'Waterborne Vehicles': 'Véhicules aquatiques',
};

// Dictionnaire de traduction pour les unités de vitesse (speed.unit)
export const speedUnitMap: Record<string, string> = {
  'ft/round': 'pieds/round',
  'mph': 'm/h (miles par heure)',
  'ft': 'pieds',
};

// Fonction utilitaire pour obtenir la traduction d'une catégorie d'équipement (avec fallback)
export const translateEquipmentCategory = (category?: string | null): string => {
  if (!category) return 'Divers';
  return equipmentCategoryMap[category] || category;
};

// Fonction utilitaire pour obtenir la traduction d'une catégorie d'arme (avec fallback)
export const translateWeaponCategory = (category?: string | null): string => {
  if (!category) return '';
  return weaponCategoryMap[category] || category;
};

// Fonction utilitaire pour obtenir la traduction du type de portée d'arme (avec fallback)
export const translateWeaponRange = (rangeType?: string | null): string => {
  if (!rangeType) return '';
  return weaponRangeMap[rangeType] || rangeType;
};

// Fonction utilitaire pour obtenir la traduction de la catégorie d'armure (avec fallback)
export const translateArmorCategory = (category?: string | null): string => {
  if (!category) return '';
  return armorCategoryMap[category] || category;
};

// Fonction utilitaire pour obtenir la traduction de la catégorie de véhicule/monture (avec fallback)
export const translateVehicleCategory = (category?: string | null): string => {
  if (!category) return '';
  return vehicleCategoryMap[category] || category;
};

// Fonction utilitaire pour traduire l'unité de vitesse
export const translateSpeedUnit = (unit?: string | null): string => {
  if (!unit) return '';
  return speedUnitMap[unit.toLowerCase()] || unit;
};

export const BagTab: React.FC = () => {
  // --- ÉTATS GLOBAUX (Zustand) ---
  const character = useCharacterStore((state) => state.getActiveCharacter());
  const addItem = useCharacterStore((state) => state.addItem);
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
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState<string>('ALL');
  
  // Gestion de la pile de navigation des détails pour les objets contenus dans les packs
  const [detailStack, setDetailStack] = useState<CatalogItem[]>([]);
  const selectedItemDetail = detailStack.length > 0 ? detailStack[detailStack.length - 1] : null;

  // États pour les alertes d'achat (erreur ou succès)
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

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

  // Dictionnaire de correspondance optionnel pour harmoniser avec les abréviations françaises de D&D 5E (po, pa, pc...)
  const unitMap: Record<string, string> = {
    gp: 'po', // Pièces d'or
    sp: 'pa', // Pièces d'argent
    cp: 'pc', // Pièces de cuivre
    pp: 'pp', // Pièces de platine
  };

  // Fonction utilitaire pour formater proprement l'affichage du coût à partir de cost
  const formatCostDisplay = (cost?: { quantity: number; unit: string | null } | null): string => {
    if (!cost || cost.quantity == null || !cost.unit) {
      return 'Gratuit';
    }

    const unitKey = cost.unit.toLowerCase();
    const unitDisplay = unitMap[unitKey] || cost.unit;

    return `${cost.quantity} ${unitDisplay}`;
  };

  // Fonction utilitaire pour retrouver un objet du catalogue par son index ou son nom
  const findCatalogItemByRef = (itemRef: { index: string; name: string }): CatalogItem | undefined => {
    return equipmentData.find(
      (eq) => eq.id === itemRef.index || eq.name.toLowerCase() === itemRef.name.toLowerCase()
    );
  };

  // Tentative d'achat/ajout d'un objet depuis le catalogue (gère dynamiquement les packs via "contents")
  const handleAddFromCatalog = (catalogItem: CatalogItem) => {
    setPurchaseError(null);
    setPurchaseSuccess(null);

    // 1. Vérification des fonds en français si l'objet a un coût
    if (catalogItem.cost && catalogItem.cost.unit && catalogItem.cost.quantity > 0) {
      const unitKey = catalogItem.cost.unit.toLowerCase();
      const unitDisplay = unitMap[unitKey] || catalogItem.cost.unit;
      const requiredAmount = catalogItem.cost.quantity;
      const currentAmount = currency[unitDisplay as keyof Currency] || 0;

      if (currentAmount < requiredAmount) {
        setPurchaseError(`Fonds insuffisants ! Il vous manque des pièces (${unitDisplay.toUpperCase()}).`);
        return; // Bloque l'achat
      }
    }

    // 2. Déduction des coûts dans la bourse
    if (catalogItem.cost && catalogItem.cost.unit && catalogItem.cost.quantity > 0) {
      const unitKey = catalogItem.cost.unit.toLowerCase();
      const unitDisplay = unitMap[unitKey] || catalogItem.cost.unit;
      const currencyUpdates: Partial<Currency> = {
        [unitDisplay]: -catalogItem.cost.quantity,
      };
      updateCurrency(currencyUpdates);
    }

    // 3. Traitement dynamique : si l'objet contient des sous-éléments (ex: Paquet de diplomate), on ajoute chaque sous-élément dans le sac
    if (catalogItem.contents && catalogItem.contents.length > 0) {
      catalogItem.contents.forEach((contentEntry) => {
        const subItemRef = contentEntry.item;
        const subQuantity = contentEntry.quantity || 1;
        const foundSubCatalog = findCatalogItemByRef(subItemRef);

        const subName = foundSubCatalog ? foundSubCatalog.name : subItemRef.name;
        const subWeight = foundSubCatalog ? foundSubCatalog.weight : 0;

        // Vérifier si le sous-objet existe déjà dans l'inventaire
        const existingItem = inventory.find(
          (inv) => inv.name.toLowerCase() === subName.toLowerCase()
        );

        if (existingItem) {
          updateItemQuantity(existingItem.id, subQuantity);
        } else {
          addItem({
            name: subName,
            quantity: subQuantity,
            weight: subWeight,
          });
        }
      });
      setPurchaseSuccess(`Pack acheté ! Les composants de "${catalogItem.name}" ont été ajoutés à votre sac.`);
    } else {
      // Objet standard unique
      const existingItem = inventory.find(
        (item) => item.name.toLowerCase() === catalogItem.name.toLowerCase()
      );

      if (existingItem) {
        updateItemQuantity(existingItem.id, 1);
      } else {
        addItem({
          name: catalogItem.name,
          quantity: 1,
          weight: catalogItem.weight,
        });
      }
      setPurchaseSuccess(`Achat réussi ! "${catalogItem.name}" a été ajouté à votre sac.`);
    }
  };

  // Filtrage et tri alphabétique de l'inventaire personnel
  const filteredInventory = inventory
    .filter((item) =>
      item.name.toLowerCase().includes(bagSearch.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));

  // Filtrage et tri alphabétique du catalogue global (Référentiel)
  const categories = ['ALL', ...Array.from(new Set(equipmentData.map(i => i.equipmentCategory))).sort()];
  const filteredCatalog = equipmentData
    .filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(catalogSearch.toLowerCase());
      const matchesCategory = catalogCategory === 'ALL' || item.equipmentCategory === catalogCategory;
      return matchesSearch && matchesCategory;
    })
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
          Échange P2P
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
      <section className={`bg-slate-900 border border-slate-800/80 rounded-2xl p-2 flex flex-col space-y-2 ${isBagOpen ? 'flex-1 min-h-0' : 'shrink-0'}`}>
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
          <div className="flex flex-col flex-1 min-h-0 space-y-2 pt-1 animate-in fade-in duration-200">
            
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filtrer mes objets..."
                  value={bagSearch}
                  onChange={(e) => setBagSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 rounded-xl outline-none focus:border-amber-500/50"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setCatalogSearch('');
                  setPurchaseError(null);
                  setPurchaseSuccess(null);
                  setIsCatalogOpen(true);
                }}
                className="p-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold transition-all active:scale-95 shadow-sm flex items-center justify-center shrink-0"
                title="Ajouter des objets depuis la Bible"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* LISTE DE L'INVENTAIRE (Triée alphabétiquement) */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-950">
              {inventory.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs italic bg-slate-950/40 border border-slate-800/50 rounded-2xl">
                  Votre sac à dos est vide. Cliquez sur <span className="text-amber-400 font-bold">+</span> pour ajouter des objets.
                </div>
              ) : filteredInventory.length === 0 ? (
                <div className="text-center py-4 text-slate-500 text-xs bg-slate-950/40 border border-slate-800/50 rounded-xl">
                  Aucun objet ne correspond à votre recherche.
                </div>
              ) : (
                filteredInventory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-3 py-1 shadow-sm"
                  >
                    <div className="flex-grow pr-3 flex items-baseline gap-2">
                      <p className="text-sm font-semibold text-slate-200">{item.name}</p>
                      <span className="text-[10px] font-mono text-slate-500">
                        {item.weight ? `${item.weight * item.quantity} lb` : '0 lb'}
                      </span>
                    </div>

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
                ))
              )}
            </div>
          </div>
        )}
      </section>

      {/* ================= MODAL FULLSCREEN : CATALOGUE ================= */}
      {isCatalogOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col p-2 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))] animate-in fade-in duration-150">
          <div className="flex justify-between items-center mb-2 pb-3 border-b border-slate-800 shrink-0">
            <div>
              <h3 className="text-base font-bold text-white">Catalogue d'Objets</h3>
              <p className="text-[11px] text-slate-400">Ajoutez des objets officiels à votre sac (le coût est débité)</p>
            </div>
            <button
              type="button"
              onClick={() => setIsCatalogOpen(false)}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* BANDEAUX D'ALERTE (ERREUR OU SUCCÈS) */}
          {purchaseError && (
            <div className="mb-3 flex items-center gap-2 bg-red-950/80 border border-red-800 text-red-300 px-3 py-2 rounded-xl text-xs shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{purchaseError}</span>
            </div>
          )}

          {purchaseSuccess && (
            <div className="mb-3 flex items-center gap-2 bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-3 py-2 rounded-xl text-xs shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{purchaseSuccess}</span>
            </div>
          )}

          <div className="relative mb-2 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher dans le catalogue..."
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 rounded-xl outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex-1 flex gap-2 min-h-0 overflow-hidden">
            {/* Sidebar des catégories */}
            <div className="w-auto shrink-0 flex flex-col gap-1 overflow-y-auto pr-0.5 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCatalogCategory(cat)}
                  className={`py-1.5 px-2.5 text-[10px] font-bold rounded-lg text-center transition-all shrink-0 whitespace-nowrap ${
                    catalogCategory === cat
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {cat === 'ALL' ? 'Tous' : translateEquipmentCategory(cat)}
                </button>
              ))}
            </div>

            {/* Liste des éléments du catalogue (Référentiel trié alphabétiquement) */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
              {filteredCatalog.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between gap-2"
                >
                  <div
                    className="flex flex-col flex-1 cursor-pointer min-w-0"
                    onClick={() => setDetailStack([item])}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-800 text-amber-400 rounded shrink-0">
                        {translateEquipmentCategory(item.equipmentCategory)}
                      </span>
                      <span className="font-bold text-xs text-slate-200 truncate">{item.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5 truncate">
                      {item.weight} lb • Coût : {formatCostDisplay(item.cost)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddFromCatalog(item)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shrink-0 flex items-center gap-1 active:scale-95"
                    title={item.contents && item.contents.length > 0 ? "Acheter et déballer les composants dans le sac" : "Acheter"}
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL : FICHE DÉTAIL D'UN OBJET (ARMES, ARMURES, VÉHICULES & PACKS) ================= */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-4 max-h-[85vh] overflow-y-auto shadow-2xl scrollbar-thin scrollbar-thumb-slate-700 flex flex-col">
            
            {/* Fil d'Ariane si on navigue dans les sous-objets d'un pack */}
            {detailStack.length > 1 && (
              <button
                type="button"
                onClick={() => setDetailStack(prev => prev.slice(0, -1))}
                className="flex items-center gap-1 text-xs text-amber-400 font-semibold mb-2 hover:underline self-start"
              >
                ← Retour au composant précédent
              </button>
            )}

            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  {translateEquipmentCategory(selectedItemDetail.equipmentCategory)}
                </span>
                <h3 className="text-lg font-bold text-white">{selectedItemDetail.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailStack([])}
                className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-xl text-xs text-slate-300 mb-3 border border-slate-800/80">
              <div>
                <strong className="text-slate-500">Poids:</strong> {selectedItemDetail.weight} lb
              </div>
              <div>
                <strong className="text-slate-500">Coût:</strong> {formatCostDisplay(selectedItemDetail.cost)}
              </div>
            </div>

            {/* SECTION SPÉCIFIQUE AUX ARMES */}
            {selectedItemDetail.equipmentCategory === 'Weapon' && (
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 mb-3 space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Swords className="w-4 h-4" />
                  Caractéristiques d'arme
                </h4>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  {selectedItemDetail.weaponCategory && (
                    <div>
                      <span className="text-slate-500">Catégorie :</span> <span className="font-semibold text-white">{translateWeaponCategory(selectedItemDetail.weaponCategory)}</span>
                    </div>
                  )}
                  {selectedItemDetail.weaponRange && (
                    <div>
                      <span className="text-slate-500">Type de portée :</span> <span className="font-semibold text-white">{translateWeaponRange(selectedItemDetail.weaponRange)}</span>
                    </div>
                  )}
                  {selectedItemDetail.damage && (
                    <div>
                      <span className="text-slate-500">Dégâts :</span> <span className="font-mono font-bold text-amber-400">{selectedItemDetail.damage.damage_dice}</span> ({selectedItemDetail.damage.damage_type?.name})
                    </div>
                  )}
                  {selectedItemDetail.range && (
                    <div>
                      <span className="text-slate-500">Portée :</span> <span className="font-semibold text-white">{selectedItemDetail.range.normal} {selectedItemDetail.range.long ? `/ ${selectedItemDetail.range.long} pi` : 'pi'}</span>
                    </div>
                  )}
                  {selectedItemDetail.throwRange && (
                    <div>
                      <span className="text-slate-500">Jet :</span> <span className="font-semibold text-white">{selectedItemDetail.throwRange.normal} / {selectedItemDetail.throwRange.long} pi</span>
                    </div>
                  )}
                </div>

                {selectedItemDetail.properties && selectedItemDetail.properties.length > 0 && (
                  <div className="pt-1 flex flex-wrap gap-1">
                    {selectedItemDetail.properties.map(prop => (
                      <span key={prop.index} className="text-[10px] font-medium bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                        {prop.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SECTION SPÉCIFIQUE AUX ARMURES ET BOUCLIERS */}
            {selectedItemDetail.equipmentCategory === 'Armor' && (
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 mb-3 space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-400" />
                  Caractéristiques d'armure
                </h4>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  {selectedItemDetail.armorCategory && (
                    <div>
                      <span className="text-slate-500">Type :</span> <span className="font-semibold text-white">{translateArmorCategory(selectedItemDetail.armorCategory)}</span>
                    </div>
                  )}
                  {selectedItemDetail.armorClass && (
                    <div>
                      <span className="text-slate-500">Classe d'Armure (CA) :</span> <span className="font-mono font-bold text-amber-400">{selectedItemDetail.armorClass.base}</span>
                      {selectedItemDetail.armorClass.dex_bonus ? (
                        <span className="block text-[10px] text-emerald-400 mt-0.5">+ mod. de Dextérité</span>
                      ) : (
                        <span className="block text-[10px] text-slate-500 mt-0.5">Aucun bonus de Dextérité</span>
                      )}
                    </div>
                  )}
                  {selectedItemDetail.strMinimum !== undefined && selectedItemDetail.strMinimum > 0 && (
                    <div>
                      <span className="text-slate-500">Force requise :</span> <span className="font-semibold text-white">FOR {selectedItemDetail.strMinimum}</span>
                    </div>
                  )}
                  {selectedItemDetail.stealthDisadvantage && (
                    <div className="col-span-2 text-red-400 text-[11px] font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      Désavantage aux tests de Discrétion
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECTION SPÉCIFIQUE AUX MONTURES ET VÉHICULES */}
            {selectedItemDetail.equipmentCategory === 'Mounts and Vehicles' && (
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 mb-3 space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-400" />
                  Caractéristiques de transport
                </h4>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  {selectedItemDetail.vehicleCategory && (
                    <div className="col-span-2">
                      <span className="text-slate-500">Catégorie :</span> <span className="font-semibold text-white">{translateVehicleCategory(selectedItemDetail.vehicleCategory)}</span>
                    </div>
                  )}
                  {selectedItemDetail.speed && (
                    <div>
                      <span className="text-slate-500">Vitesse :</span> <span className="font-mono font-bold text-amber-400">{selectedItemDetail.speed.quantity}</span> <span className="text-[10px] text-slate-400">{translateSpeedUnit(selectedItemDetail.speed.unit)}</span>
                    </div>
                  )}
                  {selectedItemDetail.capacity && (
                    <div>
                      <span className="text-slate-500">Capacité :</span> <span className="font-semibold text-white">{selectedItemDetail.capacity}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedItemDetail.description && (
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line mb-3">
                {selectedItemDetail.description}
              </p>
            )}

            {/* SECTION DYNAMIQUE DES CONTENUS (SI C'EST UN PACK) */}
            {selectedItemDetail.contents && selectedItemDetail.contents.length > 0 && (
              <div className="mt-2 space-y-2 flex-1">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <PackageOpen className="w-4 h-4" />
                  Contient ces objets ({selectedItemDetail.contents.length}) :
                </h4>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                  {selectedItemDetail.contents.map((contentEntry, idx) => {
                    const subRef = contentEntry.item;
                    const foundSub = findCatalogItemByRef(subRef);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (foundSub) {
                            setDetailStack(prev => [...prev, foundSub]);
                          }
                        }}
                        className={`flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/60 ${
                          foundSub ? 'cursor-pointer hover:border-amber-500/50 hover:bg-slate-850 transition-all' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-xs font-semibold text-slate-200 truncate">
                            {foundSub ? foundSub.name : subRef.name}
                          </span>
                          <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
                            x{contentEntry.quantity}
                          </span>
                        </div>
                        {foundSub && (
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500 italic mt-1">
                  Cliquez sur un objet pour inspecter ses caractéristiques. À l'achat du pack, l'ensemble de ces composants sera versé directement dans votre sac.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setDetailStack([])}
              className="w-full mt-4 py-2.5 bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 rounded-xl text-xs"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* MODAL TRADEMODAL */}
      {isTradeOpen && <TradeModal onClose={() => setIsTradeOpen(false)} />}
    </div>
  );
};