import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Crown,
  Users,
  Coins,
  ShieldAlert,
  Bot,
  Hammer,
  Palette,
  Sparkles,
  Zap,
  BarChart3,
  Instagram,
  CheckCircle2,
  FileText,
  Sliders,
  DollarSign,
  Send,
  MessageSquare,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { sound } from '../utils/audio.ts';

import { SavedCitizen, SavedActionLog } from '../utils/storage.ts';

interface MayorDashboardProps {
  isHokimGodMode: boolean;
  onToggleHokimGodMode: () => void;
  onInjectFunds: (amount: number) => void;
  onTriggerFestival: () => void;
  onExpandTerritory: () => void;
  citizens: SavedCitizen[];
  onAddCitizen: (citizen: SavedCitizen) => void;
  taxRate: number;
  onTaxRateChange: (rate: number) => void;
  actionLog?: SavedActionLog[];
  lastSavedText?: string;
  onLogAction?: (text: string, type: SavedActionLog['type']) => void;
}

export const MayorDashboard: React.FC<MayorDashboardProps> = ({
  isHokimGodMode,
  onToggleHokimGodMode,
  onInjectFunds,
  onTriggerFestival,
  onExpandTerritory,
  citizens,
  onAddCitizen,
  taxRate,
  onTaxRateChange,
  actionLog = [],
  lastSavedText,
  onLogAction,
}) => {
  const [activeTab, setActiveTab] = useState<'kengash' | 'kpi' | 'farmoyishlar' | 'fuqarolar' | 'tarix'>('kengash');
  const [safetyLevel, setSafetyLevel] = useState<number>(98);
  const [decreeStatus, setDecreeStatus] = useState<string | null>(null);

  // New Instagram citizen quick add state
  const [newInstagramHandle, setNewInstagramHandle] = useState<string>('');
  const [newCitizenName, setNewCitizenName] = useState<string>('');

  const handleIssueDecree = (decreeName: string) => {
    sound.playGodMode();
    setDecreeStatus(`Hokim Farmoyishi e'lon qilindi: «${decreeName}» ijroga qaratildi!`);
    if (onLogAction) {
      onLogAction(`Hokim Farmoyishi: «${decreeName}»`, 'decree');
    }
    try {
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
    setTimeout(() => setDecreeStatus(null), 4000);
  };

  const handleAddCitizenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstagramHandle) return;
    sound.playClick();
    const cleanNick = newInstagramHandle.startsWith('@') ? newInstagramHandle : `@${newInstagramHandle}`;
    const newCitizen: SavedCitizen = {
      id: Date.now().toString(),
      name: newCitizenName || 'Fuqaro',
      nick: cleanNick,
      role: 'Shahar Faoli',
      happiness: 100,
      house: 'Yangi Kiber Bino',
    };
    onAddCitizen(newCitizen);
    if (onLogAction) {
      onLogAction(`Yangi Instagram fuqaro qo'shildi: ${cleanNick}`, 'instagram');
    }
    setNewInstagramHandle('');
    setNewCitizenName('');
    setDecreeStatus(`Yangi fuqaro ${cleanNick} Tanlov Mahallasiga rasman saqlandi!`);
  };

  return (
    <section id="dashboard-section" className="py-16 relative bg-[#090d1c] border-t border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-mono uppercase mb-2">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Hokimiyat Boshqaruv Markazi</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk']">
              Tizimli <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-cyan-400 to-purple-400">Nazorat Paneli</span>
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Siz shahar Hokimisiz. 4 ta AI agent hisobotlari, tizimli ko'rsatkichlar va mutlaq vakolatlar.
            </p>
          </div>

          {/* God mode master switch */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gray-900/90 border border-amber-500/40 flex items-center gap-3">
              <div>
                <p className="text-[10px] uppercase font-mono text-amber-400">Hokim Huquqi (God-Mode)</p>
                <p className="text-xs text-gray-300">«Menga barcha narsa mumkin»</p>
              </div>
              <button
                onClick={() => {
                  sound.playGodMode();
                  onToggleHokimGodMode();
                }}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 border ${
                  isHokimGodMode ? 'bg-amber-500 border-amber-300' : 'bg-gray-800 border-gray-600'
                }`}
                title="Hokim god mode rejimini yoqish/o'chirish"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    isHokimGodMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Decree notification */}
        {decreeStatus && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-950/80 via-purple-950/80 to-cyan-950/80 border border-amber-400/60 text-amber-200 text-sm flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="font-semibold">{decreeStatus}</span>
            </div>
            <span className="text-xs font-mono text-cyan-300">Tasdiqlandi</span>
          </div>
        )}

        {/* Dashboard Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-800 pb-3 mb-6 overflow-x-auto text-sm font-medium">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('kengash');
            }}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'kengash'
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400 text-white font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>Agentlar Kengashi (4 AI Agent)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('kpi');
            }}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'kpi'
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400 text-white font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Tizimli Ko'rsatkichlar (KPI)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('farmoyishlar');
            }}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'farmoyishlar'
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400 text-white font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Hokim Farmoyishlari</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('fuqarolar');
            }}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'fuqarolar'
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400 text-white font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Instagram className="w-4 h-4 text-pink-400" />
            <span>Instagram Niklari & Fuqarolar ({citizens.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('tarix');
            }}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'tarix'
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400 text-white font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Saqlangan Harakatlar ({actionLog.length})</span>
          </button>
        </div>

        {/* TAB 1: AGENTLAR KENGASHI (4 AI AGENTLAR) */}
        {activeTab === 'kengash' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Agent 1: Arxitektor Sardor (Uy Dizayneri 1) */}
            <div className="p-5 rounded-2xl bg-[#0e1424] border border-cyan-500/30 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
                    <Palette className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 uppercase">
                    Uy Dizayneri #1
                  </span>
                </div>
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">Arxitektor Sardor</h3>
                <p className="text-xs text-cyan-400 font-mono mb-3">Bino Fasadlari & Geometriya</p>
                <div className="p-3 rounded-xl bg-black/40 border border-gray-800 text-xs text-gray-300 leading-relaxed italic mb-4">
                  «Hurmatli Hokim! Osmono'par binolarimiz uchun Kiber Moviy neon nurlanishini va zamonaviy shisha fasadlarni tavsiya qilaman. Shahar kiber-markazdek ko'rinmoqda!»
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playBuild();
                  setDecreeStatus("Arxitektor Sardor barcha osmono'par binolar fasadiga kiber yoritish joriy qildi!");
                }}
                className="w-full py-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Fasadlarni Yangilash</span>
              </button>
            </div>

            {/* Agent 2: Dizayner Laylo (Uy Dizayneri 2) */}
            <div className="p-5 rounded-2xl bg-[#0e1424] border border-purple-500/30 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/50 flex items-center justify-center text-purple-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 uppercase">
                    Uy Dizayneri #2
                  </span>
                </div>
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">Dizayner Laylo</h3>
                <p className="text-xs text-purple-400 font-mono mb-3">Estetika & Ranglar Uyg'unligi</p>
                <div className="p-3 rounded-xl bg-black/40 border border-gray-800 text-xs text-gray-300 leading-relaxed italic mb-4">
                  «Salom, Hokim hazratlari! Uylarning yonida ko'proq daraxtlar va favvoralar bo'lsa, Qirol Binafshasi va Oltin ranglar aholi kayfiyatini 100% ga ko'taradi.»
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playBuild();
                  setDecreeStatus("Dizayner Laylo shahar bo'ylab binafsha va zumrad eko-uyg'unlikni joriy qildi!");
                }}
                className="w-full py-2 rounded-lg bg-purple-950/60 border border-purple-500/40 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Palette className="w-3.5 h-3.5 text-purple-400" />
                <span>Estetik Ranglarni Moslash</span>
              </button>
            </div>

            {/* Agent 3: Usta Rustam (Hudud Kengaytiruvchi Usta) */}
            <div className="p-5 rounded-2xl bg-[#0e1424] border border-blue-500/30 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-500/50 flex items-center justify-center text-blue-400">
                    <Hammer className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30 uppercase">
                    Bosh Usta
                  </span>
                </div>
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">Usta Rustam</h3>
                <p className="text-xs text-blue-400 font-mono mb-3">Hudud & Infratuzilma</p>
                <div className="p-3 rounded-xl bg-black/40 border border-gray-800 text-xs text-gray-300 leading-relaxed italic mb-4">
                  «Hokim buva, aholi ko'paygan sari yerimiz torlik qiladi! Men yangi er uchastkalarini tayyorlab, hududni kengaytirishga doim shayman!»
                </div>
              </div>
              <button
                onClick={() => {
                  onExpandTerritory();
                  setDecreeStatus("Usta Rustam yangi hududni qurilish uchun kengaytirdi!");
                }}
                className="w-full py-2 rounded-lg bg-blue-950/60 border border-blue-500/40 hover:bg-blue-500/20 text-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Hammer className="w-3.5 h-3.5 text-blue-400" />
                <span>Hududni Kengaytirish</span>
              </button>
            </div>

            {/* Agent 4: Yordamchi Jamshid (Hokim Yordamchisi) */}
            <div className="p-5 rounded-2xl bg-[#0e1424] border border-amber-500/30 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-500/50 flex items-center justify-center text-amber-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 uppercase">
                    Hokim Yordamchisi
                  </span>
                </div>
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">Yordamchi Jamshid</h3>
                <p className="text-xs text-amber-400 font-mono mb-3">Hisobotlar & Xazina Nazorati</p>
                <div className="p-3 rounded-xl bg-black/40 border border-gray-800 text-xs text-gray-300 leading-relaxed italic mb-4">
                  «Hurmatli Hokim, barcha xizmatlar to'liq nazorat ostida. Soliqlar o'z vaqtida yig'ilmoqda, fuqarolar noroziligi 0%. Yangi farmoyish kutmoqdamiz!»
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playCash();
                  setDecreeStatus("Yordamchi Jamshid shahar haftalik iqtisodiy auditini muvaffaqiyatli yakunladi!");
                }}
                className="w-full py-2 rounded-lg bg-amber-950/60 border border-amber-500/40 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Operativ Hisobot Olish</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: TIZIMLI KO'RSATKICHLAR (KPI) */}
        {activeTab === 'kpi' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#0e1424] border border-cyan-500/20">
              <h4 className="text-sm font-bold text-white uppercase font-mono text-cyan-300 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Energiya & Elektr Ta'minoti
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Quyosh & Kiber Generatorlar</span>
                  <span className="text-cyan-400 font-mono font-bold">100% Barqaror</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full w-[95%]" />
                </div>
                <p className="text-[11px] text-gray-400">Shaharda energiya yetishmovchiligi yo'q.</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e1424] border border-emerald-500/20">
              <h4 className="text-sm font-bold text-white uppercase font-mono text-emerald-300 mb-4 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Xavfsizlik & Kiber-Patrul
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Tinchlik va Tartib</span>
                  <span className="text-emerald-400 font-mono font-bold">{safetyLevel}%</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full" style={{ width: `${safetyLevel}%` }} />
                </div>
                <p className="text-[11px] text-gray-400">Hokim farmoyishlari asosida shahar to'liq xavfsiz.</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e1424] border border-purple-500/20">
              <h4 className="text-sm font-bold text-white uppercase font-mono text-purple-300 mb-4 flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Soliq Siyosati: {taxRate}%
              </h4>
              <div className="space-y-3">
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="5"
                  value={taxRate}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    onTaxRateChange(val);
                    if (onLogAction) {
                      onLogAction(`Soliq stavkasi ${val}% ga o'zgartirildi`, 'decree');
                    }
                  }}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-gray-400">
                  <span>5% (Past soliq)</span>
                  <span>10% (Standart)</span>
                  <span>25% (Maksimal daromad)</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  {taxRate <= 10 ? "Aholi soliqdan juda mamnun, baxt darajasi yuqori." : "Xazina tezroq to'lmoqda, baxt indeksi barqaror."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HOKIM FARMOYISHLARI */}
        {activeTab === 'farmoyishlar' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#0e1424] border border-amber-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <h4 className="font-bold text-white">Favqulodda Davlat Subsidiyasi</h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Hokimlik zaxira fondidan shahar xazinasiga darhol +$500 mablag' o'tkazish.
                </p>
              </div>
              <button
                onClick={() => {
                  onInjectFunds(500);
                  handleIssueDecree("Shahar xazinasiga +$500 subsidiyasi ajratildi");
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>+$500 Xazinaga Qo'shish</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e1424] border border-pink-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-pink-400 mb-2">
                  <Sparkles className="w-5 h-5" />
                  <h4 className="font-bold text-white">Shahar Kiber-Bayrami</h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Barcha mahallalarda bayram nurlari va musiqa. Fuqarolar baxt darajasi maksimal darajaga chiqadi!
                </p>
              </div>
              <button
                onClick={() => {
                  onTriggerFestival();
                  handleIssueDecree("Tanlov Mahallasida Kiber-Bayram e'lon qilindi");
                }}
                className="w-full py-2.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/50 text-pink-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Bayramni Boshlash 🎉</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e1424] border border-cyan-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-cyan-400 mb-2">
                  <Hammer className="w-5 h-5" />
                  <h4 className="font-bold text-white">Usta Rustamga Hudud Kengaytirish</h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Aholi sonini kutmasdan, Hokim farmoyishi bilan shaharni darhol yangi sektorlarga kengaytirish.
                </p>
              </div>
              <button
                onClick={() => {
                  onExpandTerritory();
                  handleIssueDecree("Yangi sektorlar ochilishi to'g'risida qaror imzolandi");
                }}
                className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Hududni Kengaytirish ⚡</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: INSTAGRAM NIKLARI & FUQAROLAR RO'YXATI */}
        {activeTab === 'fuqarolar' && (
          <div className="space-y-6">
            {/* Quick add citizen form */}
            <form onSubmit={handleAddCitizenSubmit} className="p-4 rounded-2xl bg-[#0e1424] border border-pink-500/30 flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full sm:w-auto">
                <input
                  type="text"
                  value={newInstagramHandle}
                  onChange={(e) => setNewInstagramHandle(e.target.value)}
                  placeholder="Instagram nik (masalan: @islombek_uz)"
                  className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-pink-500"
                  required
                />
              </div>
              <div className="flex-1 w-full sm:w-auto">
                <input
                  type="text"
                  value={newCitizenName}
                  onChange={(e) => setNewCitizenName(e.target.value)}
                  placeholder="Fuqaro ismi (ixtiyoriy)"
                  className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Instagram className="w-4 h-4" />
                <span>Fuqaro Qo'shish</span>
              </button>
            </form>

            {/* Citizens Table */}
            <div className="rounded-2xl bg-[#0e1424] border border-gray-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-900/90 text-gray-400 font-mono uppercase text-[10px] border-b border-gray-800">
                    <tr>
                      <th className="p-3">Fuqaro</th>
                      <th className="p-3">Instagram Nik</th>
                      <th className="p-3">Kasbi</th>
                      <th className="p-3">Yashash Joyi</th>
                      <th className="p-3">Baxt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 font-medium text-gray-300">
                    {citizens.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-800/30 transition">
                        <td className="p-3 font-semibold text-white">{c.name}</td>
                        <td className="p-3">
                          <a
                            href={`https://instagram.com/${c.nick.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-pink-400 hover:text-pink-300 flex items-center gap-1 underline"
                          >
                            <Instagram className="w-3.5 h-3.5" />
                            {c.nick}
                          </a>
                        </td>
                        <td className="p-3 text-gray-400">{c.role}</td>
                        <td className="p-3 font-mono text-cyan-300">{c.house}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-mono">
                            {c.happiness}% 😊
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SAQLANGAN HARAKATLAR TARIXI (ACTION LOG) */}
        {activeTab === 'tarix' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gray-900/80 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-white">Har soniya avtomatik saqlanmoqda</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-300">{lastSavedText || 'Faol'}</span>
            </div>

            <div className="rounded-2xl bg-[#0e1424] border border-gray-800 p-4 space-y-2 max-h-96 overflow-y-auto">
              {actionLog.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6 font-mono">
                  Hali harakatlar qayd etilmadi. Bino quring yoki farmoyish bering!
                </p>
              ) : (
                actionLog.slice(0, 50).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg bg-black/40 border border-gray-800 flex items-center justify-between text-xs hover:border-gray-700 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span className="text-gray-200">{log.text}</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
