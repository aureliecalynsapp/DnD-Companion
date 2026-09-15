// src/App.tsx
import { useState } from 'react';
import { ShieldCheck, Zap, ScrollText, UserCog, HeartPulse, Backpack } from 'lucide-react';
import { useCharacterStore, getProficiencyBonus } from './store/useCharacterStore';
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
  const character = useCharacterStore((state) => state.character);

  const pb = getProficiencyBonus(character.level);
  const hpPercentage = Math.min(100, Math.max(0, (character.hp.current / character.hp.max) * 100));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      <InstallPrompt />

      {/* HEADER FIXE AVEC SAFE AREA IOS & PWA */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-none">{character.name}</h1>
            <p className="text-xs text-slate-400 mt-1">{character.class} Niv. {character.level} — {character.race}</p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 border border-amber-800 px-2.5 py-1 rounded-md">
            PB +{pb}
          </span>
        </div>
        
        {/* Jauge de PV tactile */}
        <div className="relative w-full h-7 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-inner">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-200 ease-out"
            style={{ width: `${hpPercentage}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-bold text-white drop-shadow">
            <span className="flex items-center gap-1">
              <HeartPulse className="w-4 h-4 text-red-300" />
              PV Actuels
            </span>
            <span className="font-mono text-sm">{character.hp.current} / {character.hp.max}</span>
          </div>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-grow pb-28 p-4 max-w-md mx-auto w-full">
        {activeTab === 'combat' && <CombatTab />}
        {activeTab === 'fiche' && <SheetTab />}
        {activeTab === 'sorts' && <SpellsTab />}
        {activeTab === 'sac' && <BagTab />}
        {activeTab === 'perso' && <SettingsTab />}
      </main>

      {/* BOTTOM NAVIGATION FIXED (5 ONGLETS) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 pb-safe">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-1">
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
  );
}