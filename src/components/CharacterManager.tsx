// src/components/CharacterManager.tsx
import React, { useState } from 'react';
import { Users, Plus, Trash2, QrCode } from 'lucide-react';
import { useCharacterStore } from '../store/useCharacterStore';
import { ShareCharacterModal } from './ShareCharacterModal';

export const CharacterManager: React.FC = () => {
  const characters = useCharacterStore((state) => state.characters);
  const activeCharacterId = useCharacterStore((state) => state.activeCharacterId);
  const setActiveCharacter = useCharacterStore((state) => state.setActiveCharacter);
  const createCharacter = useCharacterStore((state) => state.createCharacter);
  const deleteCharacter = useCharacterStore((state) => state.deleteCharacter);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-blue-400" /> Mes Personnages
        </span>
        <button
          onClick={() => createCharacter()}
          className="flex items-center gap-1 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1.5 rounded-lg transition"
        >
          <Plus className="w-3.5 h-3.5" /> Nouveau
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Sélecteur de personnage */}
        <select
          value={activeCharacterId}
          onChange={(e) => setActiveCharacter(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 text-white text-sm font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
        >
          {characters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.class} Niv. {c.level})
            </option>
          ))}
        </select>

        {/* Bouton Partage / Import QR */}
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 rounded-xl transition"
          title="Partager / Scanner un personnage"
        >
          <QrCode className="w-4 h-4" />
        </button>

        {/* Bouton Suppression (désactivé s'il n'y a qu'un seul personnage) */}
        {characters.length > 1 && (
          <button
            onClick={() => {
              if (confirm('Supprimer définitivement ce personnage ?')) {
                deleteCharacter(activeCharacterId);
              }
            }}
            className="p-2.5 bg-red-950/40 border border-red-900/60 hover:bg-red-900/40 text-red-400 rounded-xl transition"
            title="Supprimer le personnage actif"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {isShareModalOpen && (
        <ShareCharacterModal onClose={() => setIsShareModalOpen(false)} />
      )}
    </div>
  );
};