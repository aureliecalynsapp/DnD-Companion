// src/components/SettingsTab.tsx
import React, { useRef } from 'react';
import { Sparkles, Download, Upload, ZoomIn, Zap, Save } from 'lucide-react';
import { useCharacterStore } from '../store/useCharacterStore';
import type { Character } from '../types/character';
import { CharacterManager } from './CharacterManager';
import { UI } from '../utils/themes';

export const SettingsTab: React.FC = () => {
  // Récupération dynamique du personnage actif et des actions
  const character = useCharacterStore((state) => state.getActiveCharacter());
  const longRest = useCharacterStore((state) => state.longRest);
  const importOrUpdateCharacter = useCharacterStore((state) => state.importOrUpdateCharacter);
  
  // États et actions pour la gestion du zoom global
  const zoomLevel = useCharacterStore((state) => state.zoomLevel ?? 100);
  const setZoomLevel = useCharacterStore((state) => state.setZoomLevel);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Exporter la fiche active en JSON
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(character, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${character.name.toLowerCase().replace(/\s+/g, '_')}_sheet.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Importer une fiche JSON
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        try {
          const parsedCharacter = JSON.parse(e.target?.result as string) as Character;
          if (parsedCharacter.name && parsedCharacter.hp) {
            importOrUpdateCharacter(parsedCharacter);
          } else {
            alert('Format de fichier JSON invalide pour une fiche D&D.');
          }
        } catch {
          alert('Erreur lors de la lecture du fichier JSON.');
        } finally {
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
    }
  };

  return (
    <div className={UI.tab}>
      
      {/* SECTION ACCESSIBILITÉ & ZOOM */}
      <div className={UI.cardInteractiveFull}>
        <div className="flex items-center gap-2">
            <ZoomIn className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors">
              Zoom
            </h2>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
            {zoomLevel}%
          </span>
        </div>
        {/* Curseur tactile de zoom */}
        <input 
          type="range" 
          min="80" 
          max="150" 
          step="10"
          value={zoomLevel} 
          onChange={(e) => setZoomLevel(Number(e.target.value))}
          className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
        />
      </div>
      
      {/* GESTIONNAIRE MULTI-PERSONNAGES (SWITCH / ADD / QR CODE) */}
      <div className={UI.cardInteractiveFull}>
        <CharacterManager />
      </div>

      
      {/* Repos */}
      <div className={UI.cardInteractiveFull}>
        <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors">
              Actions de sessions
            </h2>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">REPOS LONG : Réinitialiser PV, dés de vie et emplacements de sorts</span>
          <button 
            onClick={longRest}
            className="bg-emerald-900 border border-emerald-800 hover:bg-emerald-800 active:bg-emerald-700 p-2 rounded-xl text-left flex items-center justify-between transition active:scale-[0.99]"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>
      
      {/* Export / Import JSON */}
      <div className={UI.cardInteractiveFull}>
        <div className="flex items-center gap-2">
            <Save className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors">
              Gestion Fichier de sauvegarde
            </h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={handleExport}
            className="bg-emerald-900 border border-emerald-800 hover:bg-emerald-800 active:bg-emerald-700 p-1 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-slate-200 transition active:scale-95"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Exporter (JSON)
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-amber-900 border border-amber-800 hover:bg-amber-800 active:bg-amber-700 p-1 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-slate-200 transition active:scale-95"
          >
            <Upload className="w-4 h-4 text-amber-400" />
            Importer (JSON)
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".json" 
            className="hidden" 
          />
        </div>
      </div>
    </div>
  );
};