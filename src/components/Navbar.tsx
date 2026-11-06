import React from 'react';
import {
  Building2,
  Crown,
  Sparkles,
  Volume2,
  VolumeX,
  Mail,
  Instagram,
  Play,
  Download,
  Smartphone,
  Github,
} from 'lucide-react';
import { sound } from '../utils/audio.ts';

interface NavbarProps {
  isHokimGodMode: boolean;
  onToggleHokimGodMode: () => void;
  onOpenContact: () => void;
  onScrollToGame: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenDownload: () => void;
  onOpenPhoneWidgets?: () => void;
  onOpenElectionModal?: () => void;
  onOpenGitHub?: () => void;
  currentDistrictName?: string;
  isPrezident?: boolean;
  lastSavedText?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  isHokimGodMode,
  onToggleHokimGodMode,
  onOpenContact,
  onScrollToGame,
  soundEnabled,
  onToggleSound,
  onOpenDownload,
  onOpenPhoneWidgets,
  onOpenElectionModal,
  onOpenGitHub,
  currentDistrictName,
  isPrezident,
  lastSavedText,
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#070913]/95 border-b border-cyan-500/30">
      {/* GRAND NEON BANNER: Bosh vazir qilib saylanish uchun email orqali bog'lanish */}
      <div className="w-full bg-gradient-to-r from-[#041d3d] via-[#240a38] to-[#042426] border-b border-cyan-400/70 py-2.5 px-3 text-center shadow-[0_0_30px_rgba(0,240,255,0.4)] relative overflow-hidden">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="text-yellow-400 text-base animate-pulse">⚡👑⚡</span>
          <span className="text-xs sm:text-sm md:text-base font-black uppercase font-['Chakra_Petch'] tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-yellow-300 to-pink-400 drop-shadow-[0_0_15px_rgba(0,240,255,0.9)]">
            BOSH VAZIR QILIB SAYLANISH UCHUN EMAIL ORQALI BOG'LANISH MUMKIN:
          </span>
          <button
            onClick={() => {
              sound.playClick();
              onOpenContact();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/20 hover:bg-cyan-400/40 border-2 border-cyan-300 text-cyan-200 text-xs sm:text-sm font-extrabold font-mono transition shadow-[0_0_20px_rgba(0,240,255,0.7)] underline underline-offset-4"
          >
            <Mail className="w-4 h-4 text-cyan-300" />
            <span>tanlovmahallasi@gmail.com</span>
          </button>
          <span className="text-yellow-400 text-base animate-pulse">⚡👑⚡</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#hero" className="flex items-center gap-2.5 group shrink-0 mr-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-400/40 transition shrink-0">
            <div className="w-full h-full bg-[#0b0f19] rounded-[11px] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="whitespace-nowrap">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base sm:text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 font-['Chakra_Petch']">
                TANLOV MAHALLASI
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30 uppercase font-mono tracking-tighter">
                v1.2 3D
              </span>
            </div>
            <p className="text-[10px] text-gray-400 tracking-wide font-mono">
              3D Real Dvijok • Burj Khalifa $1
            </p>
          </div>
        </a>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-300 whitespace-nowrap">
          <a href="#hero" className="hover:text-cyan-400 transition">
            Bosh sahifa
          </a>
          <a href="#features" className="hover:text-cyan-400 transition">
            Xususiyatlar
          </a>
          <a href="#game-section" className="text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>3D O'yin</span>
          </a>
          <a href="#dashboard-section" className="hover:text-cyan-400 transition">
            Hokimiyat
          </a>
          <a href="#gallery" className="hover:text-cyan-400 transition">
            3D Galereya
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Auto-save indicator badge */}
          {lastSavedText && (
            <div
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono"
              title="O'yin har bir harakatda va har soniyada avtomatik saqlanadi"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Har soniya: {lastSavedText}</span>
            </div>
          )}

          {/* Sound Toggle Button */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleSound();
            }}
            className="p-2 rounded-lg bg-gray-900/60 border border-gray-700/60 hover:border-cyan-500/50 hover:text-cyan-400 transition"
            title={soundEnabled ? "Ovozni o'chirish" : "Ovozni yoqish"}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
          </button>

          {/* Phone Widgets Button */}
          {onOpenPhoneWidgets && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenPhoneWidgets();
              }}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-950/70 border border-purple-500/50 text-purple-300 hover:bg-purple-500/20 text-xs font-semibold transition"
              title="Telefon ish stoli va vidjetlar"
            >
              <Smartphone className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden md:inline">Vidjetlar</span>
            </button>
          )}

          {/* Uzbekistan Elections & President Button */}
          {onOpenElectionModal && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenElectionModal();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-950/80 to-purple-950/80 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 text-xs font-bold font-mono transition shadow-md shadow-cyan-950/40"
              title="O'zbekiston shahar va tumanlari, Hokim saylovi va Prezidentlik kabineti"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">
                {isPrezident ? '👑 PREZIDENT' : 'Saylov & Shaharlar'}
              </span>
              <span className="text-[10px] bg-cyan-500/20 px-1.5 py-0.2 rounded text-cyan-200 hidden md:inline">
                {currentDistrictName || 'Chilonzor'}
              </span>
            </button>
          )}

          {/* Hokim God-Mode Button */}
          <button
            onClick={() => {
              sound.playGodMode();
              onToggleHokimGodMode();
            }}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              isHokimGodMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-gray-900/60 text-gray-300 border-gray-700 hover:border-amber-500/50 hover:text-amber-300'
            }`}
            title="Hokim vakolatlari: cheksiz byudjet va maxsus huquqlar"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>{isHokimGodMode ? "Hokim: Cheksiz Byudjet" : "Hokim Rejimi"}</span>
          </button>

          {/* Instagram Link (ONLY Instagram as required!) */}
          <a
            href="https://instagram.com/tanlovmahallasi"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="p-2 rounded-lg bg-gradient-to-tr from-amber-500/10 via-rose-500/10 to-purple-500/10 border border-pink-500/30 text-pink-400 hover:text-pink-300 hover:border-pink-500 transition"
            title="Rasmiy Instagram sahifamiz"
            aria-label="Instagram"
          >
            <Instagram className="w-4 h-4" />
          </a>

          {/* Contact email modal trigger */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenContact();
            }}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 transition flex items-center gap-1.5 text-xs font-medium"
            title="tanlovmahallasi@gmail.com orqali xabar yuborish"
          >
            <Mail className="w-4 h-4 text-cyan-400" />
            <span className="hidden lg:inline">Aloqa</span>
          </button>

          {/* GitHub Source Code Button */}
          {onOpenGitHub && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenGitHub();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-gray-900/90 border border-gray-700 hover:border-cyan-400 text-gray-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition shadow"
              title="GitHub manba kodlarini yuklab olish va o'zingizga yangi sayt yaratish"
            >
              <Github className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">GitHub Kodlar</span>
            </button>
          )}

          {/* APK / App Download button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenDownload();
            }}
            className="px-2.5 py-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Android APK yoki Web ilovani yuklab olish"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">APK Yuklash</span>
          </button>

          {/* Play / Jump button */}
          <button
            onClick={() => {
              sound.playClick();
              onScrollToGame();
            }}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-medium text-xs sm:text-sm shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>3D O'ynash</span>
          </button>
        </div>
      </div>
    </header>
  );
};
