import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, QrCode, Scan, ArrowRightLeft, Package, Coins } from 'lucide-react';
import { useCharacterStore } from '../store/useCharacterStore';
import { NumberInput } from './common/NumberInput';
import { encodeTradePayload, decodeTradePayload } from '../utils/tradePayload';
import type { Item, Currency } from '../types/character';

interface TradeModalProps {
  onClose: () => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({ onClose }) => {
  // Récupération dynamique du personnage actif et des actions du store Zustand
  const character = useCharacterStore((state) => state.getActiveCharacter());
  const updateCurrency = useCharacterStore((state) => state.updateCurrency);
  const updateItemQuantity = useCharacterStore((state) => state.updateItemQuantity);
  const receiveTrade = useCharacterStore((state) => state.receiveTrade);

  const inventory = character.inventory || [];
  const currency = character.currency || { pc: 0, pa: 0, po: 0, pp: 0 };

  // État local pour basculer entre le mode Don (génération QR) et le mode Réception (scanner)
  const [mode, setMode] = useState<'send' | 'receive'>('send');

  // État local du formulaire d'échange
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [sendQty, setSendQty] = useState<number>(1);
  const [sendGold, setSendGold] = useState<number>(0);
  const [tradePayload, setTradePayload] = useState<string | null>(null);
  const [scannedSuccess, setScannedSuccess] = useState<boolean>(false);

  // Recherche de l'objet sélectionné dans l'inventaire actif
  const selectedItem = inventory.find((i) => i.id === selectedItemId);

  // Ajustement automatique de la quantité par défaut lors du choix de l'objet
  useEffect(() => {
    if (selectedItem) {
      setSendQty(1);
    } else {
      setSendQty(0);
    }
  }, [selectedItemId]);

  // Génération du QR Code d'échange et déduction immédiate des éléments de l'inventaire/bourse
  const handleGenerateQR = () => {
    let itemsToTrade: Omit<Item, 'id'>[] | undefined;
    let currencyToTrade: Partial<Currency> | undefined;

    if (selectedItemId && selectedItem && sendQty > 0) {
      itemsToTrade = [{ name: selectedItem.name, quantity: sendQty, weight: selectedItem.weight }];
      updateItemQuantity(selectedItem.id, -sendQty);
    }

    if (sendGold > 0) {
      currencyToTrade = { po: sendGold };
      updateCurrency({ po: -sendGold });
    }

    if (itemsToTrade || currencyToTrade) {
      const encoded = encodeTradePayload(itemsToTrade, currencyToTrade);
      setTradePayload(encoded);
    }
  };

  // Référence pour piloter proprement l'instance de la caméra et éviter les flux fantômes
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Gestion du cycle de vie du scanner QR (démarrage à l'ouverture de l'onglet et nettoyage strict au démontage ou changement de mode)
  useEffect(() => {
    if (mode === 'receive' && !scannedSuccess) {
      const timer = setTimeout(() => {
        const qrCodeInstance = new Html5Qrcode('qr-reader');
        scannerRef.current = qrCodeInstance;

        qrCodeInstance
          .start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 220, height: 220 } },
            (decodedText) => {
              const tradeData = decodeTradePayload(decodedText);
              if (tradeData) {
                receiveTrade(tradeData);
                setScannedSuccess(true);
                qrCodeInstance.stop().catch(() => {});
              } else {
                console.error("Code QR d'échange invalide");
              }
            },
            () => {}
          )
          .catch((err) => {
            console.error('Impossible de démarrer la caméra', err);
          });
      }, 150);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          const instance = scannerRef.current;
          scannerRef.current = null;
          if (instance.isScanning) {
            instance
              .stop()
              .then(() => {
                try {
                  instance.clear();
                } catch {}
              })
              .catch(() => {
                try {
                  instance.clear();
                } catch {}
              });
          } else {
            try {
              instance.clear();
            } catch {}
          }
        }
      };
    }
  }, [mode, scannedSuccess, receiveTrade]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-5 max-h-[100%] flex flex-col">
        {/* EN-TÊTE DE LA MODALE */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-lg">
            <ArrowRightLeft className="w-5 h-5" />
            <span>Échange P2P ({character.name})</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 active:scale-95 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SÉLECTEUR D'ONGLETS (DONNER / RECEVOIR) */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/60 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMode('send');
              setTradePayload(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'send'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Donner (QR Code)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('receive');
              setScannedSuccess(false);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'receive'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scan className="w-4 h-4" />
            Recevoir (Scanner)
          </button>
        </div>

        {/* CORPS DE LA MODALE AVEC DÉFILEMENT FLUIDE */}
        <div className="overflow-y-auto space-y-4 pr-1">
          {mode === 'send' ? (
            tradePayload ? (
              // VUE AFFICHAGE DU QR CODE GÉNÉRÉ
              <div className="flex flex-col items-center justify-center space-y-4 py-2 text-center">
                <div className="bg-white p-4 rounded-2xl shadow-2xl">
                  <QRCodeSVG value={tradePayload} size={200} level="M" />
                </div>
                <p className="text-xs text-slate-400 max-w-xs">
                  Fais scanner ce QR Code par un autre joueur pour finaliser l'envoi.
                </p>
                <button
                  type="button"
                  onClick={() => setTradePayload(null)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-700 active:scale-95 transition-all"
                >
                  Nouveau don
                </button>
              </div>
            ) : (
              // VUE FORMULAIRE DE SÉLECTION (OBJETS / OR)
              <div className="space-y-4">
                {/* SÉLECTION DE L'OBJET DANS LE SAC */}
                <div className="space-y-1">
                  <label className="text-slate-400 text-xs font-medium flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-amber-400" />
                    Objet du sac
                  </label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm font-semibold text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="">-- Aucun objet --</option>
                    {inventory.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} (x{item.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                {/* QUANTITÉ DE L'OBJET À DONNER */}
                {selectedItemId && (
                  <NumberInput
                    label="Quantité à donner"
                    icon={<Package className="w-3.5 h-3.5 text-amber-400" />}
                    value={sendQty}
                    min={1}
                    max={selectedItem?.quantity || 1}
                    onChange={(val) => setSendQty(val)}
                  />
                )}

                {/* QUANTITÉ DE PIÈCES D'OR */}
                <NumberInput
                  label="Pièces d'Or (PO)"
                  icon={<Coins className="w-3.5 h-3.5 text-amber-400" />}
                  value={sendGold}
                  min={0}
                  max={currency.po || 0}
                  onChange={(val) => setSendGold(val)}
                />

                {/* BOUTON DE VALIDATION POUR GÉNÉRER LE QR */}
                <button
                  type="button"
                  onClick={handleGenerateQR}
                  disabled={(!selectedItemId || sendQty <= 0) && sendGold <= 0}
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 rounded-2xl font-bold text-sm shadow-lg shadow-amber-500/10 active:scale-[0.98] transition-all mt-2"
                >
                  Générer le QR Code
                </button>
              </div>
            )
          ) : scannedSuccess ? (
            // VUE DE SUCCÈS APRÈS SCAN RÉUSSI
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                ✓
              </div>
              <h3 className="font-bold text-white text-base">Échange Réussi !</h3>
              <p className="text-xs text-slate-400">
                Les objets et/ou pièces d'or ont été ajoutés à l'inventaire de <strong>{character.name}</strong>.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-6 py-2.5 bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-700 active:scale-95 transition-all"
              >
                Fermer
              </button>
            </div>
          ) : (
            // VUE CONTENEUR DU SCANNER CAMÉRA
            <div className="space-y-3">
              <div id="qr-reader" className="w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 min-h-[240px]"></div>
              <p className="text-[11px] text-slate-500 text-center">
                Pointe la caméra vers le QR Code affiché sur l'écran de ton camarade.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};