import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Globe,
  Monitor,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Github,
} from 'lucide-react';
import { sound } from '../utils/audio.ts';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayInBrowser: () => void;
  onOpenGitHub?: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose, onPlayInBrowser, onOpenGitHub }) => {
  const [downloadStarted, setDownloadStarted] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState<boolean>(false);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const triggerApkDownload = () => {
    sound.playCash();
    setDownloadStarted(true);
    setShowInstructions(true);

    // Create a real anchor element to download the generated APK package
    const link = document.createElement('a');
    link.href = '/downloads/tanlov-mahallasi-v2.4-cyber.apk';
    link.download = 'tanlov-mahallasi-v2.4-cyber.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePwaInstall = async () => {
    sound.playBuild();
    if (isInstallable) {
      await install();
      onClose();
    } else if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      onPlayInBrowser();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0e1424] border border-cyan-500/50 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative my-auto animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white bg-gray-900/60 transition"
          aria-label="Yopish"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 p-[1px] shrink-0">
            <div className="w-full h-full bg-[#0b0f19] rounded-[11px] flex items-center justify-center text-cyan-400">
              <Download className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
              <span>O'yinni Yuklab Olish</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                v2.4 Cyber
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              «Tanlov Mahallasi» mobil telefon yoki kompyuteringiz uchun
            </p>
          </div>
        </div>

        {/* Success notification banner after download click */}
        {downloadStarted && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs flex flex-col gap-2 animate-fadeIn shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">
                APK faylini yuklab olish boshlandi!
              </span>
            </div>
            <p className="text-[11px] text-gray-300">
              Agar yuklash avtomatik boshlanmagan bo'lsa, quyidagi tugmani bosing:
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="/downloads/tanlov-mahallasi-v2.4-cyber.apk"
                download="tanlov-mahallasi-v2.4-cyber.apk"
                className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-[11px] font-bold inline-flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>To'g'ridan-to'g'ri APK yuklash</span>
              </a>
              <span className="text-[10px] text-emerald-400/80 font-mono">
                (Hajmi: 4.2 MB)
              </span>
            </div>
          </div>
        )}

        {/* Download options list */}
        <div className="space-y-3 mb-5">
          {/* Option 1: Android APK File */}
          <div className="p-4 rounded-xl bg-gray-900/80 border border-cyan-500/40 hover:border-cyan-400 transition flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-white">Android APK Fayli</h4>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/40 font-mono">
                      Tayyor
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Barcha Android telefonlar (Samsung, Xiaomi, Vivo, Honor, va b.)
                  </p>
                </div>
              </div>
              <button
                onClick={triggerApkDownload}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-600/30 transition shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>APK Yuklash</span>
              </button>
            </div>

            {/* Instruction toggle */}
            <div className="border-t border-gray-800/80 pt-2 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>100% xavfsiz • Reklamasiz</span>
              </div>
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition"
              >
                <span>{showInstructions ? "Yo'riqnomani yopish" : "O'rnatish yo'riqnomasi"}</span>
                {showInstructions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Step-by-step instructions */}
            {showInstructions && (
              <div className="mt-2 p-3 rounded-lg bg-black/60 border border-cyan-500/20 text-gray-300 text-xs space-y-2 animate-fadeIn font-sans">
                <p className="font-semibold text-cyan-300 text-[11px] uppercase tracking-wide font-mono">
                  Telefonda APK o'rnatish tartibi:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-300 leading-relaxed">
                  <li>
                    <strong className="text-white">APK yuklab olish:</strong> Yuqoridagi «APK Yuklash» tugmasini bosing va fayl yuklanishini kuting.
                  </li>
                  <li>
                    <strong className="text-white">Faylni ochish:</strong> Telefonda brauzer yuklamalari yoki «Fayllar» (Downloads) jildidan <code className="text-cyan-300 bg-gray-900 px-1 py-0.5 rounded text-[10px]">tanlov-mahallasi-v2.4-cyber.apk</code> faylini bosing.
                  </li>
                  <li>
                    <strong className="text-white">Ruxsat berish:</strong> Agar so'ralsa, telefon sozlamalaridan «Noma'lum manbalardan o'rnatish» (Install unknown apps) ga ruxsat bering.
                  </li>
                  <li>
                    <strong className="text-white">«O'rnatish» (Install)</strong> tugmasini bosing va o'yinni boshlang!
                  </li>
                </ol>
              </div>
            )}
          </div>

          {/* Option 2: 1-Tap Direct Web App Install (Android / PWA WebAPK) */}
          <div className="p-4 rounded-xl bg-gray-900/80 border border-purple-500/40 hover:border-purple-400 transition flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-purple-400 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-white">1 Bosishda O'rnatish (WebAPK)</h4>
                  <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.2 rounded border border-purple-500/40 font-mono">
                    Tezkor
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  {isInstalled
                    ? "Ilova allaqachon qurilmangizga o'rnatilgan!"
                    : "APK ochmasdan, to'g'ridan-to'g'ri telefon bosh ekraniga qo'shish"}
                </p>
              </div>
            </div>
            <button
              onClick={handlePwaInstall}
              disabled={isInstalled}
              className={`px-3.5 py-2 rounded-lg text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition shrink-0 ${
                isInstalled
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isInstalled ? "O'rnatilgan" : "Ekranga Qo'shish"}</span>
            </button>
          </div>

          {/* iOS Safari instructions if active */}
          {showIOSInstructions && (
            <div className="p-3 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-200 text-xs space-y-1.5 animate-fadeIn">
              <div className="font-bold flex items-center gap-1 text-white">
                <HelpCircle className="w-4 h-4 text-purple-400" />
                <span>iPhone / iPad (iOS Safari) o'rnatish:</span>
              </div>
              <p className="text-[11px] text-gray-300">
                1. Safari pastki menyusidagi <strong>«Ulashish» (Share)</strong> belgisini bosing.<br />
                2. Ro'yxatdan <strong>«Bosh ekranga qo'shish» (Add to Home Screen)</strong> bandini tanlang.
              </p>
            </div>
          )}

          {/* Option 3: PC / Mac Browser 3D Engine */}
          <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-700/60 hover:border-gray-600 transition flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300 shrink-0">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Brauzerda To'g'ridan-to'g'ri O'ynash</h4>
                <p className="text-[11px] text-gray-400">Hech qanday yuklamasiz, 3D izometrik dvijok</p>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onPlayInBrowser();
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-cyan-300 text-xs font-semibold transition shrink-0"
            >
              Hozir O'ynash
            </button>
          </div>

          {/* Option 4: GitHub Source Code & ZIP (O'zingizga Sayt Yarating) */}
          {onOpenGitHub && (
            <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-700 hover:border-cyan-400 transition flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-600 flex items-center justify-center text-white shrink-0">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-white">GitHub Manba Kodlari & ZIP</h4>
                    <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/40 font-mono">
                      Ochiq Kod
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Barcha fayllarni olib o'zingizga yangi shaxsiy sayt yarating
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                  onOpenGitHub();
                }}
                className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition shrink-0"
              >
                Fayllarni Olish
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-800/80">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-mono">
            <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>tanlov-mahallasi-v2.4-cyber.apk</span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
