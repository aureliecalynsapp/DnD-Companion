// src/components/DetailEquipmentModal.tsx
import React, { useState } from 'react';
import { AlertTriangle, X, PackageOpen, ChevronRight, Swords, Shield, Compass, Road, Pickaxe } from 'lucide-react';
import { translateEquipmentCategory, translateSpeedUnit, formatCostDisplay, findCatalogItemByRef } from '../utils/equipmentUtils.js';
import type { CatalogItem } from '../types/catalogEquipment.js';

interface DetailEquipmentModalProps {
  initialItem: CatalogItem;
  onClose: () => void;
}

export const DetailEquipmentModal: React.FC<DetailEquipmentModalProps> = ({ initialItem, onClose }) => {
  // Gestion de la pile de navigation des détails pour les objets contenus dans les packs
  const [detailStack, setDetailStack] = useState<CatalogItem[]>([initialItem]);
  const selectedItemDetail = detailStack[detailStack.length - 1];

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-4 max-h-[100%] overflow-y-auto shadow-2xl scrollbar-thin scrollbar-thumb-slate-700 flex flex-col">
        
        {/* Fil d'Ariane si on navigue dans les sous-objets d'un pack */}
        {detailStack.length > 1 && (
          <button type="button" 
            onClick={() => setDetailStack((prev) => prev.slice(0, -1))} 
            className="flex items-center gap-1 text-xs text-amber-400 font-semibold mb-2 hover:underline self-start">
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
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2 rounded-xl text-xs text-slate-300 mb-3 border border-slate-800/80">
          <div>
            <strong className="text-slate-500">Poids:</strong> {selectedItemDetail.weight} lb
          </div>
          <div>
            <strong className="text-slate-500">Coût:</strong> {formatCostDisplay(selectedItemDetail.cost)}
          </div>
        </div>

        {/* SECTION SPÉCIFIQUE AUX ARMES */}
        {selectedItemDetail.equipmentCategory === 'Arme' && (
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-2 mb-3 space-y-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Swords className="w-4 h-4" />
              Caractéristiques d'arme
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              {selectedItemDetail.weaponCategory && (
                <div>
                  <span className="text-slate-500">Catégorie :</span> <span className="font-semibold text-white">{selectedItemDetail.weaponCategory}</span>
                </div>
              )}
              {selectedItemDetail.weaponRange && (
                <div>
                  <span className="text-slate-500">Type de portée :</span> <span className="font-semibold text-white">{selectedItemDetail.weaponRange}</span>
                </div>
              )}
              {selectedItemDetail.damage && (
                <div>
                  <span className="text-slate-500">Dégâts :</span> <span className="font-mono font-bold text-amber-400">{selectedItemDetail.damage.damage_dice}</span> ({selectedItemDetail.damage.damage_type?.name})
                </div>
              )}
              {selectedItemDetail.twoHandedDamage && (
                <div>
                  <span className="text-slate-500">Dégâts (A deux mains) :</span> <span className="font-mono font-bold text-amber-400">{selectedItemDetail.twoHandedDamage.damage_dice}</span> ({selectedItemDetail.twoHandedDamage.damage_type?.name})
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
                {selectedItemDetail.properties.map((prop) => (
                  <span key={prop.index} className="text-[10px] font-medium bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                    {prop.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION SPÉCIFIQUE AUX ARMURES ET BOUCLIERS */}
        {selectedItemDetail.equipmentCategory === 'Armure' && (
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-2 mb-3 space-y-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-400" />
              Caractéristiques d'armure
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              {selectedItemDetail.armorCategory && (
                <div>
                  <span className="text-slate-500">Type :</span> <span className="font-semibold text-white">{selectedItemDetail.armorCategory}</span>
                </div>
              )}
              {selectedItemDetail.armorClass && (
                <div>
                  <span className="text-slate-500">Classe d'Armure (CA) :</span> <span className="font-mono font-bold text-amber-400">{selectedItemDetail.armorClass.base}</span>
                  {selectedItemDetail.armorClass.dex_bonus ? (
                <div>
                    {selectedItemDetail.armorClass.max_bonus ? (
                        <span className="block text-[10px] text-emerald-400 mt-0.5">+ mod. de Dextérité / Max +{selectedItemDetail.armorClass.max_bonus}</span>
                    ) : (
                        <span className="block text-[10px] text-emerald-400 mt-0.5">+ mod. de Dextérité</span>
                    )}                    
                </div>
                  ) : (
                    <span className="block text-[10px] text-slate-500 mt-0.5">Aucun bonus de Dextérité</span>
                  )}
                </div>
              )}
              {selectedItemDetail.strMinimum !== undefined && selectedItemDetail.strMinimum > 0 && (
                <div>
                  <span className="text-slate-500">Force requise (FOR):</span> <span className="font-semibold text-white">{selectedItemDetail.strMinimum}</span>
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
        {selectedItemDetail.equipmentCategory === 'Montures et véhicules' && (
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-2 mb-3 space-y-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-400" />
              Caractéristiques de transport
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              {selectedItemDetail.vehicleCategory && (
                <div className="col-span-2">
                  <span className="text-slate-500">Catégorie :</span> <span className="font-semibold text-white">{selectedItemDetail.vehicleCategory}</span>
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
        
        {/* SECTION SPÉCIFIQUE AUX ÉQUIPEMENTS D'AVENTURIER */}
        {selectedItemDetail.equipmentCategory === "Équipement d'aventurier" && (
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-2 mb-3 space-y-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Road className="w-4 h-4 text-amber-400" />
              Caractéristiques d'équipement d'aventurier
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              {selectedItemDetail.gearCategory && (
                <div className="col-span-2">
                  <span className="text-slate-500">Catégorie :</span> <span className="font-semibold text-white">{selectedItemDetail.gearCategory}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* SECTION SPÉCIFIQUE AUX OUTILS */}
        {selectedItemDetail.equipmentCategory === "Outils" && (
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-2 mb-3 space-y-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Pickaxe className="w-4 h-4 text-amber-400" />
              Caractéristiques des outils
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              {selectedItemDetail.toolCategory && (
                <div className="col-span-2">
                  <span className="text-slate-500">Catégorie :</span> <span className="font-semibold text-white">{selectedItemDetail.toolCategory}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedItemDetail.description && (
      <div className="flex-1 overflow-y-auto px-2 py-3 my-1 scrollbar-thin scrollbar-thumb-slate-700">
          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line mb-3">
            {selectedItemDetail.description}
          </p>
          </div>
        )}

        {/* SECTION DYNAMIQUE DES CONTENUS (SI C'EST UN PACK) */}
        {selectedItemDetail.contents && selectedItemDetail.contents.length > 0 && (
          <div className="mt-2 space-y-2 flex-1">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <PackageOpen className="w-4 h-4" />
              Contient ces objets ({selectedItemDetail.contents.length}) :
            </h4>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
              {selectedItemDetail.contents.map((contentEntry) => {
                const subRef = contentEntry.item;
                const foundSub = findCatalogItemByRef(subRef);
                return (
                  <div key={subRef.id} onClick={() => { if (foundSub) { setDetailStack((prev) => [...prev, foundSub]); } }} className={`flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/60 ${foundSub ? 'cursor-pointer hover:border-amber-500/50 hover:bg-slate-850 transition-all' : ''}`}>
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {foundSub ? foundSub.name : subRef.name}
                      </span>
                      <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40 shrink-0">
                        x{contentEntry.quantity}
                      </span>
                    </div>
                    {foundSub && <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-500 italic mt-1">
              Cliquez sur un objet pour inspecter ses caractéristiques. À l'achat du pack, l'ensemble de ces composants sera versé directement dans votre sac.
            </p>
          </div>
        )}

        <button type="button" onClick={onClose} className="w-full mt-4 py-2.5 bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 rounded-xl text-xs">
          Fermer
        </button>
      </div>
    </div>
  );
};