import React from 'react';
import { Home, Users, Instagram, Crown, Sparkles, Hammer, Bot, Palette, ArrowUpRight } from 'lucide-react';
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
            <span>Asosiy Imkoniyatlar</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk']">
            Nega Aynan <span className="text-cyan-400">«Tanlov Mahallasi»</span>?
          </h2>
          <p className="mt-4 text-gray-400 text-sm sm:text-base">
            O'yindagi uylar qurish, fuqarolar hayotini boshqarish, Instagram niklari integratsiyasi va 
            aqlli AI agentlar tizimi orqali haqiqiy kiber metropoliya yaratish tajribasi.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Uylar va Binolar Qurish */}
          <div className="relative group rounded-2xl bg-gradient-to-b from-[#11162b]/90 to-[#0c0f1d]/90 p-6 border border-cyan-500/20 hover:border-cyan-400/60 shadow-xl hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition duration-300 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
                <Home className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-between">
                <span>Uylar & Osmono'parlar</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  1-100 Qavat
                </span>
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Oddiy uylar ($30), zamonaviy biznes binolari ($60) va 1 qavatdan 100 qavatgacha ($20-$200) ulug'vor osmono'par binolar barpo eting.
                Fasadlarni neon ko'k, qirol binafshasi va tillarang tuslar bilan bezang ($10-$30).
              </p>
            </div>
            <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs font-mono text-cyan-400">
              <span>Oddiy $30 • Biznes $60 • Skyscraper $20-$200</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Aholi Sonini Ko'paytirish */}
          <div className="relative group rounded-2xl bg-gradient-to-b from-[#11162b]/90 to-[#0c0f1d]/90 p-6 border border-purple-500/20 hover:border-purple-400/60 shadow-xl hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition duration-300 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-between">
                <span>Aholi & Dinamik Iqtisodiyot</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                  +Aholi
                </span>
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Har bir qurilgan xonadon va minoraga yangi aholi ko'chib keladi. Ish o'rinlari yarating, 
                favvoralar va yashil daraxtlar ekib baxt darajasini oshiring. Byudjetingizga muntazam soliq tushumlari oqib keladi.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs font-mono text-purple-400">
              <span>Soliq tushumlari & Baxt indeksi</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Instagram Niklarini Integratsiya Qilish */}
          <div className="relative group rounded-2xl bg-gradient-to-b from-[#11162b]/90 to-[#0c0f1d]/90 p-6 border border-pink-500/20 hover:border-pink-400/60 shadow-xl hover:shadow-[0_0_30px_rgba(236,72,153,0.15)] transition duration-300 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/20 transition" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-pink-950/80 border border-pink-500/40 flex items-center justify-center text-pink-400 mb-5 group-hover:scale-110 transition-transform">
                <Instagram className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-between">
                <span>Instagram Niklar Integratsiyasi</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-500/30">
                  @instagram
                </span>
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                O'z uyingiz yoki osmono'par binongizga do'stlaringiz va o'zingizning haqiqiy Instagram nikini biriktiring!
                Xaritadagi fuqarolarni bosing va ularning Instagram profillarini ko'ring, shahardagi obro'ingizni oshiring.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs font-mono text-pink-400">
              <span>Jonli shahar fuqarolari ro'yxati</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Second Row: 4 Agents & Hokim System */}
        <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-cyan-950/40 border border-cyan-500/30 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-amber-400 mb-2 font-mono text-xs uppercase">
                <Crown className="w-4 h-4" />
                <span>Hokimiyat va 4 ta AI Agent</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white font-['Space_Grotesk']">
                «Men Hokim Bo'laman — Menga Barcha Narsa Mumkin!»
              </h3>
              <p className="mt-3 text-gray-300 text-sm leading-relaxed">
                Shahar sizning mutlaq ixtiyoringizda. 4 ta ixtisoslashgan aqlli agent sizga xizmat qiladi:
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-gray-900/60 border border-cyan-500/20 flex items-start gap-2">
                  <Palette className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-cyan-300">2 ta Dizayner (Sardor & Laylo):</span>
                    <p className="text-gray-400 mt-0.5">Uylar dizayni, neon ranglar palitrasi va fasad estetikasi ustida ishlaydi.</p>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-900/60 border border-amber-500/20 flex items-start gap-2">
                  <Hammer className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">1 ta Usta (Usta Rustam):</span>
                    <p className="text-gray-400 mt-0.5">Aholi soni oshgan sari shahar hududini avtomatik va buyruq bilan kengaytiradi.</p>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-900/60 border border-purple-500/20 flex items-start gap-2">
                  <Bot className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-purple-300">1 ta Hokim Yordamchisi (Jamshid):</span>
                    <p className="text-gray-400 mt-0.5">Barcha jarayonlarni tizimli hisobot qiladi, soliq va murojaatlarni yetkazadi.</p>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-900/60 border border-rose-500/20 flex items-start gap-2">
                  <Crown className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-rose-300">Siz — Shahar Hokimi:</span>
                    <p className="text-gray-400 mt-0.5">Cheksiz byudjet rejimi, favqulodda farmonlar, bir zumda buzish va to'liq erkinlik!</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onScrollToGame();
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-500/30 whitespace-nowrap active:scale-95 transition"
            >
              Hozir Sinab Ko'rish
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
