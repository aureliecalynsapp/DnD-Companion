import React, { useRef } from 'react';
import { Sparkles, Download, Upload } from 'lucide-react';
import { useCharacterStore } from '../store/useCharacterStore';
import type { Character } from '../types/character';
import { CharacterManager } from './CharacterManager';

export const SettingsTab: React.FC = () => {
  //const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  
  // Récupération dynamique du personnage actif et des actions
  const character = useCharacterStore((state) => state.getActiveCharacter());
  const longRest = useCharacterStore((state) => state.longRest);
  const importOrUpdateCharacter = useCharacterStore((state) => state.importOrUpdateCharacter);
  //const resetCharacter = useCharacterStore((state) => state.resetCharacter);
  
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
          // Reset de la valeur de l'input pour réimporter le même fichier si besoin
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* GESTIONNAIRE MULTI-PERSONNAGES (SWITCH / ADD / QR CODE) */}
      <CharacterManager />

      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-2">Actions de Session</h2>
      
      {/* Repos */}
      <div className="space-y-2">
        <button 
          onClick={longRest}
          className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-800 active:bg-slate-700 p-4 rounded-xl text-left flex items-center justify-between transition active:scale-[0.99]"
        >
          <div>
            <span className="text-sm font-bold text-white block">Repos Long</span>
            <span className="text-xs text-slate-400">Réinitialiser PV, dés de vie et emplacements de sorts</span>
          </div>
          <Sparkles className="w-5 h-5 text-blue-400" />
        </button>
      </div>

      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-2">Gestion Fichier de sauvegarde</h2>
      
      {/* Export / Import JSON */}
      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={handleExport}
          className="bg-slate-900 border border-slate-800 hover:bg-slate-800 active:bg-slate-700 p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-slate-200 transition active:scale-95"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          Exporter (JSON)
        </button>

        <button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-slate-900 border border-slate-800 hover:bg-slate-800 active:bg-slate-700 p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-slate-200 transition active:scale-95"
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

      {/* Réinitialisation */}
      {/* <div className="pt-2">
        <button 
          onClick={() => {
            if (confirm(`Réinitialiser ${character.name} aux valeurs par défaut ?`)) {
              resetCharacter();
            }
          }}
          className="w-full bg-red-950/40 border border-red-900/60 hover:bg-red-900/40 p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-red-300 transition active:scale-95"
        >
          <RotateCcw className="w-4 h-4 text-red-400" />
          Réinitialiser aux valeurs par défaut
        </button>
      </div>*/}
    </div>
  );
};