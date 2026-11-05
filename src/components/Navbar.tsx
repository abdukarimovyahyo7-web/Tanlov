import React from 'react';
import { Building2, Crown, Sparkles, Volume2, VolumeX, Mail, Instagram, Play } from 'lucide-react';
import { sound } from '../utils/audio.ts';

interface NavbarProps {
  isHokimGodMode: boolean;
  onToggleHokimGodMode: () => void;
  onOpenContact: () => void;
  onScrollToGame: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenDownload: () => void;
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
  lastSavedText,
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#070913]/85 border-b border-cyan-500/20">
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
                3D CITY
              </span>
            </div>
            <p className="text-[10px] text-gray-400 tracking-wide font-mono">Mening Shahrim • Hokim Simulator</p>
          </div>
        </a>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-300 whitespace-nowrap">
          <a href="#hero" className="hover:text-cyan-400 transition">Bosh sahifa</a>
          <a href="#features" className="hover:text-cyan-400 transition">Xususiyatlar</a>
          <a href="#game-section" onClick={onScrollToGame} className="hover:text-cyan-400 transition flex items-center gap-1 text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Shahar Qurish
          </a>
          <a href="#dashboard-section" className="hover:text-purple-400 transition">Hokimiyat Paneli</a>
          <a href="#gallery" className="hover:text-cyan-400 transition">Galereya</a>
        </nav>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Auto-save indicator */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono tracking-tight shadow-[0_0_8px_rgba(16,185,129,0.2)]"
            title="Barcha harakatlar har soniya avtomatik saqlanmoqda"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden md:inline">Har soniya saqlanmoqda</span>
            <span className="text-emerald-400 font-bold">{lastSavedText || 'Faol'}</span>
          </div>

          {/* Audio toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleSound();
            }}
            className="p-2 rounded-lg bg-gray-900/80 border border-gray-700/60 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 transition"
            title={soundEnabled ? "Ovozni o'chirish" : "Ovozni yoqish"}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
          </button>

          {/* Hokim God-Mode Button */}
          <button
            onClick={() => {
              sound.playGodMode();
              onToggleHokimGodMode();
            }}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              isHokimGodMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse'
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

          {/* Play / Jump button */}
          <button
            onClick={() => {
              sound.playClick();
              onScrollToGame();
            }}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-medium text-xs sm:text-sm shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>O'ynash</span>
          </button>
        </div>
      </div>
    </header>
  );
};
