import React, { useState } from 'react';
import { Sparkles, BookOpen, Search, Eye, Check, CheckCheck, Plus, Trash2, X } from 'lucide-react';
import { useCharacterStore } from '../store/useCharacterStore';
import type { Spell } from '../types/character';
import spellsDataJson from '../data/spells_fr.json';

// Importation des données de référence des sorts (Bible)
const spellsData = spellsDataJson as Spell[];

export const SpellsTab: React.FC = () => {
  // --- ÉTATS GLOBAUX (Zustand) ---
  const character = useCharacterStore((state) => state.getActiveCharacter());
  const toggleKnownSpell = useCharacterStore((state) => state.toggleKnownSpell);
  const togglePreparedSpell = useCharacterStore((state) => state.togglePreparedSpell);

  // --- ÉTATS LOCAUX DE NAVIGATION & FILTRES ---
  const [subTab, setSubTab] = useState<'live' | 'grimoire'>('live'); // Bascule entre "En Combat" et "Grimoire"
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null); // Sort sélectionné pour ouvrir la modale de détail
  const [isCatalogOpen, setIsCatalogOpen] = useState(false); // Ouverture de la modale de la Bible des sorts

  // Filtres pour le Grimoire
  const [grimoireSearch, setGrimoireSearch] = useState('');
  const [grimoireLevelFilter, setGrimoireLevelFilter] = useState<number | 'ALL'>('ALL');

  // Filtres pour la Bible (Catalogue)
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogLevelFilter, setCatalogLevelFilter] = useState<number | 'ALL'>('ALL');

  if (!character) return null;

  // Récupération des IDs des sorts connus et préparés du personnage actif
  const knownIds = character.knownSpellIds || [];
  const preparedIds = character.preparedSpellIds || [];

  // --- CALCULS & TRIS ALPHABÉTIQUES (avec localeCompare pour le français) ---

  // 1. Grimoire : Sorts connus triés par ordre alphabétique
  const knownSpells = spellsData
    .filter((s) => knownIds.includes(s.id))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  // 2. En Combat : Sorts actifs (tours mineurs connus + sorts préparés) triés par ordre alphabétique
  const activeSpells = spellsData
    .filter((s) => (s.level === 0 && knownIds.includes(s.id)) || preparedIds.includes(s.id))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  // 3. Filtrage du Grimoire selon la recherche textuelle et le niveau
  const filteredGrimoire = knownSpells.filter((spell) => {
    const matchesSearch = spell.name.toLowerCase().includes(grimoireSearch.toLowerCase());
    const matchesLevel = grimoireLevelFilter === 'ALL' || spell.level === grimoireLevelFilter;
    return matchesSearch && matchesLevel;
  });

  // 4. Bible (Catalogue complet) : Filtrée et triée par ordre alphabétique
  const filteredCatalog = spellsData
    .filter((spell) => {
      const matchesSearch = spell.name.toLowerCase().includes(catalogSearch.toLowerCase());
      const matchesLevel = catalogLevelFilter === 'ALL' || spell.level === catalogLevelFilter;
      return matchesSearch && matchesLevel;
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden">
      
      {/* ================= SÉLECTEUR DE SOUS-ONGLETS ================= */}
      <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
        <button
          type="button"
          onClick={() => setSubTab('live')}
          className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
            subTab === 'live'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Sorts prêts ({activeSpells.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab('grimoire')}
          className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
            subTab === 'grimoire'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Grimoire ({knownSpells.length})
        </button>
      </div>

      {/* ================= SOUS-ONGLET 1 : EN COMBAT ================= */}
      {subTab === 'live' && (
        <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-hidden">
          <div className="flex-1 flex flex-col min-h-0">
            {activeSpells.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 bg-slate-900/40 border border-slate-800 rounded-xl">
                Aucun sort prêt.
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                {activeSpells.map((spell) => (
                  <div
                    key={spell.id}
                    onClick={() => setSelectedSpell(spell)}
                    className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-1.5 rounded-xl flex items-center justify-between cursor-pointer active:scale-[0.99]"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          spell.level === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {spell.level === 0 ? 'Mineur' : `Niv. ${spell.level}`}
                        </span>
                        <span className="font-bold text-xs text-slate-100">{spell.name}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        {spell.castingTime} • {spell.range}
                      </span>
                      </div>
                    </div>
                    <Eye className="w-4 h-4 text-slate-500" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= SOUS-ONGLET 2 : GRIMOIRE ================= */}
      {subTab === 'grimoire' && (
        <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-hidden">
          {/* Barre de recherche et bouton d'ajout (Bible) */}
          <div className="shrink-0 space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filtrer mes sorts..."
                  value={grimoireSearch}
                  onChange={(e) => setGrimoireSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 rounded-xl outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setCatalogSearch('');
                  setCatalogLevelFilter('ALL');
                  setIsCatalogOpen(true);
                }}
                className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all active:scale-95 shadow-sm flex items-center justify-center shrink-0"
                title="Ajouter des sorts"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Layout Sidebar verticale de niveaux + Liste des sorts */}
          <div className="flex-1 flex gap-1 min-h-0 overflow-hidden">
            {/* Sidebar des niveaux de sorts */}
            <div className="w-auto shrink-0 flex flex-col gap-1 overflow-y-auto pr-0.5 scrollbar-none">
              {['ALL', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setGrimoireLevelFilter(lvl as any)}
                  className={`py-1.5 px-1 text-[8px] font-bold rounded-lg text-center transition-all shrink-0 whitespace-nowrap ${
                    grimoireLevelFilter === lvl
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {lvl === 'ALL' ? 'Tous' : lvl === 0 ? 'Mineur' : `Niv ${lvl}`}
                </button>
              ))}
            </div>

            {/* Liste des sorts du grimoire */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-0.5 scrollbar-thin scrollbar-thumb-slate-700">
              {knownSpells.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
                  Votre grimoire est vide. Cliquez sur <span className="text-blue-400 font-bold">+</span> pour ajouter des sorts.
                </div>
              ) : filteredGrimoire.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-900/40 border border-slate-800 rounded-xl">
                  Aucun sort à ce niveau.
                </div>
              ) : (
                filteredGrimoire.map((spell) => {
                  const isPrepared = preparedIds.includes(spell.id);

                  return (
                    <div
                      key={spell.id}
                      className="bg-slate-900 border border-slate-800 p-1.5 rounded-xl flex items-center justify-between gap-2"
                    >
                      <div
                        className="flex flex-col flex-1 cursor-pointer min-w-0"
                        onClick={() => setSelectedSpell(spell)}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          spell.level === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {spell.level === 0 ? 'Mineur' : `Niv. ${spell.level}`}
                        </span>
                          <span className="font-bold text-xs text-slate-200 truncate">{spell.name}</span>
                        </div>
                        <span className="text-[8px] text-slate-400 mt-0.5 truncate">{spell.school}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {spell.level > 0 && (
                          <button
                            type="button"
                            onClick={() => togglePreparedSpell(spell.id)}
                            className={`p-2 rounded-lg text-xs font-bold border transition-all ${
                              isPrepared
                                ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                            }`}
                          >
                            {isPrepared ? (
                              <CheckCheck className="w-3 h-3" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => toggleKnownSpell(spell.id)}
                          className="p-2 rounded-lg text-xs font-bold bg-slate-800 border border-slate-700 text-slate-500 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL FULLSCREEN : BIBLE DES SORTS ================= */}
      {isCatalogOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col p-2 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))] animate-in fade-in duration-150">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800 shrink-0">
            <div>
              <h3 className="text-base font-bold text-white">Bible des Sorts</h3>
              <p className="text-[11px] text-slate-400">Ajoutez des sorts à votre grimoire</p>
            </div>
            <button
              type="button"
              onClick={() => setIsCatalogOpen(false)}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative mb-2 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher dans la Bible des sorts..."
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 rounded-xl outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex-1 flex gap-1 min-h-0 overflow-hidden">
            {/* Sidebar des niveaux de la Bible */}
            <div className="w-auto shrink-0 flex flex-col gap-1 overflow-y-auto pr-0.5 scrollbar-none">
              {['ALL', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setCatalogLevelFilter(lvl as any)}
                  className={`py-1.5 px-1 text-[8px] font-bold rounded-lg text-center transition-all shrink-0 whitespace-nowrap ${
                    catalogLevelFilter === lvl
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {lvl === 'ALL' ? 'Tous' : lvl === 0 ? 'Mineur' : `Niv ${lvl}`}
                </button>
              ))}
            </div>

            {/* Liste triée alphabétiquement de la Bible */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-0.5 scrollbar-thin scrollbar-thumb-slate-700">
              {filteredCatalog.map((spell) => {
                const isKnown = knownIds.includes(spell.id);

                return (
                  <div
                    key={spell.id}
                    className="bg-slate-900 border border-slate-800 p-1.5 rounded-xl flex items-center justify-between gap-2"
                  >
                    <div
                      className="flex flex-col flex-1 cursor-pointer min-w-0"
                      onClick={() => setSelectedSpell(spell)}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded shrink-0">
                          Niv {spell.level}
                        </span>
                        <span className="font-bold text-xs text-slate-200 truncate">{spell.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-0.5 truncate">{spell.school}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleKnownSpell(spell.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1 transition-all shrink-0 ${
                        isKnown
                          ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-400'
                          : 'bg-blue-600 border-blue-500 text-white'
                      }`}
                    >
                      {isKnown ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

{/* ================= MODAL : FICHE DÉTAIL D'UN SORT ================= */}
{selectedSpell && (
  <div className="fixed inset-0 z-[110] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-2 animate-fadeIn">
    
    {/* Boîte principale de la modale strictement contenue dans l'écran */}
    <div className="relative z-10 bg-slate-900 border border-slate-800 w-full max-w-md max-h-[100%] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
      
      {/* En-tête du sort (Fixe) */}
      <div className="flex justify-between items-start p-2 pb-3 border-b border-slate-800 bg-slate-900 shrink-0">
        <div>
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
            Niveau {selectedSpell.level} — {selectedSpell.school}
          </span>
          <h3 className="text-base font-bold text-white mt-0.5">{selectedSpell.name}</h3>
        </div>
        <button
          type="button"
          onClick={() => setSelectedSpell(null)}
          className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Caractéristiques rapides du sort (Fixe) */}
      <div className="px-4 pt-3 shrink-0">
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-xl text-xs text-slate-300 border border-slate-800/80">
          <div>
            <strong className="text-slate-500">Incan.:</strong> {selectedSpell.castingTime}
          </div>
          <div>
            <strong className="text-slate-500">Portée:</strong> {selectedSpell.range}
          </div>
          <div>
            <strong className="text-slate-500">Comp.:</strong> {selectedSpell.components}
          </div>
          <div>
            <strong className="text-slate-500">Durée:</strong> {selectedSpell.duration}
          </div>
        </div>
      </div>

      {/* DESCRIPTION AVEC SCROLLBAR DÉDIÉE (Zone scrollable) */}
      <div className="flex-1 overflow-y-auto px-2 py-3 my-1 scrollbar-thin scrollbar-thumb-slate-700">
        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
          {selectedSpell.description}
        </p>
      </div>

      {/* Bouton de fermeture tactile (Fixe en bas de la modale, toujours visible) */}
      <div className="p-2 pt-2 border-t border-slate-800 bg-slate-900 shrink-0">
        <button
          type="button"
          onClick={() => setSelectedSpell(null)}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 font-bold text-white rounded-xl text-xs transition shadow-lg shadow-blue-950"
        >
          Fermer
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  );
};