import React, { useEffect, useState } from 'react';
import { Download, X, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Détecter si l'app est déjà installée (Mode Standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) return; // Ne rien faire si déjà installée

    // 2. Détection iOS / Safari (car pas de support de `beforeinstallprompt`)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    
    if (isIosDevice) {
      setIsIOS(true);
      // Afficher une fois par session sur iOS si non installée
      const iosDismissed = sessionStorage.getItem('pwa_ios_dismissed');
      if (!iosDismissed) {
        setIsVisible(true);
      }
      return;
    }

    // 3. Capturer l'événement Android / Chrome / Desktop
    const handler = (e: Event) => {
      e.preventDefault(); // Empêche la bannière native par défaut
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (isIOS) {
      sessionStorage.setItem('pwa_ios_dismissed', 'true');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-16 left-4 right-4 z-50 max-w-md mx-auto bg-slate-900 border border-blue-500/40 text-slate-100 p-3.5 rounded-xl shadow-2xl backdrop-blur-md animate-fadeIn">
      {isIOS ? (
        /* UI spécifique iOS */
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-white">Installer D&D Companion</span>
            </div>
            <button onClick={handleDismiss} className="p-1 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-slate-300 leading-tight">
            Appuie sur <Share className="w-3.5 h-3.5 inline text-blue-400 mx-0.5" /> puis sur <strong className="text-white">« Sur l'écran d'accueil »</strong> pour l'utiliser hors-ligne.
          </p>
        </div>
      ) : (
        /* UI Android / Chrome / Edge */
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-blue-400 shrink-0" />
            <span className="text-xs font-semibold">Installer l'app sur le mobile ?</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={handleInstallClick}
              className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
            >
              Installer
            </button>
            <button 
              onClick={handleDismiss}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};