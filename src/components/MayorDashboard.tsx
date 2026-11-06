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
  Briefcase,
  MapPin,
  Building2,
  Compass,
  Github,
  FolderArchive,
  TrendingUp,
  Award,
} from 'lucide-react';
import { sound } from '../utils/audio.ts';
import { SavedCitizen, SavedActionLog } from '../utils/storage.ts';
import {
  NationalJob,
  INITIAL_NATIONAL_JOBS,
  calculateTotalEmployed,
  calculateTotalWorkplaces,
  calculateEmploymentRate,
  calculateJobsIncomePerSecond,
  upgradeNationalJob,
  assignWorkersToJob,
  autoEmployAll,
} from '../game/jobs.ts';
import { UZBEKISTAN_REGIONS, DistrictInfo } from '../data/uzbekistanRegions.ts';

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
  currentDistrictId?: string;
  currentDistrictName?: string;
  onSelectDistrict?: (districtId: string) => void;
  isPrezident?: boolean;
  population?: number;
  budget?: number;
  nationalJobs?: NationalJob[];
  onUpdateNationalJobs?: (jobs: NationalJob[]) => void;
  onOpenGitHubModal?: () => void;
  onOpenElectionModal?: () => void;
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
  currentDistrictId = 'chilonzor',
  currentDistrictName = 'Chilonzor tumani',
  onSelectDistrict,
  isPrezident = true,
  population = 1500,
  budget = 1000,
  nationalJobs = INITIAL_NATIONAL_JOBS,
  onUpdateNationalJobs,
  onOpenGitHubModal,
  onOpenElectionModal,
}) => {
  const [activeTab, setActiveTab] = useState<'kengash' | 'ishlar' | 'tumanlar' | 'kpi' | 'farmoyishlar' | 'fuqarolar' | 'tarix'>('kengash');
  const [safetyLevel, setSafetyLevel] = useState<number>(99);
  const [decreeStatus, setDecreeStatus] = useState<string | null>(null);

  // New Instagram citizen quick add state
  const [newInstagramHandle, setNewInstagramHandle] = useState<string>('');
  const [newCitizenName, setNewCitizenName] = useState<string>('');
  const [newCitizenRole, setNewCitizenRole] = useState<string>('Rishton Kuloli');

  // National jobs stats
  const totalEmployed = calculateTotalEmployed(nationalJobs);
  const totalWorkplaces = calculateTotalWorkplaces(nationalJobs);
  const employmentRate = calculateEmploymentRate(population, nationalJobs);
  const jobsIncome = calculateJobsIncomePerSecond(nationalJobs);

  const handleIssueDecree = (decreeName: string) => {
    sound.playGodMode();
    setDecreeStatus(`Prezident Farmoni e'lon qilindi: «${decreeName}» zudlik bilan kuchga kirdi!`);
    if (onLogAction) {
      onLogAction(`Prezident Farmoni: «${decreeName}»`, 'decree');
    }
    try {
      confetti({ particleCount: 35, spread: 70, origin: { y: 0.7 } });
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
      role: newCitizenRole || 'Milliy Hunarmand',
      happiness: 100,
      house: 'Kiber Bino',
    };
    onAddCitizen(newCitizen);
    if (onLogAction) {
      onLogAction(`Yangi Instagram fuqaro qo'shildi: ${cleanNick} (${newCitizen.role})`, 'instagram');
    }
    setNewInstagramHandle('');
    setNewCitizenName('');
    setDecreeStatus(`Yangi fuqaro ${cleanNick} Tanlov Mahallasiga rasman saqlandi!`);
  };

  // Upgrade national job workshop
  const handleUpgradeJob = (jobId: string) => {
    sound.playBuild();
    const result = upgradeNationalJob(nationalJobs, jobId, budget, isHokimGodMode);
    if (!result.success) {
      setDecreeStatus(result.error || 'Ustaxonani kengaytirib bo‘lmadi');
      return;
    }
    if (onUpdateNationalJobs) {
      onUpdateNationalJobs(result.updatedJobs);
    }
    const upgraded = result.updatedJobs.find(j => j.id === jobId);
    setDecreeStatus(`«${upgraded?.title}» ustaxonasi darajasi ${upgraded?.level}-bosqichga oshirildi! Sig‘im: ${upgraded?.maxCapacity} ta ish o‘rni.`);
    if (onLogAction) {
      onLogAction(`«${upgraded?.title}» ustaxonasi kengaytirildi (Level ${upgraded?.level})`, 'build');
    }
  };

  // Add workers to specific job
  const handleHireWorkers = (jobId: string, count: number) => {
    sound.playCash();
    const result = assignWorkersToJob(nationalJobs, jobId, count, population);
    if (!result.success) {
      setDecreeStatus(result.message || 'Ishchilarni qo‘shib bo‘lmadi');
      return;
    }
    if (onUpdateNationalJobs) {
      onUpdateNationalJobs(result.updatedJobs);
    }
    const job = result.updatedJobs.find(j => j.id === jobId);
    setDecreeStatus(`«${job?.title}» sohasiga +${count} nafar fuqaro ishga qabul qilindi!`);
    if (onLogAction) {
      onLogAction(`«${job?.title}» sohasiga yangi ishchilar tayinlandi (+${count})`, 'fund');
    }
  };

  // Auto employ all available citizens
  const handleAutoEmployAll = () => {
    sound.playCash();
    const updated = autoEmployAll(nationalJobs, population);
    if (onUpdateNationalJobs) {
      onUpdateNationalJobs(updated);
    }
    setDecreeStatus(`Barcha ishsiz aholi milliy ustaxonalar va sohalarga to‘liq ishga joylashtirildi!`);
    if (onLogAction) {
      onLogAction(`Prezident dasturi: Barcha fuqarolar 100% milliy ishlarga qamrab olindi!`, 'decree');
    }
    try {
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  return (
    <section id="dashboard-section" className="py-16 relative bg-[#090d1c] border-t border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Version 1.2 & Supreme President Identity */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-mono uppercase mb-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Respublika Oliy Prezidentlik Boshqaruv Markazi</span>
              <span className="bg-amber-400 text-black px-1.5 py-0.2 rounded font-bold text-[10px]">v1.2 3D</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk']">
              Tizimli <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-cyan-400 to-purple-400">Nazorat Paneli</span>
            </h2>
            <p className="text-gray-300 text-sm mt-1 max-w-3xl">
              Siz <strong className="text-amber-400">Davlat Rahbari (Prezident)</strong>siz. Prezident Yordamchisi <strong className="text-cyan-300">Adiz Rajabov</strong> va Oliy Kengash hisobotlari, aholi uchun milliy ishlar va O‘zbekiston hududlari nazorati.
            </p>
          </div>

          {/* Quick Actions (GitHub Source Code & God-Mode Switch) */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* GitHub Source Code Export Button */}
            {onOpenGitHubModal && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenGitHubModal();
                }}
                className="px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-700 hover:border-cyan-400 text-gray-200 hover:text-white text-xs font-bold font-mono flex items-center gap-2 transition shadow-lg"
                title="Barcha fayllarni GitHub'dan yoki ZIP ko'rinishida yuklab olib o'zingizga yangi sayt yarating"
              >
                <Github className="w-4 h-4 text-cyan-400" />
                <span>GitHub Manba Kodlari</span>
              </button>
            )}

            {/* Presidential God mode master switch */}
            <div className="p-3 rounded-xl bg-gray-900/90 border border-amber-500/40 flex items-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
              <div>
                <p className="text-[10px] uppercase font-mono text-amber-400 font-bold">Prezident Huquqi (God-Mode)</p>
                <p className="text-xs text-gray-300">«Menga barcha narsa mumkin»</p>
              </div>
              <button
                onClick={() => {
                  sound.playGodMode();
                  onToggleHokimGodMode();
                }}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 border ${
                  isHokimGodMode ? 'bg-amber-500 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.6)]' : 'bg-gray-800 border-gray-600'
                }`}
                title="Prezident god mode rejimini yoqish/o'chirish"
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
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-950/90 via-purple-950/90 to-cyan-950/90 border border-amber-400/60 text-amber-200 text-sm flex items-center justify-between animate-fadeIn shadow-xl">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="font-semibold">{decreeStatus}</span>
            </div>
            <span className="text-xs font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
              Ijroga Qaratildi
            </span>
          </div>
        )}

        {/* Dashboard Tabs (Modernized 1.2 with National Jobs & Regions) */}
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
            <span>Oliy Kengash (Prezident Yordamchisi Adiz Rajabov & 3 Agent)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('ishlar');
            }}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'ishlar'
                ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-400 text-white font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <span>Milliy Ishlar & Bandlik ({employmentRate}% Bandlik)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('tumanlar');
            }}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'tumanlar'
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400 text-white font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4 text-purple-400" />
            <span>Shaharlar & Tumanlar (Xo‘jayli, Taxiatosh, Yangiyo‘l)</span>
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
            <span>Tizimli Ko‘rsatkichlar & Burj Khalifa</span>
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
            <span>Prezident Farmonlari</span>
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
            <span>Instagram Fuqarolar ({citizens.length})</span>
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
            <span>Har Soniya Saqlanish ({actionLog.length})</span>
          </button>
        </div>

        {/* TAB 1: OLIY KENGASH (Prezident Yordamchisi Adiz Rajabov & 3 AI Agent) */}
        {activeTab === 'kengash' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Agent 1: Prezident Yordamchisi Adiz Rajabov */}
            <div className="p-5 rounded-2xl bg-[#0e1424] border-2 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.2)] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-950 border border-amber-500/80 flex items-center justify-center text-amber-400 shadow-md">
                    <Crown className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/50 uppercase font-bold">
                    Prezident Yordamchisi
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-1.5">
                  <span>Adiz Rajabov</span>
                  <Award className="w-4 h-4 text-amber-400" />
                </h3>
                <p className="text-xs text-amber-400 font-mono mb-3">Davlat Rahbari Oliy Kotibiyati</p>
                <div className="p-3.5 rounded-xl bg-black/60 border border-amber-500/30 text-xs text-amber-100 leading-relaxed italic mb-4">
                  «Hurmatli Prezident janoblari! Barcha 14 ta hudud, 200+ shahar va tumanlar, Xo‘jayli, Taxiatosh, Yangiyo‘l, Burj Khalifa va milliy ish o‘rinlari to‘liq oliy nazoratingiz ostida. Sizga sodiq xizmatdamiz!»
                </div>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    sound.playCash();
                    setDecreeStatus("Prezident Yordamchisi Adiz Rajabov: Respublika bo‘yicha operativ axborot taqdim etildi. Iqtisodiyot barqaror, fuqarolar roziligi 100%!");
                  }}
                  className="w-full py-2 rounded-lg bg-amber-500/20 border border-amber-500/60 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tezkor Axborot Berish</span>
                </button>
                <button
                  onClick={() => {
                    sound.playGodMode();
                    setDecreeStatus("Prezident Yordamchisi Adiz Rajabov: Barcha hudud hokimlariga Prezident topshiriqlari yuborildi!");
                  }}
                  className="w-full py-2 rounded-lg bg-amber-950/60 border border-amber-500/40 hover:bg-amber-500/20 text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hokimlarga Topshiriq Yuborish</span>
                </button>
              </div>
            </div>

            {/* Agent 2: Bosh Usta Rustam */}
            <div className="p-5 rounded-2xl bg-[#0e1424] border border-blue-500/40 shadow-xl flex flex-col justify-between">
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
                <div className="p-3.5 rounded-xl bg-black/40 border border-gray-800 text-xs text-gray-300 leading-relaxed italic mb-4">
                  «Prezidentim, aholimiz ko‘paygani sari yangi yerlarni tayyorlab, maysali tuproq maydonlarini kengaytiryapman. Qurilish maydonlari tayyor!»
                </div>
              </div>
              <button
                onClick={() => {
                  onExpandTerritory();
                  setDecreeStatus("Usta Rustam: Prezident farmoyishiga binoan shahar hududi yangi sektorlarga kengaytirildi!");
                }}
                className="w-full py-2 rounded-lg bg-blue-950/60 border border-blue-500/40 hover:bg-blue-500/20 text-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Hammer className="w-3.5 h-3.5 text-blue-400" />
                <span>Hududni Kengaytirish</span>
              </button>
            </div>

            {/* Agent 3: Arxitektor Sardor */}
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
                <div className="p-3.5 rounded-xl bg-black/40 border border-gray-800 text-xs text-gray-300 leading-relaxed italic mb-4">
                  «Hurmatli Prezident! Burj Khalifa ($1) va osmono‘par binolarimiz shahar uzra viqor bilan turibdi. 3D dvijokda bino ranglari va neon nurlar mukammal!»
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playBuild();
                  setDecreeStatus("Arxitektor Sardor: Barcha binolarning 3D fasadlari kiber moviy neon nurlar bilan yangilandi!");
                }}
                className="w-full py-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>3D Fasadlarni Yangilash</span>
              </button>
            </div>

            {/* Agent 4: Dizayner Laylo */}
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
                <p className="text-xs text-purple-400 font-mono mb-3">Estetika & Yashil Maysazorlar</p>
                <div className="p-3.5 rounded-xl bg-black/40 border border-gray-800 text-xs text-gray-300 leading-relaxed italic mb-4">
                  «Salom, Prezident janoblari! Shahrimizdagi tabiiy maysali tuproq zamin, favvoralar va milliy hunarmandchilik uylari aholiga katta zavq bermoqda.»
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playBuild();
                  setDecreeStatus("Dizayner Laylo: Shahar bog‘lari va maysazorlarida estetik gullar va favvoralar joriy etildi!");
                }}
                className="w-full py-2 rounded-lg bg-purple-950/60 border border-purple-500/40 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Palette className="w-3.5 h-3.5 text-purple-400" />
                <span>Estetik Uyg‘unlikni Oshirish</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: MILLIY ISHLAR & BANDLIK (Yangi Yo'nalish!) */}
        {activeTab === 'ishlar' && (
          <div className="space-y-6">
            {/* National Jobs Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#0e1424] border border-emerald-500/30">
                <p className="text-[10px] uppercase font-mono text-gray-400">Bandlik Darajasi</p>
                <p className="text-2xl font-bold font-mono text-emerald-400">
                  {employmentRate}% <span className="text-xs font-normal text-emerald-500">band</span>
                </p>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-emerald-400 h-full" style={{ width: `${employmentRate}%` }} />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0e1424] border border-cyan-500/30">
                <p className="text-[10px] uppercase font-mono text-gray-400">Ishlayotgan Fuqarolar</p>
                <p className="text-2xl font-bold font-mono text-cyan-300">
                  {totalEmployed.toLocaleString()} <span className="text-xs font-normal text-gray-400">/ {population.toLocaleString()}</span>
                </p>
                <p className="text-[11px] text-gray-400 mt-1 font-mono">Barcha sohalarda</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0e1424] border border-amber-500/30">
                <p className="text-[10px] uppercase font-mono text-gray-400">Milliy Ishlar Daromadi</p>
                <p className="text-2xl font-bold font-mono text-amber-300">
                  +${jobsIncome.toFixed(1)} <span className="text-xs font-normal text-amber-500">/soniya</span>
                </p>
                <p className="text-[11px] text-gray-400 mt-1 font-mono">Xazinaga tushum</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0e1424] border border-purple-500/30 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] uppercase font-mono text-gray-400">Mavjud Ish O‘rinlari</p>
                  <p className="text-2xl font-bold font-mono text-purple-300">
                    {totalWorkplaces.toLocaleString()} <span className="text-xs font-normal text-purple-500">o‘rin</span>
                  </p>
                </div>
                <button
                  onClick={handleAutoEmployAll}
                  className="mt-2 w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold font-mono transition flex items-center justify-center gap-1 shadow"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Barchani Ishga Joylash</span>
                </button>
              </div>
            </div>

            {/* National Jobs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {nationalJobs.map(job => {
                const isFull = job.workers >= job.maxCapacity;
                const nextUpgradeCost = isHokimGodMode ? 0 : Math.round(job.baseCost * Math.pow(1.5, job.level - 1));
                return (
                  <div
                    key={job.id}
                    className="p-4 rounded-2xl bg-[#0e1424] border border-gray-800 hover:border-emerald-500/40 transition flex flex-col justify-between shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{job.icon}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-900 text-cyan-300 border border-gray-700">
                          {job.regionOrigin}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white font-['Space_Grotesk']">{job.title}</h4>
                      <p className="text-[10px] text-emerald-400 font-mono mb-2">{job.categoryLabel}</p>
                      <p className="text-xs text-gray-300 leading-relaxed mb-3">{job.description}</p>

                      {/* Capacity progress */}
                      <div className="space-y-1 mb-4 p-2.5 rounded-xl bg-black/40 border border-gray-800/80">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-gray-400">Ishchilar:</span>
                          <span className="text-white font-bold">
                            {job.workers} / {job.maxCapacity}
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-400 h-full transition-all"
                            style={{ width: `${Math.min(100, (job.workers / job.maxCapacity) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400 font-mono pt-1">
                          <span>Daromad: +${(job.workers * job.wagePerWorker).toFixed(1)}/sek</span>
                          <span className="text-amber-300">Lvl {job.level}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleHireWorkers(job.id, 10)}
                        disabled={isFull}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold font-mono transition flex items-center justify-center gap-1 ${
                          isFull
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            : 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{isFull ? 'To‘liq Band' : '+10 Ishchi Qabul Qilish'}</span>
                      </button>

                      <button
                        onClick={() => handleUpgradeJob(job.id)}
                        className="w-full py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-cyan-400 text-gray-300 text-xs font-mono transition flex items-center justify-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Kengaytirish (${nextUpgradeCost})</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: O'ZBEKISTON SHAHARLARI VA TUMANLARI (Xo'jayli, Taxiatosh, Yangiyo'l) */}
        {activeTab === 'tumanlar' && (
          <div className="space-y-6">
            {/* Notice banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/70 via-black to-cyan-950/70 border border-purple-500/40 text-xs space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-white text-sm flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>Hozirgi Boshqarilayotgan Hudud: <span className="text-cyan-300 underline font-mono">{currentDistrictName}</span></span>
                </span>
                {onOpenElectionModal && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenElectionModal();
                    }}
                    className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition flex items-center gap-1"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-300" />
                    <span>Saylov Paneli</span>
                  </button>
                )}
              </div>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                Prezident farmoni bilan yangi qo‘shilgan hududlar: <strong>Xo‘jayli shahri</strong>, <strong>Taxiatosh tumani</strong>, va <strong>Yangiyo‘l shahri</strong>! Quyidagi tezkor tugmalar orqali bir zumda ushbu hududlarga o‘tishingiz mumkin.
              </p>
            </div>

            {/* Prominent Quick-Jump to New & Major Cities */}
            <div className="p-4 rounded-2xl bg-[#0e1424] border border-cyan-500/30 space-y-3">
              <h4 className="text-xs font-bold text-cyan-300 uppercase font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Yangi Qo‘shilgan & Asosiy Shaharlar (Tezkor O‘tish):</span>
              </h4>

              <div className="flex flex-wrap gap-2">
                {/* User's newly requested 3 districts */}
                <button
                  onClick={() => {
                    sound.playClick();
                    if (onSelectDistrict) onSelectDistrict('xojayli_city');
                    setDecreeStatus("Prezident Xo‘jayli shahriga tashrif buyurdi!");
                  }}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition ${
                    currentDistrictId === 'xojayli_city'
                      ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                      : 'bg-amber-950/40 text-amber-300 border-amber-500/50 hover:bg-amber-500/20'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>⭐ Xo‘jayli shahri (Qoraqalpog‘iston)</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    if (onSelectDistrict) onSelectDistrict('taxiatosh');
                    setDecreeStatus("Prezident Taxiatosh tumaniga tashrif buyurdi!");
                  }}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition ${
                    currentDistrictId === 'taxiatosh'
                      ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                      : 'bg-amber-950/40 text-amber-300 border-amber-500/50 hover:bg-amber-500/20'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>⭐ Taxiatosh tumani (Qoraqalpog‘iston)</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    if (onSelectDistrict) onSelectDistrict('yangiyol');
                    setDecreeStatus("Prezident Yangiyo‘l shahriga tashrif buyurdi!");
                  }}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition ${
                    currentDistrictId === 'yangiyol'
                      ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                      : 'bg-amber-950/40 text-amber-300 border-amber-500/50 hover:bg-amber-500/20'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>⭐ Yangiyo‘l shahri (Toshkent vil.)</span>
                </button>

                {/* Historic Capitals */}
                <button
                  onClick={() => {
                    sound.playClick();
                    if (onSelectDistrict) onSelectDistrict('samarkand_city');
                  }}
                  className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 hover:border-cyan-400 text-gray-200 text-xs font-mono transition"
                >
                  Samarqand shahri
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    if (onSelectDistrict) onSelectDistrict('bukhara_city');
                  }}
                  className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 hover:border-cyan-400 text-gray-200 text-xs font-mono transition"
                >
                  Buxoro shahri
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    if (onSelectDistrict) onSelectDistrict('qoqon');
                  }}
                  className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 hover:border-cyan-400 text-gray-200 text-xs font-mono transition"
                >
                  Qo‘qon shahri
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    if (onSelectDistrict) onSelectDistrict('xiva_city');
                  }}
                  className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 hover:border-cyan-400 text-gray-200 text-xs font-mono transition"
                >
                  Xiva shahri
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    if (onSelectDistrict) onSelectDistrict('nukus_city');
                  }}
                  className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 hover:border-cyan-400 text-gray-200 text-xs font-mono transition"
                >
                  Nukus shahri
                </button>
              </div>
            </div>

            {/* Full Select by 14 Regions */}
            <div className="p-4 rounded-2xl bg-[#0e1424] border border-gray-800 space-y-3">
              <h4 className="text-xs font-bold text-gray-300 uppercase font-mono">
                Barcha 14 ta Hudud va 200+ Tuman Ro‘yxati:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {UZBEKISTAN_REGIONS.map(reg => (
                  <div key={reg.id} className="p-3 rounded-xl bg-black/40 border border-gray-800/80 space-y-1.5">
                    <p className="text-xs font-bold text-cyan-300 font-['Space_Grotesk']">{reg.name}</p>
                    <div className="flex flex-wrap gap-1">
                      {reg.districts.map(d => (
                        <button
                          key={d.id}
                          onClick={() => {
                            sound.playClick();
                            if (onSelectDistrict) onSelectDistrict(d.id);
                            setDecreeStatus(`Prezident ${d.name}ga tashrif buyurdi!`);
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded font-mono transition ${
                            currentDistrictId === d.id
                              ? 'bg-cyan-500 text-black font-bold'
                              : 'bg-gray-900 text-gray-300 hover:text-white hover:bg-gray-800'
                          }`}
                        >
                          {d.name.replace(' tumani', '').replace(' shahri', '')}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TIZIMLI KO'RSATKICHLAR (KPI) & BURJ KHALIFA */}
        {activeTab === 'kpi' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Burj Khalifa 3D Status */}
            <div className="p-5 rounded-2xl bg-[#0e1424] border-2 border-yellow-500/40 shadow-lg">
              <h4 className="text-sm font-bold text-white uppercase font-mono text-yellow-300 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-yellow-400" />
                Burj Khalifa (Shahardagi Eng Baland Minora)
              </h4>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-black/60 border border-yellow-500/30 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Minora Narxi:</span>
                    <span className="text-emerald-400 font-bold font-mono">$1 (Maxsus VIP)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Balandligi:</span>
                    <span className="text-yellow-300 font-bold font-mono">20.5m (Eng baland 3D)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Aholi Sig‘imi:</span>
                    <span className="text-cyan-300 font-bold font-mono">+50,000 aholi</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400">
                  Burj Khalifa shaharning mutlaq eng baland minorasi bo‘lib, butun shaharga nur sochadi.
                </p>
              </div>
            </div>

            {/* Soliq Siyosati */}
            <div className="p-5 rounded-2xl bg-[#0e1424] border border-purple-500/30">
              <h4 className="text-sm font-bold text-white uppercase font-mono text-purple-300 mb-4 flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Prezident Soliq Siyosati: {taxRate}%
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
                      onLogAction(`Prezident farmoni: Soliq stavkasi ${val}% ga o'zgartirildi`, 'decree');
                    }
                  }}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-gray-400">
                  <span>5% (Past soliq)</span>
                  <span>10% (Standart)</span>
                  <span>25% (Maksimal xazina)</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  {taxRate <= 10 ? "Aholi soliqdan juda mamnun, baxt darajasi yuqori." : "Xazina tezroq to'lmoqda, baxt indeksi barqaror."}
                </p>
              </div>
            </div>

            {/* Xavfsizlik & Energiya */}
            <div className="p-5 rounded-2xl bg-[#0e1424] border border-emerald-500/30">
              <h4 className="text-sm font-bold text-white uppercase font-mono text-emerald-300 mb-4 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Tinchlik & Kiber-Patrul: {safetyLevel}%
              </h4>
              <div className="space-y-3">
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full" style={{ width: `${safetyLevel}%` }} />
                </div>
                <p className="text-[11px] text-gray-400">
                  Prezident nazorati ostida butun respublika tinch va xavfsiz.
                </p>
                <div className="pt-2 border-t border-gray-800 flex justify-between text-xs text-gray-300">
                  <span>Elektr ta'minoti:</span>
                  <span className="text-cyan-400 font-mono font-bold">100% Barqaror</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PREZIDENT FARMONLARI */}
        {activeTab === 'farmoyishlar' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#0e1424] border border-amber-500/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <h4 className="font-bold text-white">Favqulodda Davlat Subsidiyasi</h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Prezident zaxira fondidan shahar xazinasiga darhol +$500 mablag‘ o‘tkazish.
                </p>
              </div>
              <button
                onClick={() => {
                  onInjectFunds(500);
                  handleIssueDecree("Shahar xazinasiga +$500 davlat subsidiyasi ajratildi");
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>+$500 Xazinaga Qo‘shish</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e1424] border border-pink-500/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-pink-400 mb-2">
                  <Sparkles className="w-5 h-5" />
                  <h4 className="font-bold text-white">Butun Respublika Kiber-Bayrami</h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Barcha viloyat va tumanlarda bayramona nurlar, salyutlar va musiqa. Fuqarolar baxti 100%!
                </p>
              </div>
              <button
                onClick={() => {
                  onTriggerFestival();
                  handleIssueDecree("Butun Respublika bo‘ylab Oliy Kiber-Bayram e'lon qilindi");
                }}
                className="w-full py-2.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/50 text-pink-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Bayramni Boshlash 🎉</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e1424] border border-cyan-500/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-cyan-400 mb-2">
                  <Hammer className="w-5 h-5" />
                  <h4 className="font-bold text-white">Usta Rustamga Hudud Kengaytirish</h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Aholi sonini kutmasdan, Prezident farmoni bilan shaharni zudlik bilan yangi sektorlarga kengaytirish.
                </p>
              </div>
              <button
                onClick={() => {
                  onExpandTerritory();
                  handleIssueDecree("Yangi sektorlar ochilishi to‘g‘risida Oliy Farmon imzolandi");
                }}
                className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Hududni Kengaytirish ⚡</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 6: INSTAGRAM FUQAROLAR */}
        {activeTab === 'fuqarolar' && (
          <div className="space-y-6">
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
              <div className="w-full sm:w-48">
                <select
                  value={newCitizenRole}
                  onChange={(e) => setNewCitizenRole(e.target.value)}
                  className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                >
                  <option value="Rishton Kuloli">Rishton Kuloli</option>
                  <option value="Buxoro Zardo‘zi">Buxoro Zardo‘zi</option>
                  <option value="Samarqand Nonvoyi">Samarqand Nonvoyi</option>
                  <option value="Marg‘ilon To‘quvchisi">Marg‘ilon To‘quvchisi</option>
                  <option value="Xiva O‘ymakori">Xiva O‘ymakori</option>
                  <option value="Osh Pazandasi">Osh Pazandasi</option>
                  <option value="Kiber IT Mutaxassis">Kiber IT Mutaxassis</option>
                  <option value="Shahar Faoli">Shahar Faoli</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Instagram className="w-4 h-4" />
                <span>Fuqaro Qo‘shish</span>
              </button>
            </form>

            <div className="rounded-2xl bg-[#0e1424] border border-gray-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-900/90 text-gray-400 font-mono uppercase text-[10px] border-b border-gray-800">
                    <tr>
                      <th className="p-3">Fuqaro</th>
                      <th className="p-3">Instagram Nik</th>
                      <th className="p-3">Milliy Kasbi</th>
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
                        <td className="p-3 text-cyan-300">{c.role}</td>
                        <td className="p-3 font-mono text-gray-400">{c.house}</td>
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

        {/* TAB 7: HAR SONIYA SAQLANISH TARIXI */}
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
