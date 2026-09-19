import React, { useState, useEffect } from 'react';
import { X, Save, Shield, Heart, Zap,GraduationCap } from 'lucide-react';
import { useCharacterStore } from '../store/useCharacterStore';
import { NumberInput } from './common/NumberInput';
import { ABILITIES_INFO } from '../constants/abilities';
import type { Ability, Character, SpellcastingAbility } from '../types/character';

interface EditCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditCharacterModal: React.FC<EditCharacterModalProps> = ({ isOpen, onClose }) => {
  // Récupération dynamique du personnage actif et de la méthode de mise à jour dédiée
  const character = useCharacterStore((state) => state.getActiveCharacter());
  const updateCharacterData = useCharacterStore((state) => state.updateCharacterData);
  const setSpellSlotMax = useCharacterStore((state) => state.setSpellSlotMax);
  const setSpellcastingAbility = useCharacterStore((state) => state.setSpellcastingAbility);

  const [formData, setFormData] = useState<Character>(character);

  // Synchronisation de l'état local à l'ouverture ou au changement du personnage actif
  useEffect(() => {
    if (isOpen) {
      setFormData(character);
    }
  }, [isOpen, character]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCharacterData(formData);
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
    <div className="fixed inset-0 w-screen h-screen z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 bg-slate-900 border border-slate-800 w-full max-w-lg max-h-[85vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* HEADER FIXE */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900 shrink-0">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Éditer le Personnage ({formData.name})
          </h2>
          <button 
            onClick={onClose} 
            type="button" 
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CORPS DE FORMULAIRE SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-700">
          <form id="edit-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Identité */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Identité</span>
              <div>
                <label className="text-slate-400 block mb-1">Nom du personnage</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 text-sm font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2 items-end">
                <div className="col-span-2">
                  <label className="text-slate-400 block mb-1">Classe</label>
                  <input
                    type="text"
                    value={formData.class || ''}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 font-medium"
                    required
                  />
                </div>
                <div>
                  <NumberInput
                    label="Niveau"
                    value={formData.level || 1}
                    min={1}
                    max={20}
                    onChange={(val) => setFormData({ ...formData, level: val })}
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Race / Origine</label>
                <input
                  type="text"
                  value={formData.race || ''}
                  onChange={(e) => setFormData({ ...formData, race: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Combat & Santé */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Combat & Santé</span>
              <div className="grid grid-cols-3 gap-2">
                <NumberInput
                  label="PV Max"
                  icon={<Heart className="w-3.5 h-3.5 text-red-400" />}
                  value={formData.hp?.max || 1}
                  min={1}
                  max={999}
                  onChange={(val) => setFormData({ ...formData, hp: { ...formData.hp, max: val } })}
                />

                <NumberInput
                  label="CA"
                  icon={<Shield className="w-3.5 h-3.5 text-blue-400" />}
                  value={formData.armorClass || 10}
                  min={1}
                  max={40}
                  onChange={(val) => setFormData({ ...formData, armorClass: val })}
                />

                <NumberInput
                  label="Init"
                  icon={<Zap className="w-3.5 h-3.5 text-amber-400" />}
                  value={formData.initiativeBonus || 0}
                  min={-5}
                  max={20}
                  onChange={(val) => setFormData({ ...formData, initiativeBonus: val })}
                />
              </div>
            </div>

            {/* Caractéristiques & JdS */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Caractéristiques & JdS
                </span>
                <span className="text-[10px] text-slate-500 italic">
                  JdS = Jet de Sauvegarde
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.keys(formData.abilities || {}) as Ability[]).map((ability) => {
                  const info = ABILITIES_INFO[ability] || { fullLabel: ability, description: '' };
                  const abilityData = formData.abilities[ability] || { value: 10, proficient: false };

                  return (
                    <div 
                      key={ability} 
                      className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between gap-2"
                      title={info.description}
                    >
                      <div className="shrink-0">
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold text-slate-300 block">{ability}</span>
                          <span className="text-[10px] text-slate-400">({info.fullLabel})</span>
                        </div>
                        <label className="flex items-center gap-1.5 mt-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={abilityData.proficient}
                            onChange={(e) => handleAbilityChange(ability, 'proficient', e.target.checked)}
                            className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 w-3.5 h-3.5"
                          />
                          <span className="text-[10px] text-slate-400">JdS</span>
                        </label>
                      </div>

                      <div className="w-28">
                        <NumberInput
                          value={abilityData.value}
                          min={1}
                          max={30}
                          onChange={(val) => handleAbilityChange(ability, 'value', val)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Éditer les emplacements max (Niv 1-9)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2 pt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => {
                  const max = character.spellSlots?.[lvl]?.max || 0;
                  return (
                    <div key={lvl} className="flex flex-col items-center bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400">Niv {lvl}</span>
                      <div className="w-28">
                        <NumberInput
                          value={max}
                          min={0}
                          max={9}
                          onChange={(val) => setSpellSlotMax(lvl, val)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-xl flex items-center justify-between gap-1.5 shadow-sm shrink-0">
              <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800/80 shrink-0">
                <GraduationCap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <select
                  value={character.spellcastingAbility || 'INT'}
                  onChange={(e) => setSpellcastingAbility(e.target.value as SpellcastingAbility)}
                  className="bg-transparent text-[11px] font-bold text-amber-400 outline-none cursor-pointer pr-1"
                >
                  <option value="INT">Intelligence (INT)</option>
                  <option value="WIS">Sagesse (WIS)</option>
                  <option value="CHA">Charisme (CHA)</option>
                  <option value="NONE">Aucune</option>
                </select>
              </div>
            </div>

          </form>
        </div>

        {/* FOOTER FIXE */}
        <div className="p-5 pt-4 border-t border-slate-800 bg-slate-900 shrink-0 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-650 text-slate-300 font-semibold py-3 rounded-xl transition text-xs"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="edit-form"
            className="flex-1 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 transition shadow-lg shadow-blue-950 text-xs"
          >
            <Save className="w-4 h-4" /> Sauvegarder
          </button>
        </div>

      </div>
    </div>
  );
};