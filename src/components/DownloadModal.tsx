import React, { useState } from 'react';
import { Download, Smartphone, Globe, Monitor, Check, X, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio.ts';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayInBrowser: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose, onPlayInBrowser }) => {
  const [downloadStarted, setDownloadStarted] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = (platform: string) => {
    sound.playCash();
    setDownloadStarted(platform);
    setTimeout(() => {
      setDownloadStarted(null);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0e1424] border border-cyan-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-scaleUp">
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white bg-gray-900/60"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 p-[1px]">
            <div className="w-full h-full bg-[#0b0f19] rounded-[11px] flex items-center justify-center text-cyan-400">
              <Download className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
              O'yinni Yuklab Olish
            </h3>
            <p className="text-xs text-gray-400">
              «Tanlov Mahallasi» 3D City Builder platformangizni tanlang
            </p>
          </div>
        </div>

        {downloadStarted && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{downloadStarted} uchun o'yin paketi tayyorlanmoqda va o'rnatish boshlandi!</span>
          </div>
        )}

        {/* Download options */}
        <div className="space-y-3 mb-6">
          {/* Option 1: Android APK */}
          <div className="p-4 rounded-xl bg-gray-900/70 border border-cyan-500/30 hover:border-cyan-400/60 transition flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Android APK (Mobil Telefon)</h4>
                <p className="text-[11px] text-gray-400">Hajmi: 42 MB • Versiya: 2.4 Cyber</p>
              </div>
            </div>
            <button
              onClick={() => handleDownload('Android APK')}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Yuklab olish</span>
            </button>
          </div>

          {/* Option 2: Web PWA (Instant install on iPhone / Android) */}
          <div className="p-4 rounded-xl bg-gray-900/70 border border-purple-500/30 hover:border-purple-400/60 transition flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Mobil Web PWA (Tezkor Ilova)</h4>
                <p className="text-[11px] text-gray-400">O'rnatishsiz, brauzerdan ekranga qo'shing</p>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onPlayInBrowser();
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>O'rnatish / O'ynash</span>
            </button>
          </div>

          {/* Option 3: PC / Mac */}
          <div className="p-4 rounded-xl bg-gray-900/70 border border-gray-700/60 hover:border-gray-600 transition flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Kompyuter Simulyatori (PC/Mac)</h4>
                <p className="text-[11px] text-gray-400">Web 3D dvijogi orqali to'liq ekran</p>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onPlayInBrowser();
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-cyan-300 text-xs font-semibold"
            >
              Ishga tushirish
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 text-xs font-semibold transition"
        >
          Yopish
        </button>
      </div>
    </div>
  );
};
