import React from 'react';
import { Home, Users, Instagram, Crown, Sparkles, Hammer, Bot, Palette, ArrowUpRight, Smartphone, Gem } from 'lucide-react';
import { sound } from '../utils/audio.ts';

interface FeaturesSectionProps {
  onScrollToGame: () => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onScrollToGame }) => {
  return (
    <section id="features" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/50 border border-purple-500/30 text-purple-300 text-xs font-mono uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Versiya 1.2 Imkoniyatlari</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk']">
            Nega Aynan <span className="text-cyan-400">«Tanlov Mahallasi v1.2»</span>?
          </h2>
          <p className="mt-4 text-gray-400 text-sm sm:text-base">
            Endi 2D belgilar emas — haqiqiy 3D uylar, 2.000.000.000$ lik Burj Khalifa, 
            24K Oltin ranglar ($999.9), Instagram niklari va telefon ish stoli vidjetlari!
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Real 3D Uylar & Burj Khalifa */}
          <div className="relative group rounded-2xl bg-gradient-to-b from-[#11162b]/90 to-[#0c0f1d]/90 p-6 border border-amber-500/30 hover:border-amber-400/60 shadow-xl hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] transition duration-300 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
                <Crown className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-between">
                <span>Burj Khalifa & 3D Uylar</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
                  $1 (Eng Baland Minora)
                </span>
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Oddiy 2D piktogrammalar emas, balki to'liq 3D modellar! Shaharning eng baland minorasi Burj Khalifa (atigi $1), 
                Kiber Villa ($500), Savdo Majmuasi ($1,500), Kosmodrom ($5,000), Osmono'parlar va oddiy uylar ($30).
              </p>
            </div>
            <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs font-mono text-emerald-400">
              <span>Haqiqiy 3D Arxitektura & Burj Khalifa $1</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Aholi Uchun Milliy Ishlar & Kasblar */}
          <div className="relative group rounded-2xl bg-gradient-to-b from-[#11162b]/90 to-[#0c0f1d]/90 p-6 border border-emerald-500/30 hover:border-emerald-400/60 shadow-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition duration-300 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-between">
                <span>Aholi Uchun Milliy Ishlar</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  8+ Milliy Soha
                </span>
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Rishton kulolchiligi, Buxoro zardo‘zligi, Samarqand tandir nonvoyxonasi, Marg‘ilon ipakchiligi, 
                Xiva o‘ymakorligi, Milliy osh markazi, Vodiy bog‘dorchiligi va Milliy IT klasteri!
              </p>
            </div>
            <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs font-mono text-emerald-400">
              <span>Har bir fuqaro uchun barqaror ish o‘rinlari</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Telefon Ish Stoli Vidjetlari & Instagram */}
          <div className="relative group rounded-2xl bg-gradient-to-b from-[#11162b]/90 to-[#0c0f1d]/90 p-6 border border-pink-500/30 hover:border-pink-400/60 shadow-xl hover:shadow-[0_0_30px_rgba(236,72,153,0.2)] transition duration-300 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/20 transition" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-pink-950/80 border border-pink-500/40 flex items-center justify-center text-pink-400 mb-5 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-between">
                <span>Telefon Vidjetlari & Niklar</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-500/30">
                  Home Widget
                </span>
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Saytni telefon ish stoliga qo'shing va interaktiv vidjetlardan foydalaning! Endi bino nomlarini ham 
                do'stlaringizning Instagram niki bilan atash mumkin (masalan: @bibixatcha2 qasri).
              </p>
            </div>
            <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs font-mono text-pink-400">
              <span>Telefon vidjeti & @instagram nomlash</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Second Row: 4 Agents & Presidential System */}
        <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-cyan-950/40 border border-cyan-500/30 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-amber-400 mb-2 font-mono text-xs uppercase">
                <Crown className="w-4 h-4" />
                <span>Prezidentlik Kengashi va 4 ta AI Agent</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white font-['Space_Grotesk']">
                «Men Prezident Bo'laman — Menga Barcha Narsa Mumkin!»
              </h3>
              <p className="mt-3 text-gray-300 text-sm leading-relaxed">
                Butun Respublika sizning mutlaq ixtiyoringizda. Prezident Oliy Yordamchisi va 3 ta ixtisoslashgan aqlli agent sizga xizmat qiladi:
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-gray-900/60 border border-cyan-500/20 flex items-start gap-2">
                  <Palette className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">1. Sardor (Dizayner):</span>
                    <p className="text-gray-400 mt-0.5">Kiber Moviy neon arxitekturasi bo'yicha bosh maslahatchi.</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-gray-900/60 border border-purple-500/20 flex items-start gap-2">
                  <Palette className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">2. Laylo (Dizayner):</span>
                    <p className="text-gray-400 mt-0.5">Estetik fasadlar va zumrad maysazorlar bo'yicha usta dizayner.</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-gray-900/60 border border-blue-500/20 flex items-start gap-2">
                  <Hammer className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">3. Usta Rustam:</span>
                    <p className="text-gray-400 mt-0.5">Aholi o'sishi bilan hududni maysali tuproq bilan kengaytirib boradi.</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-gray-900/60 border border-amber-500/40 flex items-start gap-2 shadow-sm">
                  <Crown className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">4. Adiz Rajabov (Prezident Yordamchisi):</span>
                    <p className="text-gray-300 mt-0.5">Oliy Kotibiyat, 14 hudud operativ hisoboti, xazina auditi va xalq murojaatlari.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  sound.playClick();
                  onScrollToGame();
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-sm shadow-lg shadow-amber-500/25 transition active:scale-95"
              >
                Prezident sifatida o'yinni boshlash
              </button>
              <span className="text-[11px] text-gray-400 font-mono">Barcha imtiyozlar faol</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
