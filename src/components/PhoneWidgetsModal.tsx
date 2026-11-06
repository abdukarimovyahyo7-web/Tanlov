import React, { useState } from 'react';
import {
  Smartphone,
  X,
  Sparkles,
  Download,
  Users,
  Coins,
  Smile,
  Crown,
  Instagram,
  Zap,
  Building2,
  Check,
  PlusCircle,
  TrendingUp,
} from 'lucide-react';
import { sound } from '../utils/audio.ts';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';
import { SavedCitizen } from '../utils/storage.ts';

interface PhoneWidgetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  population: number;
  budget: number;
  happiness: number;
  hasBurjKhalifa: boolean;
  citizens: SavedCitizen[];
  onInjectFunds: (amount: number) => void;
  onTriggerFestival: () => void;
}

export const PhoneWidgetsModal: React.FC<PhoneWidgetsModalProps> = ({
  isOpen,
  onClose,
  population,
  budget,
  happiness,
  hasBurjKhalifa,
  citizens,
  onInjectFunds,
  onTriggerFestival,
}) => {
  const [deviceType, setDeviceType] = useState<'android' | 'ios'>('android');
  const [activeWidgetTab, setActiveWidgetTab] = useState<'all' | 'stats' | 'decree' | 'instagram'>('all');
  const [widgetActionNotice, setWidgetActionNotice] = useState<string | null>(null);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleWidgetAction = (text: string, action: () => void) => {
    sound.playCash();
    action();
    setWidgetActionNotice(text);
    setTimeout(() => setWidgetActionNotice(null), 3000);
  };

  const handleInstallToHomeScreen = async () => {
    sound.playBuild();
    if (isInstallable) {
      await install();
    } else {
      // Trigger native download or instructions
      const link = document.createElement('a');
      link.href = '/downloads/tanlov-mahallasi-v2.4-cyber.apk';
      link.download = 'tanlov-mahallasi-v2.4-cyber.apk';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0b0f19] border border-cyan-500/50 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl relative my-auto animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-gray-400 hover:text-white bg-gray-900/80 transition"
          aria-label="Yopish"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-[1px] shrink-0">
            <div className="w-full h-full bg-[#070913] rounded-[15px] flex items-center justify-center text-cyan-400">
              <Smartphone className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-bold text-white font-['Space_Grotesk']">
                Telefon Ish Stoli & Vidjetlari
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                v1.2
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              O'yinni telefoningiz bosh ekraniga (Home Screen) qo'shing va interaktiv vidjetlardan foydalaning
            </p>
          </div>
        </div>

        {/* Action feedback banner */}
        {widgetActionNotice && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn font-mono">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Vidjet bajarildi: {widgetActionNotice}</span>
          </div>
        )}

        {/* Device preview selector & Install Call-to-Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5 p-3 rounded-2xl bg-gray-900/60 border border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-mono">Qurilma:</span>
            <div className="flex items-center bg-gray-950 p-1 rounded-xl border border-gray-800 text-xs font-mono">
              <button
                onClick={() => setDeviceType('android')}
                className={`px-3 py-1 rounded-lg transition ${
                  deviceType === 'android' ? 'bg-cyan-500 text-black font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Android
              </button>
              <button
                onClick={() => setDeviceType('ios')}
                className={`px-3 py-1 rounded-lg transition ${
                  deviceType === 'ios' ? 'bg-purple-600 text-white font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                iOS (iPhone)
              </button>
            </div>
          </div>

          <button
            onClick={handleInstallToHomeScreen}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition"
          >
            <Download className="w-4 h-4" />
            <span>{isInstalled ? "Ish stolida mavjud" : "Telefon ish stoliga qo'shish"}</span>
          </button>
        </div>

        {/* Interactive Phone Widget Showcase (Simulated Phone Screen) */}
        <div className="relative mx-auto max-w-sm rounded-3xl bg-[#070913] border-4 border-gray-800 p-4 shadow-2xl overflow-hidden">
          {/* Phone Speaker Notch */}
          <div className="w-24 h-4 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-cyan-500/60" />
          </div>

          {/* Widget 1: Shahar Jonli Holati (Live City Stats Widget) */}
          <div className="mb-3.5 p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/60 via-gray-900/90 to-purple-950/60 border border-cyan-500/40 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white font-['Space_Grotesk']">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>Tanlov Mahallasi Live</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Jonli Vidjet
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 rounded-xl bg-gray-950/70 border border-gray-800">
                <div className="text-[10px] text-gray-400">Aholi</div>
                <div className="text-sm font-bold font-mono text-cyan-300">
                  {population.toLocaleString()}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-gray-950/70 border border-gray-800">
                <div className="text-[10px] text-gray-400">G'azna</div>
                <div className="text-sm font-bold font-mono text-amber-300">
                  ${budget.toLocaleString()}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-gray-950/70 border border-gray-800">
                <div className="text-[10px] text-gray-400">Kayfiyat</div>
                <div className="text-sm font-bold font-mono text-purple-300">
                  {happiness}%
                </div>
              </div>
            </div>

            {hasBurjKhalifa && (
              <div className="mt-2.5 p-2 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between text-xs text-amber-300 font-mono">
                <span className="flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  Burj Khalifa:
                </span>
                <span className="font-bold text-white">Faol ($2B VIP)</span>
              </div>
            )}
          </div>

          {/* Widget 2: Hokim Tezkor Farmoyishlari (Quick Mayor Widget) */}
          <div className="mb-3.5 p-3.5 rounded-2xl bg-gray-900/80 border border-purple-500/40 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white font-['Space_Grotesk']">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Hokim Tezkor Qarorlari</span>
              </div>
              <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded">
                1-Bosish
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() =>
                  handleWidgetAction("G'aznaga $1,000 investitsiya kiritildi", () =>
                    onInjectFunds(1000)
                  )
                }
                className="p-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono flex items-center justify-center gap-1 transition active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+$1,000 G'azna</span>
              </button>
              <button
                onClick={() =>
                  handleWidgetAction("Kiber-festival e'lon qilindi (Kayfiyat 100%)", onTriggerFestival)
                }
                className="p-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 text-[11px] font-mono flex items-center justify-center gap-1 transition active:scale-95"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Festival (100%)</span>
              </button>
            </div>
          </div>

          {/* Widget 3: Instagram Rezidentlar Vidjeti (Citizen Feed Widget) */}
          <div className="p-3.5 rounded-2xl bg-gray-900/80 border border-pink-500/40 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white font-['Space_Grotesk']">
                <Instagram className="w-4 h-4 text-pink-400" />
                <span>Instagram Rezidentlari</span>
              </div>
              <span className="text-[10px] font-mono text-pink-300">
                @{citizens.length} fuqaro
              </span>
            </div>

            <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
              {citizens.slice(0, 3).map((cit, idx) => (
                <div
                  key={cit.id || idx}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-gray-950/70 border border-gray-800 text-[11px]"
                >
                  <span className="text-gray-300 truncate max-w-[120px]">{cit.name}</span>
                  <span className="text-pink-400 font-mono font-bold truncate">
                    {cit.nick || cit.instagram || '@fuqaro'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step-by-step instructions for Android & iOS */}
        <div className="mt-5 p-3.5 rounded-2xl bg-gray-950/70 border border-gray-800 text-xs text-gray-300">
          <h4 className="font-bold text-white mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>
              {deviceType === 'android' ? "Android" : "iPhone (iOS)"} telefon ish stoliga o'rnatish tartibi:
            </span>
          </h4>
          {deviceType === 'android' ? (
            <p className="text-[11px] text-gray-400 leading-relaxed">
              1. Brauzer o'ng yuqori qismidagi uch nuqta <strong>(⋮)</strong> tugmasini bosing.<br />
              2. <strong>«Ilovani o'rnatish»</strong> yoki <strong>«Bosh ekranga qo'shish»</strong> bandini tanlang.<br />
              3. Ilova vidjetlari bilan telefoningiz ish stolida alohida ilova sifatida paydo bo'ladi!
            </p>
          ) : (
            <p className="text-[11px] text-gray-400 leading-relaxed">
              1. Safari brauzerining pastki qismidagi <strong>«Ulashish» (Share)</strong> belgisini bosing.<br />
              2. Menyudan pastga tushib <strong>«Bosh ekranga qo'shish» (Add to Home Screen)</strong> bandini tanlang.<br />
              3. O'yin iPhone ish stolingizga to'liq 3D ilova sifatida qo'shiladi!
            </p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end mt-5 pt-3 border-t border-gray-800">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold transition"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
