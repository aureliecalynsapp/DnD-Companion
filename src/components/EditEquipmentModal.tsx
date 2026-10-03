// src/components/EditEquipmentModal.tsx
import React, { useState } from 'react';
import { X, Save, Shield, Swords, Backpack, Compass, Road, Pickaxe } from 'lucide-react';
import { useCharacterStore } from '../store/useCharacterStore';
import { NumberInput } from './common/NumberInput';
import type { CatalogItem } from '../types/catalogEquipment';

interface EditEquipmentModalProps {
  item: CatalogItem;
  onClose: () => void;
}

export const EditEquipmentModal: React.FC<EditEquipmentModalProps> = ({ item: initialItem, onClose }) => {
  const addItem = useCharacterStore((state) => state.addItem);

  // État local de l'objet en cours d'édition
  const [formData, setFormData] = useState<CatalogItem>({ ...initialItem });

  const handleChange = (field: keyof CatalogItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCostChange = (field: 'quantity' | 'unit', value: any) => {
    setFormData((prev) => ({
      ...prev,
      cost: {
        quantity: prev.cost?.quantity || 0,
        unit: prev.cost?.unit || 'po',
        [field]: value
      }
    }));
  };

  // Gestionnaires spécifiques pour les dégâts d'arme
  const handleDamageDiceChange = (dice: string) => {
    setFormData((prev) => ({
      ...prev,
      damage: dice ? {
        damage_dice: dice,
        damage_type: prev.damage?.damage_type || { index: 'tranchant', name: 'Tranchant', url: '' }
      } : null
    }));
  };

  const handleDamageTypeName = (typeName: string) => {
    setFormData((prev) => ({
      ...prev,
      damage: {
        damage_dice: prev.damage?.damage_dice || '1d6',
        damage_type: {
          index: typeName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
          name: typeName,
          url: ''
        }
      }
    }));
  };

  const handleTwoHandedDiceChange = (dice: string) => {
    setFormData((prev) => ({
      ...prev,
      twoHandedDamage: dice ? {
        damage_dice: dice,
        damage_type: prev.twoHandedDamage?.damage_type || prev.damage?.damage_type || { index: 'tranchant', name: 'Tranchant', url: '' }
      } : null
    }));
  };

  // Gestionnaire spécifique pour la vitesse des montures/véhicules
  const handleSpeedChange = (field: 'quantity' | 'unit', value: any) => {
    setFormData((prev) => ({
      ...prev,
      speed: {
        quantity: prev.speed?.quantity || 0,
        unit: prev.speed?.unit || 'pieds/tour',
        [field]: value
      }
    }));
  };

  // Gestionnaire spécifique pour les propriétés de Classe d'Armure (AC)
  const handleArmorClassChange = (field: 'base' | 'dex_bonus' | 'max_bonus', value: any) => {
    setFormData((prev) => ({
      ...prev,
      armorClass: {
        base: prev.armorClass?.base || 10,
        dex_bonus: prev.armorClass?.dex_bonus ?? true,
        max_bonus: prev.armorClass?.max_bonus ?? 0,
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Nettoyage et structuration de l'objet selon la catégorie
    const cleanedItem: any = {
      name: formData.name || 'Objet sans nom',
      description: formData.description || '',
      equipmentCategory: formData.equipmentCategory,
      cost: formData.cost || { quantity: 0, unit: 'po' },
      weight: Number(formData.weight) || 0,
      quantity: 1,
    };

    // Champs conditionnels selon equipmentCategory
    if (formData.equipmentCategory === 'Armure') {
      cleanedItem.armorCategory = formData.armorCategory || null;
      cleanedItem.armorClass = formData.armorClass || null;
      cleanedItem.stealthDisadvantage = Boolean(formData.stealthDisadvantage);
      cleanedItem.strMinimum = Number(formData.strMinimum) || 0;
    } else if (formData.equipmentCategory === 'Arme') {
      cleanedItem.weaponCategory = formData.weaponCategory || null;
      cleanedItem.weaponRange = formData.weaponRange || null;
      cleanedItem.damage = formData.damage || null;
      cleanedItem.twoHandedDamage = formData.twoHandedDamage || null;
    } else if (formData.equipmentCategory === 'Montures et véhicules') {
      cleanedItem.vehicleCategory = formData.vehicleCategory || null;
      cleanedItem.speed = formData.speed || null;
      cleanedItem.capacity = formData.capacity || null;
    } else if (formData.equipmentCategory === 'Outils') {
      cleanedItem.toolCategory = formData.toolCategory || null;
    } else if (formData.equipmentCategory === "Équipement d'aventurier") {
      cleanedItem.gearCategory = formData.gearCategory || null;
    }

    addItem(cleanedItem);
    onClose();
  };

  return (
    // Overlay absolu épousant les contours du conteneur de l'application
    <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 animate-fadeIn">
      
      <div className="absolute inset-0" onClick={onClose} />

      {/* Boîte modale contenue, responsive et structurée */}
      <div className="relative z-10 bg-slate-900 border border-slate-800 w-full max-w-lg max-h-[98%] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* HEADER FIXE */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900 shrink-0">
          <div className="flex items-center gap-2">
            <Backpack className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 truncate pr-2">
              Éditer l'objet : {formData.name || 'Nouvel objet'}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            type="button" 
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CORPS DE FORMULAIRE SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-700">
          <form id="edit-equipment-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Informations générales */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Informations générales</span>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Nom de l'objet</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500 text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Catégorie d'équipement</label>
                <select
                  value={formData.equipmentCategory || "Équipement d'aventurier"}
                  onChange={(e) => handleChange('equipmentCategory', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500 text-xs font-semibold cursor-pointer"
                >
                  <option value="Équipement d'aventurier">Équipement d'aventurier</option>
                  <option value="Arme">Arme</option>
                  <option value="Armure">Armure</option>
                  <option value="Outils">Outils</option>
                  <option value="Montures et véhicules">Montures et véhicules</option>
                </select>
              </div>
            </div>

            {/* Poids & Valeur */}
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Poids & Valeur</span>
              <div className="grid grid-cols-3 gap-2 items-end">
                <div>
                  <NumberInput
                    label="Poids (lb)"
                    value={formData.weight || 0}
                    min={0}
                    max={999}
                    step={0.1}
                    onChange={(val) => handleChange('weight', val)}
                  />
                </div>
                <div>
                  <NumberInput
                    label="Coût (Qté)"
                    value={formData.cost?.quantity || 0}
                    min={0}
                    max={999}
                    onChange={(val) => handleCostChange('quantity', val)}
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Unité</label>
                  <select
                    value={formData.cost?.unit || 'po'}
                    onChange={(e) => handleCostChange('unit', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500 text-xs cursor-pointer h-8"
                  >
                    <option value="pc">PC (Cuivre)</option>
                    <option value="pa">PA (Argent)</option>
                    <option value="po">PO (Or)</option>
                    <option value="pp">PP (Platine)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SPÉCIFICITÉS : ARMES */}
            {formData.equipmentCategory === 'Arme' && (
              <div className="space-y-3 pt-2 border-t border-slate-800/60 animate-fadeIn">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5" /> Spécificités d'arme & Dégâts
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Catégorie d'arme</label>
                    <input
                      type="text"
                      value={formData.weaponCategory || ''}
                      onChange={(e) => handleChange('weaponCategory', e.target.value)}
                      placeholder="Ex: Courante, De guerre..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Type de portée</label>
                    <input
                      type="text"
                      value={formData.weaponRange || ''}
                      onChange={(e) => handleChange('weaponRange', e.target.value)}
                      placeholder="Ex: Corps à corps, À distance..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                </div>

                {/* Bloc Dégâts Principaux */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
                  <div>
                    <label className="text-[11px] font-semibold text-amber-400/90 block mb-1">Dés de dégâts</label>
                    <input
                      type="text"
                      value={formData.damage?.damage_dice || ''}
                      onChange={(e) => handleDamageDiceChange(e.target.value)}
                      placeholder="Ex: 1d8, 2d6..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-amber-400/90 block mb-1">Type de dégâts</label>
                    <input
                      type="text"
                      value={formData.damage?.damage_type?.name || ''}
                      onChange={(e) => handleDamageTypeName(e.target.value)}
                      placeholder="Ex: Tranchant, Feu..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                </div>

                {/* Bloc Dégâts Versatile / Deux mains */}
                <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Dégâts à deux mains / Versatile (Optionnel)</label>
                  <input
                    type="text"
                    value={formData.twoHandedDamage?.damage_dice || ''}
                    onChange={(e) => handleTwoHandedDiceChange(e.target.value)}
                    placeholder="Ex: 1d10 (pour épée longue)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* SPÉCIFICITÉS : ARMURES */}
            {formData.equipmentCategory === 'Armure' && (
              <div className="space-y-3 pt-2 border-t border-slate-800/60 animate-fadeIn">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Spécificités d'armure & CA
                </span>
                <div className="grid grid-cols-2 gap-2 items-end">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Catégorie d'armure</label>
                    <input
                      type="text"
                      value={formData.armorCategory || ''}
                      onChange={(e) => handleChange('armorCategory', e.target.value)}
                      placeholder="Ex: Légère, Intermédiaire..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                  <div>
                    <NumberInput
                      label="Force min (FOR)"
                      value={formData.strMinimum || 0}
                      min={0}
                      max={30}
                      onChange={(val) => handleChange('strMinimum', val)}
                    />
                  </div>
                </div>

                {/* Bloc Classe d'Armure (Base, Checkbox Dex et Max Bonus dynamique à droite) */}
                <div className="grid grid-cols-3 gap-2 items-end">
                  <div>
                    <NumberInput
                      label="CA de Base"
                      value={formData.armorClass?.base || 10}
                      min={0}
                      max={30}
                      onChange={(val) => handleArmorClassChange('base', val)}
                    />
                  </div>

                    <div className="flex items-center gap-2 ">
                      <input
                        type="checkbox"
                        id="dexBonus"
                        checked={Boolean(formData.armorClass?.dex_bonus)}
                        onChange={(e) => handleArmorClassChange('dex_bonus', e.target.checked)}
                        className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="dexBonus" className="text-[11px] text-slate-300 cursor-pointer whitespace-nowrap">
                        Bonus DEX
                      </label>
                    </div>

                    {formData.armorClass?.dex_bonus && (
                      <div >
                        <NumberInput
                          label="Max Bonus"
                          value={formData.armorClass?.max_bonus || 0}
                          min={0}
                          max={10}
                          onChange={(val) => handleArmorClassChange('max_bonus', val)}
                        />
                      </div>
                    )}
                  </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="stealthDisadvantage"
                    checked={Boolean(formData.stealthDisadvantage)}
                    onChange={(e) => handleChange('stealthDisadvantage', e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="stealthDisadvantage" className="text-xs text-slate-300 cursor-pointer">
                    Désavantage aux tests de Discrétion
                  </label>
                </div>
              </div>
            )}

            {/* SPÉCIFICITÉS : MONTURES ET VÉHICULES */}
            {formData.equipmentCategory === 'Montures et véhicules' && (
              <div className="space-y-3 pt-2 border-t border-slate-800/60 animate-fadeIn">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" /> Spécificités transport & Vitesse
                </span>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Catégorie de véhicule</label>
                  <input
                    type="text"
                    value={formData.vehicleCategory || ''}
                    onChange={(e) => handleChange('vehicleCategory', e.target.value)}
                    placeholder="Ex: Montures, Harnachement..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
                
                {/* Champs Vitesse (Quantité + Unité) */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <NumberInput
                      label="Vitesse (Qté)"
                      value={formData.speed?.quantity || 0}
                      min={0}
                      max={9999}
                      onChange={(val) => handleSpeedChange('quantity', val)}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Unité de vitesse</label>
                    <input
                      type="text"
                      value={formData.speed?.unit || ''}
                      onChange={(e) => handleSpeedChange('unit', e.target.value)}
                      placeholder="Ex: pieds/tour, km/h..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                </div>

                {/* Champ Capacité */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Capacité</label>
                  <input
                    type="text"
                    value={formData.capacity || ''}
                    onChange={(e) => handleChange('capacity', e.target.value)}
                    placeholder="Ex: 400 lb, 2 passagers..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>
            )}

            {/* SPÉCIFICITÉS : OUTILS */}
            {formData.equipmentCategory === 'Outils' && (
              <div className="space-y-2 pt-2 border-t border-slate-800/60 animate-fadeIn">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Pickaxe className="w-3.5 h-3.5" /> Spécificités d'outils
                </span>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Catégorie d'outil</label>
                  <input
                    type="text"
                    value={formData.toolCategory || ''}
                    onChange={(e) => handleChange('toolCategory', e.target.value)}
                    placeholder="Ex: Outils d'artisan, Instruments..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>
            )}

            {/* SPÉCIFICITÉS : ÉQUIPEMENT D'AVENTURIER */}
            {formData.equipmentCategory === "Équipement d'aventurier" && (
              <div className="space-y-2 pt-2 border-t border-slate-800/60 animate-fadeIn">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Road className="w-3.5 h-3.5" /> Spécificités d'aventurier
                </span>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Catégorie d'équipement</label>
                  <input
                    type="text"
                    value={formData.gearCategory || ''}
                    onChange={(e) => handleChange('gearCategory', e.target.value)}
                    placeholder="Ex: Équipement standard, Matériel..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Description & Notes */}
            <div className="space-y-2 pt-2 border-t border-slate-800/60 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Description & Notes</span>
              <div>
                <textarea
                  rows={4}
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Description détaillée de l'objet, propriétés magiques ou notes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 text-xs resize-none"
                />
              </div>
            </div>
          </form>
        </div>

        {/* FOOTER FIXE */}
        <div className="p-2 border-t border-slate-800 bg-slate-900 shrink-0 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-650 text-slate-300 font-semibold py-2 rounded-xl transition text-xs"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="edit-equipment-form"
            className="flex-1 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition shadow-lg text-xs"
          >
            <Save className="w-4 h-4" /> Sauvegarder & Ajouter
          </button>
        </div>

      </div>
    </div>
  );
};