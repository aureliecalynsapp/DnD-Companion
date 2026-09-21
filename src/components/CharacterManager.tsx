import React, { useState } from 'react';
import { Users, Plus, Trash2, QrCode, Edit3 } from 'lucide-react';
import { useCharacterStore } from '../store/useCharacterStore';
import { ShareCharacterModal } from './ShareCharacterModal';
import { EditCharacterModal } from './EditCharacterModal';

export const CharacterManager: React.FC = () => {
  const characters = useCharacterStore((state) => state.characters);
  const activeCharacterId = useCharacterStore((state) => state.activeCharacterId);
  const setActiveCharacter = useCharacterStore((state) => state.setActiveCharacter);
  const createCharacter = useCharacterStore((state) => state.createCharacter);
  const deleteCharacter = useCharacterStore((state) => state.deleteCharacter);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const activeChar = characters.find((c) => c.id === activeCharacterId) || characters[0];

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Supprimer définitivement "${name}" ?`)) {
      deleteCharacter(id);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2 shadow-sm space-y-2">
      {/* En-tête : Titre + Actions (QR Code et +) */}
      <div className="flex items-center justify-between">
        
          <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            Personnage actif
          </span>

        <div className="flex items-center gap-2">
          {/* Bouton QR Code décalé en haut */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-blue-400 rounded-xl transition-all"
            title="Partager par QR Code"
            type="button"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Bouton + au lieu de "Nouveau" */}
          <button
            onClick={()  => createCharacter()}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl transition-all shadow-md flex items-center justify-center"
            title="Nouveau personnage"
            type="button"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sélecteur de personnage + Actions (Édition + Suppression) */}
      <div className="flex items-center gap-2">
        <select
          value={activeCharacterId}
          onChange={(e) => setActiveCharacter(e.target.value)}
          className="flex-grow bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors truncate"
        >
          {characters.map((char) => (
            <option key={char.id} value={char.id}>
              {char.name} ({char.class} Niv. {char.level})
            </option>
          ))}
        </select>

        {/* Bouton Éditer (Crayon) */}
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-xl transition-all border border-slate-700/50 flex-shrink-0"
          title="Éditer le personnage"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        {/* Bouton Supprimer (Poubelle) */}
        <button
          onClick={() => handleDelete(activeChar.id, activeChar.name)}
          className="p-2.5 bg-red-950/40 hover:bg-red-900/60 active:scale-95 text-red-400 rounded-xl transition-all border border-red-800/40 flex-shrink-0"
          title="Supprimer le personnage"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Modales associées */}
      {isShareModalOpen && (
        <ShareCharacterModal onClose={() => setIsShareModalOpen(false)} />
      )}
      {isEditModalOpen && (
        <EditCharacterModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
      )}
    </div>
  );
};