import React, { useState } from 'react';
import { Sparkles, BookOpen, Search, Eye, Check, Plus, Trash2, X, GraduationCap } from 'lucide-react';
import { useCharacterStore } from '../store/useCharacterStore';
import type { Spell, SpellcastingAbility } from '../types/character';
import spellsDataJson from '../data/spells_fr.json';
import { getSpellSaveDC, getSpellAttackBonus, getSpellcastingModifier } from '../utils/dnd';

const spellsData = spellsDataJson as Spell[];

export const SpellsTab: React.FC = () => {
  const character = useCharacterStore((state) => state.getActiveCharacter());
  const useSpellSlot = useCharacterStore((state) => state.useSpellSlot);
  const toggleKnownSpell = useCharacterStore((state) => state.toggleKnownSpell);
  const togglePreparedSpell = useCharacterStore((state) => state.togglePreparedSpell);
  const setSpellcastingAbility = useCharacterStore((state) => state.setSpellcastingAbility);
  const setSpellSlotMax = useCharacterStore((state) => state.setSpellSlotMax);

  const [subTab, setSubTab] = useState<'live' | 'grimoire'>('live');
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  const [grimoireSearch, setGrimoireSearch] = useState('');
  const [grimoireLevelFilter, setGrimoireLevelFilter] = useState<number | 'ALL'>('ALL');

  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogLevelFilter, setCatalogLevelFilter] = useState<number | 'ALL'>('ALL');

  if (!character) return null;

  const knownIds = character.knownSpellIds || [];
  const preparedIds = character.preparedSpellIds || [];

  const knownSpells = spellsData.filter((s) => knownIds.includes(s.id));
  const activeSpells = spellsData.filter(
    (s) => (s.level === 0 && knownIds.includes(s.id)) || preparedIds.includes(s.id)
  );

  const spellEntries = Object.entries(character.spellSlots || {})
    .map(([lvl, slot]) => ({
      level: Number(lvl),
      max: Math.min(slot.max, 9),
      used: slot.used,
    }))
    .filter((slot) => slot.max > 0)
    .sort((a, b) => a.level - b.level);

  const filteredGrimoire = knownSpells.filter((spell) => {
    const matchesSearch = spell.name.toLowerCase().includes(grimoireSearch.toLowerCase());
    const matchesLevel = grimoireLevelFilter === 'ALL' || spell.level === grimoireLevelFilter;
    return matchesSearch && matchesLevel;
  });

  const filteredCatalog = spellsData.filter((spell) => {
    const matchesSearch = spell.name.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesLevel = catalogLevelFilter === 'ALL' || spell.level === catalogLevelFilter;
    return matchesSearch && matchesLevel;
  });

  const spellMod = getSpellcastingModifier(character);
  const spellDC = getSpellSaveDC(character);
  const spellAttack = getSpellAttackBonus(character);

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden">
      {/* SÉLECTEUR DE SOUS-ONGLETS */}
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
          <Sparkles className="w-4 h-4" /> En Combat ({activeSpells.length})
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

      {/* --- SOUS-ONGLET 1 : EN COMBAT --- */}
      {subTab === 'live' && (
        <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-hidden">
          {/* STATS & EMPLACEMENTS */}
          <div className="shrink-0 space-y-2">
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

              {character.spellcastingAbility && character.spellcastingAbility !== 'NONE' ? (
                <div className="grid grid-cols-3 gap-1 flex-1">
                  <div className="flex flex-col items-center justify-center bg-slate-950 py-1 px-0.5 rounded-lg border border-slate-800/80">
                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Mod.</span>
                    <span className="text-xs font-mono font-black text-amber-400">
                      {spellMod >= 0 ? `+${spellMod}` : spellMod}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center bg-slate-950 py-1 px-0.5 rounded-lg border border-slate-800/80">
                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">DD</span>
                    <span className="text-xs font-mono font-black text-blue-400">
                      {spellDC}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center bg-slate-950 py-1 px-0.5 rounded-lg border border-slate-800/80">
                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Att.</span>
                    <span className="text-xs font-mono font-black text-emerald-400">
                      {spellAttack >= 0 ? `+${spellAttack}` : spellAttack}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 text-center text-[10px] text-slate-500 italic">
                  Aucune caractéristique
                </div>
              )}
            </div>

            {spellEntries.length > 0 && (
              <div className="space-y-1">
                <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                  Emplacements
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  {spellEntries.map(({ level, max, used }) => {
                    const remaining = Math.max(0, max - used);
                    return (
                      <div key={level} className="bg-slate-900 border border-slate-800 rounded-xl p-2 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-1.5">
                          <h3 className="font-bold text-slate-200 text-[11px]">Niv. {level}</h3>
                          <span className="text-[10px] font-mono text-slate-400">
                            <strong className={remaining > 0 ? 'text-blue-400 font-bold' : 'text-slate-500'}>
                              {remaining}
                            </strong>
                            /{max}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          {Array.from({ length: max }).map((_, index) => {
                            const isUsed = index < used;
                            return (
                              <button
                                key={index}
                                onClick={() => useSpellSlot(level, isUsed ? -1 : 1)}
                                type="button"
                                className={`h-7 rounded-md border flex items-center justify-center transition-all active:scale-90 ${
                                  isUsed
                                    ? 'bg-slate-950/80 border-slate-800/80 text-slate-700'
                                    : 'bg-blue-950/40 border-blue-500/50 text-blue-400'
                                }`}
                              >
                                <Sparkles className={`w-3 h-3 ${isUsed ? 'opacity-20' : 'opacity-100'}`} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1.5 shrink-0">
              Sorts disponibles en combat ({activeSpells.length})
            </h2>

            {activeSpells.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 bg-slate-900/40 border border-slate-800 rounded-xl">
                Aucun sort prêt.
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                {activeSpells.map((spell) => (
                  <div
                    key={spell.id}
                    onClick={() => setSelectedSpell(spell)}
                    className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-2.5 rounded-xl flex items-center justify-between cursor-pointer active:scale-[0.99]"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          spell.level === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {spell.level === 0 ? 'Tours' : `Niv. ${spell.level}`}
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

      {/* --- SOUS-ONGLET 2 : GRIMOIRE --- */}
      {subTab === 'grimoire' && (
        <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-hidden">
          {/* HEADER & RECHERCHE */}
          <div className="shrink-0 space-y-2">
            <details className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 group">
              <summary className="text-xs font-bold text-slate-300 cursor-pointer flex justify-between items-center select-none">
                <span>Éditer les emplacements max (Niv 1-9)</span>
                <span className="text-blue-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => {
                  const max = character.spellSlots?.[lvl]?.max || 0;
                  return (
                    <div key={lvl} className="flex flex-col items-center bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400">Niv {lvl}</span>
                      <input
                        type="number"
                        min="0"
                        max="9"
                        value={max}
                        onChange={(e) => setSpellSlotMax(lvl, parseInt(e.target.value) || 0)}
                        className="w-10 text-center bg-slate-900 border border-slate-700 rounded mt-0.5 font-bold text-white text-xs py-0.5"
                      />
                    </div>
                  );
                })}
              </div>
            </details>

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

          {/* LAYOUT SIDEBAR VERTICALE + LISTE */}
          <div className="flex-1 flex gap-2 min-h-0 overflow-hidden">
            {/* SIDEBAR VERTICALE COMPacte AU MINIMUM DU TEXTE */}
            <div className="w-auto shrink-0 flex flex-col gap-1 overflow-y-auto pr-0.5 scrollbar-none">
              {['ALL', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setGrimoireLevelFilter(lvl as any)}
                  className={`py-1.5 px-2 text-[10px] font-bold rounded-lg text-center transition-all shrink-0 whitespace-nowrap ${
                    grimoireLevelFilter === lvl
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {lvl === 'ALL' ? 'Tous' : lvl === 0 ? 'Tours' : `Niv ${lvl}`}
                </button>
              ))}
            </div>

            {/* LISTE DES SORTS DU GRIMOIRE */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
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
                      className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between gap-2"
                    >
                      <div
                        className="flex flex-col flex-1 cursor-pointer min-w-0"
                        onClick={() => setSelectedSpell(spell)}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          spell.level === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {spell.level === 0 ? 'Tours' : `Niv. ${spell.level}`}
                        </span>
                          <span className="font-bold text-xs text-slate-200 truncate">{spell.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5 truncate">{spell.school}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {spell.level > 0 && (
                          <button
                            type="button"
                            onClick={() => togglePreparedSpell(spell.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1 transition-all ${
                              isPrepared
                                ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            {isPrepared ? 'Prêt' : 'Préparer'}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => toggleKnownSpell(spell.id)}
                          className="p-2 rounded-lg text-xs font-bold bg-slate-800 border border-slate-700 text-slate-500 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* --- MODAL FULLSCREEN RÉFÉRENTIEL --- */}
      {isCatalogOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col p-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))] animate-in fade-in duration-150">
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-800 shrink-0">
            <div>
              <h3 className="text-base font-bold text-white">Référentiel des Sorts</h3>
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

          <div className="relative mb-3 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher dans le référentiel..."
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 rounded-xl outline-none focus:border-blue-500"
            />
          </div>

          {/* LAYOUT SIDEBAR VERTICALE MODALE */}
          <div className="flex-1 flex gap-2 min-h-0 overflow-hidden">
            {/* SIDEBAR VERTICALE COMPacte AU MINIMUM DU TEXTE */}
            <div className="w-auto shrink-0 flex flex-col gap-1 overflow-y-auto pr-0.5 scrollbar-none">
              {['ALL', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setCatalogLevelFilter(lvl as any)}
                  className={`py-1.5 px-2 text-[10px] font-bold rounded-lg text-center transition-all shrink-0 whitespace-nowrap ${
                    catalogLevelFilter === lvl
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {lvl === 'ALL' ? 'Tous' : lvl === 0 ? 'Tours' : `Niv ${lvl}`}
                </button>
              ))}
            </div>

            {/* LISTE DES SORTS DU CATALOGUE */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
              {filteredCatalog.map((spell) => {
                const isKnown = knownIds.includes(spell.id);

                return (
                  <div
                    key={spell.id}
                    className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between gap-2"
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
                      {isKnown ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Acquis
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" /> Apprendre
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCatalogOpen(false)}
            className="w-full mt-3 py-3 bg-slate-900 border border-slate-800 font-bold text-white rounded-xl text-xs shrink-0"
          >
            Terminer la sélection
          </button>
        </div>
      )}

      {/* --- MODAL FICHE DETAIL SORT --- */}
      {selectedSpell && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-4 max-h-[85vh] overflow-y-auto shadow-2xl scrollbar-thin scrollbar-thumb-slate-700">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                  Niveau {selectedSpell.level} — {selectedSpell.school}
                </span>
                <h3 className="text-lg font-bold text-white">{selectedSpell.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSpell(null)}
                className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-xl text-xs text-slate-300 mb-3 border border-slate-800/80">
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

            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {selectedSpell.description}
            </p>

            <button
              type="button"
              onClick={() => setSelectedSpell(null)}
              className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-500 font-bold text-white rounded-xl text-xs"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};