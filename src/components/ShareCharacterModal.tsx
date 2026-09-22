// src/components/ShareCharacterModal.tsx
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, QrCode, UserCheck, ShieldAlert } from 'lucide-react';
import { useCharacterStore } from '../store/useCharacterStore';
import { encodeCharacterPayload, decodeCharacterPayload } from '../utils/characterPayload';

interface ShareCharacterModalProps {
  onClose: () => void;
}

export const ShareCharacterModal: React.FC<ShareCharacterModalProps> = ({ onClose }) => {
  const [mode, setMode] = useState<'share' | 'scan'>('share');
  const activeCharacter = useCharacterStore((state) => state.getActiveCharacter());
  const importOrUpdateCharacter = useCharacterStore((state) => state.importOrUpdateCharacter);

  const [qrPayload, setQrPayload] = useState<string>('');
  const [scannedCharName, setScannedCharName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (activeCharacter) {
      const encoded = encodeCharacterPayload(activeCharacter);
      setQrPayload(encoded);
    }
  }, [activeCharacter]);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (mode === 'scan' && !scannedCharName) {
      scanner = new Html5QrcodeScanner(
        'char-qr-reader',
        { fps: 10, qrbox: { width: 240, height: 240 } },
        false
      );

      scanner.render(
        (decodedText) => {
          const char = decodeCharacterPayload(decodedText);
          if (char) {
            importOrUpdateCharacter(char);
            setScannedCharName(char.name);
            setErrorMsg(null);
            scanner?.clear();
          } else {
            setErrorMsg('QR Code invalide ou format non reconnu.');
          }
        },
        () => {}
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [mode, scannedCharName, importOrUpdateCharacter]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[100%] flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-400" />
            Partager / Importer un Personnage
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-xl bg-slate-800/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ONGLETS MODE */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => { setMode('share'); setScannedCharName(null); }}
            className={`py-2 rounded-lg text-xs font-bold transition ${
              mode === 'share' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Partager ({activeCharacter.name})
          </button>
          <button
            onClick={() => { setMode('scan'); setScannedCharName(null); }}
            className={`py-2 rounded-lg text-xs font-bold transition ${
              mode === 'scan' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Scanner un Personnage
          </button>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto space-y-4 pt-2">
          {mode === 'share' ? (
            <div className="flex flex-col items-center justify-center space-y-3 text-center">
              <div className="bg-white p-3 rounded-2xl shadow-xl">
                {qrPayload ? (
                  <QRCodeSVG value={qrPayload} size={220} level="L" />
                ) : (
                  <p className="text-xs text-red-400">Erreur lors de la génération du QR Code</p>
                )}
              </div>
              <p className="text-xs text-slate-400 max-w-xs">
                Fais scanner ce code pour transférer la fiche complète de <strong className="text-white">{activeCharacter.name}</strong>.
              </p>
            </div>
          ) : scannedCharName ? (
            <div className="py-6 text-center space-y-3">
              <UserCheck className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-white text-base">Personnage Importé !</h4>
              <p className="text-xs text-slate-300">
                <strong className="text-emerald-400">{scannedCharName}</strong> a été ajouté à tes personnages et est maintenant actif.
              </p>
              <button
                onClick={onClose}
                className="mt-2 w-full py-3 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-700"
              >
                Terminer
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {errorMsg && (
                <div className="p-2.5 bg-red-950/50 border border-red-800 rounded-xl flex items-center gap-2 text-xs text-red-300">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              <div id="char-qr-reader" className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};