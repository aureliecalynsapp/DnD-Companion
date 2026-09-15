// src/components/EditCharacterModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Save, Shield, Heart, Zap } from 'lucide-react';
import { useCharacterStore } from '../store/useCharacterStore';
import type { Ability, Character } from '../types/character';

interface EditCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditCharacterModal: React.FC<EditCharacterModalProps> = ({ isOpen, onClose }) => {
  const character = useCharacterStore((state) => state.character);
  const updateCharacter = useCharacterStore((state) => state.updateCharacter);

  const [formData, setFormData] = useState<Character>(character);

  useEffect(() => {
    if (isOpen) {
      setFormData(character);
    }
  }, [isOpen, character]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCharacter(formData);
    onClose();
  };

  const handleAbilityChange = (ability: Ability, field: 'value' | 'proficient', val: number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      abilities: {
        ...prev.abilities,
        [ability]: {
          ...prev.abilities[ability],
          [field]: val,
        },
      },
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-slate-900 border-t sm:border border-slate-800 w-full max-w-lg max-h-[90vh] rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Éditer le Personnage</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg active:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire Scrollable */}
        <form id="edit-form" onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 text-xs">
          
          {/* Section Identité */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Identité</span>
            <div>
              <label className="text-slate-400 block mb-1">Nom du personnage</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 text-sm font-semibold"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-slate-400 block mb-1">Classe</label>
                <input
                  type="text"
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 font-medium"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Niveau</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-amber-400 font-mono font-bold text-center focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Race / Origine</label>
              <input
                type="text"
                value={formData.race}
                onChange={(e) => setFormData({ ...formData, race: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Section Stats Combat */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Combat & Santé</span>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <label className="text-slate-400 flex items-center gap-1 mb-1 text-[11px]">
                  <Heart className="w-3.5 h-3.5 text-red-400" /> PV Max
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.hp.max}
                  onChange={(e) => setFormData({
                    ...formData,
                    hp: { ...formData.hp, max: Math.max(1, parseInt(e.target.value) || 1) }
                  })}
                  className="w-full bg-transparent text-white font-mono font-bold text-base focus:outline-none"
                />
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <label className="text-slate-400 flex items-center gap-1 mb-1 text-[11px]">
                  <Shield className="w-3.5 h-3.5 text-blue-400" /> CA
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.armorClass}
                  onChange={(e) => setFormData({ ...formData, armorClass: parseInt(e.target.value) || 10 })}
                  className="w-full bg-transparent text-white font-mono font-bold text-base focus:outline-none"
                />
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <label className="text-slate-400 flex items-center gap-1 mb-1 text-[11px]">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Init
                </label>
                <input
                  type="number"
                  value={formData.initiativeBonus}
                  onChange={(e) => setFormData({ ...formData, initiativeBonus: parseInt(e.target.value) || 0 })}
                  className="w-full bg-transparent text-white font-mono font-bold text-base focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section Caractéristiques & Maîtrises JdS */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Caractéristiques & JdS</span>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(formData.abilities) as Ability[]).map((ability) => (
                <div key={ability} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-300 block">{ability}</span>
                    <label className="flex items-center gap-1.5 mt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.abilities[ability].proficient}
                        onChange={(e) => handleAbilityChange(ability, 'proficient', e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 w-3.5 h-3.5"
                      />
                      <span className="text-[10px] text-slate-400">JdS</span>
                    </label>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.abilities[ability].value}
                    onChange={(e) => handleAbilityChange(ability, 'value', parseInt(e.target.value) || 10)}
                    className="w-12 bg-slate-900 border border-slate-800 rounded p-1 text-center font-mono font-bold text-amber-400 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

        </form>

        {/* Footer Actions Fixe */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-650 text-slate-300 font-semibold py-2.5 rounded-xl transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="edit-form"
            className="flex-1 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition shadow-lg shadow-blue-950"
          >
            <Save className="w-4 h-4" /> Sauvegarder
          </button>
        </div>

      </div>
    </div>
  );
};