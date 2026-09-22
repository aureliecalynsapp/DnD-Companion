// src/App.tsx
import { useState } from 'react';
import { ShieldCheck, Zap, ScrollText, UserCog, HeartPulse, Backpack } from 'lucide-react';
import { useCharacterStore } from './store/useCharacterStore';
import { getProficiencyBonus } from './utils/dnd';
import { CombatTab } from './components/CombatTab';
import { SheetTab } from './components/SheetTab';
import { SpellsTab } from './components/SpellsTab';
import { BagTab } from './components/BagTab';
import { SettingsTab } from './components/SettingsTab';
import { InstallPrompt } from './components/InstallPrompt';
import { useWakeLock } from './hooks/useWakeLock';

type TabId = 'combat' | 'fiche' | 'sorts' | 'sac' | 'perso';

export default function App() {
  useWakeLock();

  const [activeTab, setActiveTab] = useState<TabId>('combat');
  
  // Récupération dynamique du personnage actif
  const rawCharacter = useCharacterStore((state) => state.getActiveCharacter());
  
  // Récupération du niveau de zoom global (par défaut 100)
  const zoomLevel = useCharacterStore((state) => state.zoomLevel ?? 100);

  // Sécurité si aucun personnage n'est sélectionné
  if (!rawCharacter) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <p className="text-slate-400 text-sm">Aucun personnage actif trouvé.</p>
      </div>
    );
  }

  // Normalisation sécurisée (purement locale au rendu)
  const character = {
    ...rawCharacter,
    knownSpellIds: rawCharacter.knownSpellIds ?? [],
    preparedSpellIds: rawCharacter.preparedSpellIds ?? [],
    spellcastingAbility: rawCharacter.spellcastingAbility ?? 'INT',
  };

  const pb = getProficiencyBonus(character.level || 1);
  const hpMax = character.hp?.max || 1;
  const hpCurrent = character.hp?.current ?? 0;
  const hpPercentage = Math.min(100, Math.max(0, (hpCurrent / hpMax) * 100));

  return (
    // Fond global couvrant tout l'écran, centré pour éviter le décalage du zoom
    <div className="h-[100dvh] w-screen overflow-hidden bg-slate-950 text-slate-100 flex justify-center items-center font-sans select-none antialiased">
      
      {/* CONTENEUR PRINCIPAL CENTRÉ ET RESPONSIVE */}
      <div 
        className="h-full w-full max-w-md bg-slate-950 flex flex-col relative shadow-2xl overflow-hidden transition-all duration-150"
        style={{ zoom: `${zoomLevel}%` }}
      >
        <InstallPrompt />

        {/* HEADER FIXE */}
        <header className="shrink-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-2 pb-1 pt-[calc(0.75rem+env(safe-area-inset-top))] shadow-lg z-40">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-none">{character.name}</h1>
              <p className="text-xs text-slate-400 mt-1">
                {character.class} Niv. {character.level} — {character.race}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 border border-amber-800 px-2.5 py-1 rounded-md">
              PB +{pb}
            </span>
          </div>
          
          {/* Jauge de PV tactile */}
          <div className="relative w-full h-5 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-inner">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-200 ease-out"
              style={{ width: `${hpPercentage}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-bold text-white drop-shadow">
              <span className="flex items-center gap-1">
                <HeartPulse className="w-4 h-4 text-red-300" />
                PV Actuels
              </span>
              <span className="font-mono text-sm">{hpCurrent} / {hpMax}</span>
            </div>
          </div>
        </header>

        {/* CONTENU CENTRAL AVEC SCROLLBAR PROpre (Seule cette zone défile) */}
        <main className="flex-1 overflow-y-auto p-2 w-full flex flex-col scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-950">
          {activeTab === 'combat' && <CombatTab />}
          {activeTab === 'fiche' && <SheetTab />}
          {activeTab === 'sorts' && <SpellsTab />}
          {activeTab === 'sac' && <BagTab />}
          {activeTab === 'perso' && <SettingsTab />}
        </main>

        {/* NAVIGATION FIXE EN BAS */}
        <nav className="shrink-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 pb-safe z-40">
          <div className="flex justify-around items-center h-12 w-full px-1">
            {[
              { id: 'combat', label: 'Combat', icon: Zap },
              { id: 'fiche', label: 'Fiche', icon: ShieldCheck },
              { id: 'sorts', label: 'Sorts', icon: ScrollText },
              { id: 'sac', label: 'Sac', icon: Backpack },
              { id: 'perso', label: 'Perso', icon: UserCog },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}