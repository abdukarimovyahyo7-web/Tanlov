import React from 'react';
import { Download, Play, Sparkles, ShieldCheck, Users, Building, Cpu, Instagram, Crown, Smartphone } from 'lucide-react';
import { sound } from '../utils/audio.ts';

interface HeroSectionProps {
  onPlayClick: () => void;
  onDownloadClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onPlayClick, onDownloadClick }) => {
  return (
    <section id="hero" className="relative pt-12 pb-20 overflow-hidden">
      {/* Background neon glows & grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-cyan-600/15 via-purple-600/20 to-blue-500/10 blur-[130px] rounded-full" />
        <div className="absolute -top-10 left-10 w-72 h-72 bg-cyan-500/10 blur-[100px] rounded-full" />
        <div className="absolute top-60 right-10 w-80 h-80 bg-purple-600/15 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Futuristic Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono uppercase tracking-wider mb-6 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Versiya 1.2 • To'liq 3D Dvijok & Telefon Vidjetlari</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-['Space_Grotesk'] leading-[1.1]">
            Kelajak Shahringizni{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-500">
              3D Formatda Yaratildi
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            <strong className="text-cyan-300 font-semibold">«Tanlov Mahallasi v1.2»</strong> — O‘zbekistonning barcha 14 ta hududi (Xo‘jayli, Taxiatosh, Yangiyo‘l), 
            <strong className="text-amber-300"> eng baland $1 lik Burj Khalifa</strong>, Prezident Yordamchisi <strong className="text-cyan-300">Adiz Rajabov</strong>, aholi uchun Milliy Ishlar va ochiq GitHub manba kodlari!
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                sound.playClick();
                onDownloadClick();
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2.5 transition active:scale-95 group border border-cyan-400/30"
            >
              <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
              <span>O'yinni yuklab olish (APK)</span>
              <span className="text-[10px] bg-black/25 px-1.5 py-0.5 rounded font-mono">v1.2</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onPlayClick();
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0e1324] hover:bg-[#161f38] text-cyan-300 font-semibold text-sm sm:text-base border border-purple-500/40 hover:border-cyan-400 shadow-md shadow-purple-900/20 flex items-center justify-center gap-2.5 transition active:scale-95 group"
            >
              <Play className="w-4 h-4 fill-cyan-400 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>Real 3D dvijokda o'ynash</span>
            </button>
          </div>

          {/* Social Proof & Quick Highlights */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {/* Highlight 1: Burj Khalifa */}
            <div className="p-4 rounded-xl bg-gray-900/40 border border-amber-500/30 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 text-amber-400 mb-1">
                <Crown className="w-4 h-4" />
                <span className="text-xl sm:text-2xl font-bold font-mono">$1</span>
              </div>
              <p className="text-xs text-amber-200 font-bold">Burj Khalifa ($1 Eng Baland)</p>
            </div>

            {/* Highlight 2: Real 3D */}
            <div className="p-4 rounded-xl bg-gray-900/40 border border-cyan-500/30 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 text-cyan-400 mb-1">
                <Building className="w-4 h-4" />
                <span className="text-xl sm:text-2xl font-bold font-mono">Real 3D</span>
              </div>
              <p className="text-xs text-gray-300">200+ Shahar & Tumanlar</p>
            </div>

            {/* Highlight 3: Milliy Ishlar */}
            <div className="p-4 rounded-xl bg-gray-900/40 border border-emerald-500/30 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 text-emerald-400 mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-xl sm:text-2xl font-bold font-mono">Milliy Ishlar</span>
              </div>
              <p className="text-xs text-emerald-300">Kulolchilik, Zardo‘zlik, Non</p>
            </div>

            {/* Highlight 4: Prezident Yordamchisi */}
            <div className="p-4 rounded-xl bg-gray-900/40 border border-purple-500/30 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 text-purple-400 mb-1">
                <Crown className="w-4 h-4" />
                <span className="text-base sm:text-lg font-bold font-mono">Adiz Rajabov</span>
              </div>
              <p className="text-xs text-gray-300">Prezident Oliy Yordamchisi</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
