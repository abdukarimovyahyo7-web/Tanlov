import React from 'react';
import { Building2, Instagram, Mail, Crown, Heart, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio.ts';

interface FooterProps {
  onOpenContact: () => void;
  onScrollToGame: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenContact, onScrollToGame }) => {
  return (
    <footer className="bg-[#05070e] border-t border-cyan-500/20 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 p-[1px]">
                <div className="w-full h-full bg-[#0b0f19] rounded-[11px] flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <div>
                <span className="font-bold text-base tracking-wider text-white font-['Chakra_Petch']">
                  TANLOV MAHALLASI
                </span>
                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 uppercase font-mono">
                  Mening Shahrim
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              Mobil telefonlar va brauzerlar uchun 3D kiber shahar qurish o'yini.
              O'z mahallangizni quring, Instagram niklarini integratsiya qiling va Hokim sifatida mutlaq nazorat qiling!
            </p>

            {/* Official ONLY Instagram link as requested */}
            <div className="pt-2">
              <p className="text-xs font-mono text-gray-400 mb-2">Rasmiy Ijtimoiy Tarmoq:</p>
              <a
                href="https://instagram.com/tanlovmahallasi"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-600/20 via-purple-600/20 to-pink-600/10 border border-pink-500/40 text-pink-300 hover:text-white hover:border-pink-400 transition text-xs font-semibold group shadow-md shadow-pink-950/30"
              >
                <Instagram className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
                <span>Instagram: @tanlovmahallasi</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <p className="text-xs font-mono uppercase tracking-wider text-cyan-400">Tezkor Havolalar</p>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#hero" className="hover:text-cyan-300 transition">Bosh sahifa</a>
              </li>
              <li>
                <a href="#features" className="hover:text-cyan-300 transition">Xususiyatlar</a>
              </li>
              <li>
                <button onClick={onScrollToGame} className="hover:text-cyan-300 transition text-left">
                  Shahar Qurish (O'yin)
                </button>
              </li>
              <li>
                <a href="#dashboard-section" className="hover:text-cyan-300 transition">Hokimiyat Boshqaruv Markazi</a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-cyan-300 transition">3D Galereya</a>
              </li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="space-y-3">
            <p className="text-xs font-mono uppercase tracking-wider text-purple-400">Bog'lanish</p>
            <p className="text-xs text-gray-400">
              Murojaat va takliflar uchun rasmiy elektron pochta:
            </p>
            <button
              onClick={() => {
                sound.playClick();
                onOpenContact();
              }}
              className="w-full text-left p-3 rounded-xl bg-gray-900/80 border border-cyan-500/30 hover:border-cyan-400 transition group"
            >
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-mono font-semibold mb-1">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>tanlovmahallasi@gmail.com</span>
              </div>
              <p className="text-[11px] text-gray-400 group-hover:text-gray-300">
                Xabar yuborish uchun bosing →
              </p>
            </button>
          </div>
        </div>

        {/* Bottom copyright notice */}
        <div className="pt-8 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3">
          <p>© 2026 Tanlov Mahallasi. Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span>Hokimiyat Tizimi</span>
            <span>•</span>
            <span className="text-cyan-400">Kiber Mahalla Edition</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
