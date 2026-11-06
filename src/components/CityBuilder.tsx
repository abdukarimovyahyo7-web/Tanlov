import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Home,
  Building,
  Building2,
  TreePine,
  Footprints,
  Sparkles,
  Trash2,
  Crown,
  Sun,
  Moon,
  Sunset,
  Volume2,
  VolumeX,
  Palette,
  Instagram,
  Coins,
  Users,
  Compass,
  Zap,
  Hammer,
  RotateCcw,
  Maximize2,
  Smile,
  X,
  Check,
  Plus,
  Play,
  Pause,
  FastForward,
  Smartphone,
  Eye,
  Rocket,
  ShoppingBag,
  Gem,
  Award,
} from 'lucide-react';
import {
  BuildingType,
  SkyscraperFloors,
  BUILDING_COLORS,
  BuildingColorOption,
  calculateBuildingCost,
  calculatePopulationIncrease,
  getUstaExpansionStatus,
  canAfford,
} from '../game/rules.ts';
import { GridCell, Citizen } from '../types/game.ts';
import { sound } from '../utils/audio.ts';
import { SavedActionLog, SavedGameState } from '../utils/storage.ts';
import { CityCanvas3D } from './CityCanvas3D.tsx';
import { UZBEKISTAN_REGIONS } from '../data/uzbekistanRegions.ts';

interface CityBuilderProps {
  isHokimGodMode: boolean;
  onToggleHokimGodMode: () => void;
  onOpenMayorDashboard: () => void;
  onOpenPhoneWidgets?: () => void;
  onAssignInstagramGlobal?: (instagram: string) => void;
  currentDistrictId?: string;
  currentDistrictName?: string;
  currentRegionName?: string;
  playerInstagram?: string;
  isPrezident?: boolean;
  onOpenElectionModal?: () => void;
  onSelectDistrict?: (districtId: string) => void;
  // Persistent state from App
  cells: Map<string, GridCell>;
  setCells: React.Dispatch<React.SetStateAction<Map<string, GridCell>>>;
  budget: number;
  setBudget: React.Dispatch<React.SetStateAction<number>>;
  population: number;
  setPopulation: React.Dispatch<React.SetStateAction<number>>;
  happiness: number;
  setHappiness: React.Dispatch<React.SetStateAction<number>>;
  gridSize: number;
  setGridSize: React.Dispatch<React.SetStateAction<number>>;
  taxRate: number;
  setTaxRate: React.Dispatch<React.SetStateAction<number>>;
  timeOfDay: 'day' | 'sunset' | 'night';
  setTimeOfDay: React.Dispatch<React.SetStateAction<'day' | 'sunset' | 'night'>>;
  gameSpeed: number;
  setGameSpeed: React.Dispatch<React.SetStateAction<number>>;
  isometric3D: boolean;
  setIsometric3D: React.Dispatch<React.SetStateAction<boolean>>;
  lastSavedText?: string;
  triggerSaveNow: (override?: Partial<SavedGameState>) => void;
  onResetCity: () => void;
  onLogAction?: (text: string, type: SavedActionLog['type']) => void;
}

export const CityBuilder: React.FC<CityBuilderProps> = ({
  isHokimGodMode,
  onToggleHokimGodMode,
  onOpenMayorDashboard,
  onOpenPhoneWidgets,
  currentDistrictId,
  currentDistrictName,
  currentRegionName,
  playerInstagram,
  isPrezident,
  onOpenElectionModal,
  onSelectDistrict,
  cells,
  setCells,
  budget,
  setBudget,
  population,
  setPopulation,
  happiness,
  setHappiness,
  gridSize,
  setGridSize,
  taxRate,
  setTaxRate,
  timeOfDay,
  setTimeOfDay,
  gameSpeed,
  setGameSpeed,
  isometric3D,
  setIsometric3D,
  lastSavedText,
  triggerSaveNow,
  onResetCity,
  onLogAction,
}) => {
  // Selected Tool state
  const [selectedTool, setSelectedTool] = useState<BuildingType | 'demolish' | 'inspect'>('residential_simple');
  const [selectedFloors, setSelectedFloors] = useState<SkyscraperFloors>(1);
  const [selectedColor, setSelectedColor] = useState<BuildingColorOption>(BUILDING_COLORS[0]);

  // Selected cell for inspecting & instagram/name editing
  const [inspectCell, setInspectCell] = useState<GridCell | null>(null);
  const [editInstagramInput, setEditInstagramInput] = useState<string>('');
  const [editNameInput, setEditNameInput] = useState<string>('');

  // Notification / banner
  const [bannerMessage, setBannerMessage] = useState<{ text: string; type: 'success' | 'warn' | 'expansion' } | null>(null);

  // Recalculate stats whenever cells change
  useEffect(() => {
    let newPop = 0;
    let businesses = 0;
    let parks = 0;
    let trees = 0;

    cells.forEach(cell => {
      newPop += calculatePopulationIncrease(cell.type as BuildingType, cell.floors || 1);
      if (cell.type === 'business' || cell.type === 'megamall') businesses += 1;
      else if (cell.type === 'park') parks += 1;
      else if (cell.type === 'tree') trees += 1;
    });

    setPopulation(newPop);

    // Calculate happiness based on eco balance vs density
    const totalEco = trees + parks * 3;
    const baseHappy = 82;
    const ecoBonus = Math.min(18, totalEco * 2);
    setHappiness(Math.min(100, Math.max(40, baseHappy + ecoBonus)));
  }, [cells]);

  // Usta Rustam expansion trigger: automatically alert when population crosses threshold
  const expansionStatus = getUstaExpansionStatus(population, gridSize);
  const hasTriggeredRef = useRef<number>(gridSize);

  useEffect(() => {
    if (expansionStatus.canExpand && expansionStatus.nextSize > gridSize && hasTriggeredRef.current !== expansionStatus.nextSize) {
      hasTriggeredRef.current = expansionStatus.nextSize;
      sound.playExpansion();
      setBannerMessage({
        text: `Usta Rustam: «Hokim buva, aholimiz ${population} kishiga yetdi! Hududni ${expansionStatus.nextSize}x${expansionStatus.nextSize} ga kengaytirdik!»`,
        type: 'expansion',
      });
      try {
        confetti({
          particleCount: 60,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#b026ff', '#ffd700'],
        });
      } catch {
        // ignore
      }
      setGridSize(expansionStatus.nextSize);
    }
  }, [expansionStatus, population, gridSize]);

  // Calculate current action cost
  const currentActionCost =
    selectedTool === 'demolish' || selectedTool === 'inspect'
      ? 0
      : calculateBuildingCost({
          type: selectedTool,
          floors: selectedTool === 'skyscraper' ? selectedFloors : undefined,
          colorId: selectedColor.id,
          isHokimGodMode,
        });

  // Handle cell click (Build, Demolish, Inspect)
  const handleCellClick = (x: number, y: number) => {
    const key = `${x},${y}`;
    const existing = cells.get(key);

    // Mode 1: Inspect
    if (selectedTool === 'inspect') {
      sound.playClick();
      if (existing) {
        setInspectCell(existing);
        setEditInstagramInput(existing.instagram || '');
        setEditNameInput(existing.customName || existing.name || '');
      } else {
        setBannerMessage({ text: `(${x}, ${y}) katak bo'sh. Uy qurish uchun menyudan tanlang.`, type: 'warn' });
      }
      return;
    }

    // Mode 2: Demolish
    if (selectedTool === 'demolish') {
      if (!existing) return;
      sound.playDemolish();
      const next = new Map(cells);
      next.delete(key);
      setCells(next);
      setBannerMessage({ text: `Bino buzildi (${x}, ${y})`, type: 'warn' });
      if (onLogAction) {
        onLogAction(`${existing.name || 'Bino'} buzildi (${x}, ${y})`, 'demolish');
      }
      triggerSaveNow({ cells: Array.from(next.entries()) });
      return;
    }

    // Mode 3: Construction
    const cost = currentActionCost;

    if (!canAfford(budget, cost, isHokimGodMode)) {
      sound.playClick();
      setBannerMessage({
        text: `Mablag' yetarli emas! Sizga $${cost} kerak, byudjetingiz: $${budget}. Hokimiyat God-rejimini yoqing yoki shahar daromadini kuting.`,
        type: 'warn',
      });
      return;
    }

    // Deduct cost if not in Hokim God Mode
    let newBudget = budget;
    if (!isHokimGodMode) {
      newBudget = Math.round((budget - cost) * 10) / 10;
      setBudget(newBudget);
    }

    // Play sounds & special celebration for Burj Khalifa or 100-floor Skyscraper
    sound.playBuild();
    if (selectedTool === 'burj_khalifa') {
      sound.playExpansion();
      try {
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.4 },
          colors: ['#ffd700', '#00f0ff', '#ffffff', '#ff0055'],
        });
      } catch {
        // ignore
      }
      setBannerMessage({
        text: `🏆 Shahardagi eng baland bino: 1$ lik Burj Khalifa minorasi barpo etildi! Dunyo mo'jizasi!`,
        type: 'expansion',
      });
    } else if (selectedTool === 'skyscraper' && selectedFloors === 100) {
      sound.playExpansion();
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#00f0ff', '#ffffff', '#ffd700'],
        });
      } catch {
        // ignore
      }
    }

    const defaultInsta =
      existing?.instagram ||
      (['residential_simple', 'business', 'skyscraper', 'burj_khalifa', 'cyber_villa', 'megamall', 'spaceport'].includes(
        selectedTool
      )
        ? '@fuqaro_' + Math.floor(100 + Math.random() * 900)
        : undefined);

    const defaultName =
      selectedTool === 'burj_khalifa'
        ? 'Burj Khalifa ($1 Eng baland minora)'
        : selectedTool === 'residential_simple'
        ? 'Oddiy Uy'
        : selectedTool === 'business'
        ? 'Biznes Binosi'
        : selectedTool === 'skyscraper'
        ? `${selectedFloors} Qavatli Osmono'par`
        : selectedTool === 'cyber_villa'
        ? 'Kiber Villa'
        : selectedTool === 'megamall'
        ? 'Savdo Majmuasi (Mall)'
        : selectedTool === 'spaceport'
        ? 'Kosmodrom'
        : selectedTool === 'tree'
        ? 'Kiber Daraxt'
        : selectedTool === 'park'
        ? 'Favvora va Park'
        : "Yo'l";

    const next = new Map(cells);
    const newCell: GridCell = {
      x,
      y,
      type: selectedTool,
      floors: selectedTool === 'skyscraper' ? selectedFloors : undefined,
      colorId: selectedColor.id,
      name: defaultName,
      customName: defaultName,
      instagram: defaultInsta,
      createdAt: Date.now(),
    };
    next.set(key, newCell);
    setCells(next);

    if (onLogAction) {
      onLogAction(`${newCell.name} barpo etildi (${x}, ${y}) - $${cost}`, 'build');
    }
    triggerSaveNow({
      cells: Array.from(next.entries()),
      budget: newBudget,
    });
  };

  // Manual Usta expansion
  const handleManualExpand = () => {
    sound.playExpansion();
    const nextSizes: { [key: number]: number } = { 8: 10, 10: 12, 12: 14, 14: 16 };
    const target = nextSizes[gridSize] || gridSize;
    setGridSize(target);
    setBannerMessage({
      text: `Usta Rustam: Hudud muvaffaqiyatli ${target}x${target} o'lchamga kengaytirildi!`,
      type: 'expansion',
    });
    if (onLogAction) {
      onLogAction(`Usta Rustam hududni ${target}x${target} ga kengaytirdi`, 'expand');
    }
    triggerSaveNow({ gridSize: target });
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        colors: ['#00f0ff', '#b026ff'],
      });
    } catch {
      // ignore
    }
  };

  // Save Instagram and Custom Name from inspector
  const handleSaveInspectDetails = () => {
    if (!inspectCell) return;
    sound.playClick();
    const key = `${inspectCell.x},${inspectCell.y}`;
    const next = new Map(cells);
    const updated = {
      ...inspectCell,
      instagram: editInstagramInput
        ? editInstagramInput.startsWith('@')
          ? editInstagramInput
          : `@${editInstagramInput}`
        : inspectCell.instagram,
      customName: editNameInput.trim() || inspectCell.name,
    };
    next.set(key, updated);
    setCells(next);
    setInspectCell(updated);
    setBannerMessage({
      text: `Bino ma'lumotlari saqlandi: «${updated.customName}» (${updated.instagram})`,
      type: 'success',
    });
    if (onLogAction) {
      onLogAction(
        `Bino (${inspectCell.x}, ${inspectCell.y}): «${updated.customName}» ga ${updated.instagram} biriktirildi`,
        'instagram'
      );
    }
    triggerSaveNow({ cells: Array.from(next.entries()) });
  };

  // Sardor & Laylo auto-styling
  const handleAgentAutoDesign = (agent: 'sardor' | 'laylo') => {
    sound.playBuild();
    const next = new Map(cells);
    let count = 0;
    next.forEach((cell, key) => {
      if (['residential_simple', 'business', 'skyscraper', 'burj_khalifa', 'cyber_villa', 'megamall'].includes(cell.type)) {
        cell.colorId = agent === 'sardor' ? 'krypton_cyan' : 'galaxy_purple';
        next.set(key, cell);
        count++;
      }
    });
    setCells(next);
    setBannerMessage({
      text:
        agent === 'sardor'
          ? `Arxitektor Sardor: ${count} ta bino fasadiga futuristik Kripton Moviy neon berildi!`
          : `Dizayner Laylo: ${count} ta bino fasadiga zamonaviy Galaktika Qirol Binafshasi berildi!`,
      type: 'success',
    });
    if (onLogAction) {
      onLogAction(
        `${agent === 'sardor' ? 'Arxitektor Sardor' : 'Dizayner Laylo'} ${count} ta bino fasadini yangiladi`,
        'color'
      );
    }
    triggerSaveNow({ cells: Array.from(next.entries()) });
  };

  return (
    <section id="game-section" className="py-10 relative overflow-hidden bg-[#070913]">
      {/* Background radial gradient */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-to-tr from-cyan-900/20 via-purple-900/20 to-blue-900/10 rounded-full blur-[160px]" />
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Real 3D Dvijok • Tanlov Mahallasi v1.2 Next-Gen</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk']">
              3D Shaharsozlik <span className="text-cyan-400">Maydoni</span>
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Haqiqiy 3D uylar, 2.000.000.000$ lik Burj Khalifa, 24K Oltin ranglar va Instagram nomlari!
            </p>
          </div>

          {/* Quick HUD controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Time of Day */}
            <div className="flex items-center bg-gray-900/80 border border-gray-700/60 rounded-lg p-0.5">
              <button
                onClick={() => {
                  sound.playClick();
                  setTimeOfDay('day');
                }}
                className={`p-1.5 rounded ${timeOfDay === 'day' ? 'bg-amber-500/20 text-amber-300' : 'text-gray-400 hover:text-white'}`}
                title="Kunduzgi yorug'lik"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setTimeOfDay('sunset');
                }}
                className={`p-1.5 rounded ${timeOfDay === 'sunset' ? 'bg-orange-500/20 text-orange-300' : 'text-gray-400 hover:text-white'}`}
                title="Quyosh botishi (Sunset)"
              >
                <Sunset className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setTimeOfDay('night');
                }}
                className={`p-1.5 rounded ${timeOfDay === 'night' ? 'bg-purple-500/20 text-cyan-300' : 'text-gray-400 hover:text-white'}`}
                title="Tungi kiber neon nurlar"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Game Speed */}
            <div className="flex items-center bg-gray-900/80 border border-gray-700/60 rounded-lg p-0.5 text-xs font-mono">
              <button
                onClick={() => setGameSpeed(0)}
                className={`p-1.5 rounded ${gameSpeed === 0 ? 'bg-red-500/20 text-red-300' : 'text-gray-400 hover:text-white'}`}
                title="Pauza"
              >
                <Pause className="w-3 h-3" />
              </button>
              <button
                onClick={() => setGameSpeed(1)}
                className={`p-1.5 rounded ${gameSpeed === 1 ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400 hover:text-white'}`}
                title="Oddiy tezlik (1x)"
              >
                <Play className="w-3 h-3" />
              </button>
              <button
                onClick={() => setGameSpeed(2)}
                className={`p-1.5 rounded ${gameSpeed === 2 ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:text-white'}`}
                title="Tezkor vaqt (2x)"
              >
                <FastForward className="w-3 h-3" />
              </button>
            </div>

            {/* Phone Widgets Button */}
            {onOpenPhoneWidgets && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenPhoneWidgets();
                }}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border border-purple-500/50 text-purple-300 hover:text-white text-xs font-bold font-mono flex items-center gap-1.5 shadow-md shadow-purple-950/40 transition active:scale-95"
                title="Telefon ish stoli va vidjetlarini sozlash"
              >
                <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                <span>Vidjetlar</span>
              </button>
            )}

            {/* Auto-save status badge */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono shadow-[0_0_10px_rgba(16,185,129,0.15)]"
              title="Har bir harakat va har soniya avtomatik saqlanadi"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span className="hidden sm:inline">Har soniya:</span>
              <span className="text-white font-bold">{lastSavedText || 'Saqlanmoqda'}</span>
            </div>

            {/* Hokim God-mode trigger */}
            <button
              onClick={() => {
                sound.playGodMode();
                onToggleHokimGodMode();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 border transition ${
                isHokimGodMode
                  ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                  : 'bg-gray-900/90 text-amber-300 border-amber-500/40 hover:bg-amber-500/20'
              }`}
            >
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>{isHokimGodMode ? "HOKIM GOD-MODE: CHEKSIZ" : "HOKIM HUQUQI"}</span>
            </button>

            {/* Reset City Button */}
            <button
              onClick={onResetCity}
              className="p-1.5 px-2 rounded-lg bg-gray-900/80 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:text-white transition text-xs font-mono flex items-center gap-1"
              title="Shaharni tozalash va noldan boshlash"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Qayta boshlash</span>
            </button>
          </div>
        </div>

        {/* Live Top Statistics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {/* Aholi */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-cyan-500/30 flex items-center justify-between shadow-lg shadow-cyan-950/20">
            <div>
              <p className="text-[10px] uppercase font-mono text-gray-400">Aholi Soni</p>
              <p className="text-lg sm:text-2xl font-bold font-mono text-cyan-300">
                {population.toLocaleString()} <span className="text-xs font-normal text-cyan-500">kishi</span>
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
          </div>

          {/* Mablag' / G'azna */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-amber-500/30 flex items-center justify-between shadow-lg shadow-amber-950/20">
            <div>
              <p className="text-[10px] uppercase font-mono text-gray-400">Mablag' (PUL)</p>
              <p className="text-lg sm:text-2xl font-bold font-mono text-amber-300">
                ${budget.toLocaleString()}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>

          {/* Shahar Kayfiyati */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-purple-500/30 flex items-center justify-between shadow-lg shadow-purple-950/20">
            <div>
              <p className="text-[10px] uppercase font-mono text-gray-400">Aholi Kayfiyati</p>
              <p className="text-lg sm:text-2xl font-bold font-mono text-purple-300">
                {happiness}% <span className="text-xs font-normal text-purple-400/80">ijobiy</span>
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Smile className="w-4 h-4" />
            </div>
          </div>

          {/* Hudud Maydoni / Usta Status */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-blue-500/30 flex items-center justify-between shadow-lg shadow-blue-950/20">
            <div>
              <p className="text-[10px] uppercase font-mono text-gray-400">Usta Maydoni</p>
              <p className="text-lg sm:text-2xl font-bold font-mono text-blue-300">
                {gridSize}x{gridSize} <span className="text-xs font-normal text-blue-400/80">kvadrat</span>
              </p>
            </div>
            <button
              onClick={handleManualExpand}
              className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 hover:bg-blue-500/40 text-blue-300 flex items-center justify-center transition"
              title="Usta Rustamga hududni kengaytirishni buyurish"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Banner Notification if any */}
        {bannerMessage && (
          <div
            className={`mb-4 px-4 py-2.5 rounded-xl border flex items-center justify-between text-xs sm:text-sm font-medium animate-fadeIn ${
              bannerMessage.type === 'expansion'
                ? 'bg-gradient-to-r from-blue-950/90 to-purple-950/90 border-blue-400/60 text-cyan-200'
                : bannerMessage.type === 'warn'
                ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{bannerMessage.text}</span>
            </div>
            <button
              onClick={() => setBannerMessage(null)}
              className="p-1 text-gray-400 hover:text-white rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* UZBEKISTAN REGIONS & ELECTIONS PROMINENT BANNER WITH DIRECT SWITCHER */}
        <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-[#0a1424] to-purple-950/70 border border-emerald-500/50 flex flex-col gap-3 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center text-emerald-300 font-bold shrink-0 text-xl shadow-lg">
                🇺🇿
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm sm:text-base font-bold text-white font-['Chakra_Petch'] flex items-center gap-1.5">
                    <span>📍 {currentRegionName ? `${currentRegionName} • ` : ''}{currentDistrictName || 'Chilonzor tumani'}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">(Google Maps Rasmiy)</span>
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold">
                    🌿 Yashil Maysali Tuproq • 360° 3D
                  </span>
                </div>
                <p className="text-xs text-gray-300 mt-0.5">
                  O'zbekistonning barcha 14 ta hudud va tumanlari • Har oy Hokim saylovi • 15 kunlik Yordamchi saylovi (16-kuni yangi saylov!)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center shrink-0 flex-wrap">
              {playerInstagram && (
                <span className="text-xs font-mono text-pink-400 bg-pink-950/60 border border-pink-500/40 px-2.5 py-1 rounded-lg">
                  {playerInstagram.startsWith('@') ? playerInstagram : `@${playerInstagram}`}
                </span>
              )}
              {onOpenElectionModal && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenElectionModal();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-extrabold text-xs font-mono flex items-center gap-1.5 shadow-md shadow-emerald-950/60 transition active:scale-95"
                >
                  <Crown className="w-4 h-4" />
                  <span>{isPrezident ? '👑 Prezident & Saylov Devoni' : 'Saylov & Nomzodlar'}</span>
                </button>
              )}
            </div>
          </div>

          {/* INSTANT REGION & DISTRICT QUICK SWITCHER BAR */}
          {onSelectDistrict && (
            <div className="pt-2 border-t border-gray-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs">
              <span className="text-[11px] font-mono text-cyan-300 uppercase tracking-wider font-bold shrink-0 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Hududni Tanlash:</span>
              </span>

              {/* Combined Fast Selector across all Uzbekistan Districts */}
              <select
                value={currentDistrictId || 'chilonzor'}
                onChange={e => {
                  sound.playClick();
                  onSelectDistrict(e.target.value);
                }}
                className="flex-1 bg-gray-950 border border-cyan-500/40 text-cyan-200 rounded-xl px-3 py-1.5 font-mono text-xs outline-none focus:border-cyan-400 cursor-pointer shadow-inner"
              >
                {UZBEKISTAN_REGIONS.map(reg => (
                  <optgroup key={reg.id} label={`--- ${reg.name} ---`}>
                    {reg.districts.map(dist => (
                      <option key={dist.id} value={dist.id}>
                        {reg.name}: {dist.name} (~{(dist.populationEstimate / 1000).toFixed(0)}k aholi)
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>

              {/* Quick Jump Buttons for Key Historic Cities */}
              <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono">
                <button
                  onClick={() => onSelectDistrict('samarkand_city')}
                  className={`px-2 py-1 rounded-lg border transition ${
                    currentDistrictId === 'samarkand_city'
                      ? 'bg-cyan-500 text-black border-cyan-400 font-bold'
                      : 'bg-gray-900/80 text-gray-300 border-gray-700 hover:border-cyan-400'
                  }`}
                  title="Samarqand shahriga o'tish"
                >
                  Samarqand
                </button>
                <button
                  onClick={() => onSelectDistrict('bukhara_city')}
                  className={`px-2 py-1 rounded-lg border transition ${
                    currentDistrictId === 'bukhara_city'
                      ? 'bg-cyan-500 text-black border-cyan-400 font-bold'
                      : 'bg-gray-900/80 text-gray-300 border-gray-700 hover:border-cyan-400'
                  }`}
                  title="Buxoro shahriga o'tish"
                >
                  Buxoro
                </button>
                <button
                  onClick={() => onSelectDistrict('qoqon')}
                  className={`px-2 py-1 rounded-lg border transition ${
                    currentDistrictId === 'qoqon'
                      ? 'bg-cyan-500 text-black border-cyan-400 font-bold'
                      : 'bg-gray-900/80 text-gray-300 border-gray-700 hover:border-cyan-400'
                  }`}
                  title="Qo'qon shahriga o'tish"
                >
                  Qo'qon
                </button>
                <button
                  onClick={() => onSelectDistrict('xiva_city')}
                  className={`px-2 py-1 rounded-lg border transition ${
                    currentDistrictId === 'xiva_city'
                      ? 'bg-cyan-500 text-black border-cyan-400 font-bold'
                      : 'bg-gray-900/80 text-gray-300 border-gray-700 hover:border-cyan-400'
                  }`}
                  title="Xiva shahriga o'tish"
                >
                  Xiva
                </button>
                <button
                  onClick={() => onSelectDistrict('nukus_city')}
                  className={`px-2 py-1 rounded-lg border transition ${
                    currentDistrictId === 'nukus_city'
                      ? 'bg-cyan-500 text-black border-cyan-400 font-bold'
                      : 'bg-gray-900/80 text-gray-300 border-gray-700 hover:border-cyan-400'
                  }`}
                  title="Nukus shahriga o'tish"
                >
                  Nukus
                </button>
                <button
                  onClick={() => onSelectDistrict('xojayli_city')}
                  className={`px-2 py-1 rounded-lg border transition ${
                    currentDistrictId === 'xojayli_city'
                      ? 'bg-amber-500 text-black border-amber-400 font-bold'
                      : 'bg-amber-950/60 text-amber-300 border-amber-600/40 hover:border-amber-400'
                  }`}
                  title="Xo‘jayli shahriga o'tish"
                >
                  ⭐ Xo‘jayli
                </button>
                <button
                  onClick={() => onSelectDistrict('taxiatosh')}
                  className={`px-2 py-1 rounded-lg border transition ${
                    currentDistrictId === 'taxiatosh'
                      ? 'bg-amber-500 text-black border-amber-400 font-bold'
                      : 'bg-amber-950/60 text-amber-300 border-amber-600/40 hover:border-amber-400'
                  }`}
                  title="Taxiatosh tumaniga o'tish"
                >
                  ⭐ Taxiatosh
                </button>
                <button
                  onClick={() => onSelectDistrict('yangiyol')}
                  className={`px-2 py-1 rounded-lg border transition ${
                    currentDistrictId === 'yangiyol'
                      ? 'bg-amber-500 text-black border-amber-400 font-bold'
                      : 'bg-amber-950/60 text-amber-300 border-amber-600/40 hover:border-amber-400'
                  }`}
                  title="Yangiyo‘l shahriga o'tish"
                >
                  ⭐ Yangiyo‘l
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MAIN GAME INTERACTION AREA: 3D WebGL Canvas + Sidebar Toolbar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* CENTER: THE 3D WEBGL ENGINE VIEWPORT */}
          <div className="lg:col-span-3 space-y-3">
            {/* Real Three.js Canvas */}
            <CityCanvas3D
              cells={cells}
              gridSize={gridSize}
              timeOfDay={timeOfDay}
              selectedTool={selectedTool}
              selectedFloors={selectedFloors}
              selectedColorId={selectedColor.id}
              isHokimGodMode={isHokimGodMode}
              currentDistrictName={currentDistrictName}
              currentRegionName={currentRegionName}
              onCellClick={handleCellClick}
              onInspectCell={cell => {
                if (cell) {
                  setInspectCell(cell);
                  setEditInstagramInput(cell.instagram || '');
                  setEditNameInput(cell.customName || cell.name || '');
                }
              }}
            />

            {/* Quick Agent Auto-Design Row */}
            <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2 text-gray-400">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="font-mono">AI Dizaynerlar:</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAgentAutoDesign('sardor')}
                  className="px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 font-mono transition"
                >
                  Sardor: Moviy Kiber Dizayn
                </button>
                <button
                  onClick={() => handleAgentAutoDesign('laylo')}
                  className="px-3 py-1 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-300 hover:bg-purple-500/20 font-mono transition"
                >
                  Laylo: Galaktika Qirol Dizayn
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: COMPREHENSIVE 3D BUILDING CATALOG & COLOR PALETTE */}
          <div className="space-y-4">
            {/* 1. ARCHITECTURAL WONDERS & BUILDINGS */}
            <div className="p-4 rounded-2xl bg-gray-900/80 border border-cyan-500/30 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  <span>3D Bino Katalogi</span>
                </h3>
                <span className="text-[10px] text-gray-400 font-mono">v1.2</span>
              </div>

              {/* BURJ KHALIFA - $1 (ENG BALAND MINORA!) */}
              <button
                onClick={() => {
                  sound.playClick();
                  setSelectedTool('burj_khalifa');
                }}
                className={`w-full p-3 rounded-xl border text-left transition relative overflow-hidden group ${
                  selectedTool === 'burj_khalifa'
                    ? 'border-amber-400 bg-gradient-to-r from-amber-950/80 to-yellow-950/80 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                    : 'border-amber-500/40 bg-gray-950/70 hover:border-amber-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
                      <Crown className="w-5 h-5 fill-amber-400 text-amber-300" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-300">
                        Burj Khalifa
                      </h4>
                      <p className="text-[10px] text-amber-400 font-mono font-bold">
                        $1 (Eng baland minora!)
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500 text-black">
                    VIP $1
                  </span>
                </div>
                <p className="text-[10px] text-gray-300 mt-1">
                  Shahardagi eng baland osmono'par qasr (mutlaq balandlik) • +50,000 aholi
                </p>
              </button>

              {/* STANDARD & PREMIUM BUILDINGS */}
              <div className="space-y-2">
                {/* Oddiy Uy ($30) */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedTool('residential_simple');
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                    selectedTool === 'residential_simple'
                      ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                      : 'border-gray-800 bg-gray-950/60 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Home className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">Oddiy Uy</div>
                      <div className="text-[10px] text-gray-400">+6 aholi</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400">$30</span>
                </button>

                {/* Biznes Binosi ($60) */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedTool('business');
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                    selectedTool === 'business'
                      ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                      : 'border-gray-800 bg-gray-950/60 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">Biznes Binosi</div>
                      <div className="text-[10px] text-gray-400">+14 ish o'rni & aholi</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">$60</span>
                </button>

                {/* Osmono'par (1Q, 20Q, 100Q) */}
                <div
                  className={`p-2.5 rounded-xl border transition ${
                    selectedTool === 'skyscraper'
                      ? 'border-cyan-400 bg-cyan-950/40'
                      : 'border-gray-800 bg-gray-950/60'
                  }`}
                >
                  <div
                    onClick={() => {
                      sound.playClick();
                      setSelectedTool('skyscraper');
                    }}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-purple-400" />
                      <div>
                        <div className="text-xs font-semibold text-white">Osmono'par Bino</div>
                        <div className="text-[10px] text-gray-400">{selectedFloors} qavat</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-purple-400">
                      ${selectedFloors === 100 ? 200 : selectedFloors === 20 ? 120 : 20}
                    </span>
                  </div>

                  {/* Floor selector pills */}
                  <div className="grid grid-cols-3 gap-1.5 mt-2 pt-2 border-t border-gray-800/80">
                    {([1, 20, 100] as SkyscraperFloors[]).map(fl => (
                      <button
                        key={fl}
                        onClick={e => {
                          e.stopPropagation();
                          sound.playClick();
                          setSelectedTool('skyscraper');
                          setSelectedFloors(fl);
                        }}
                        className={`py-1 rounded text-[10px] font-mono font-bold border transition ${
                          selectedTool === 'skyscraper' && selectedFloors === fl
                            ? 'bg-purple-600 border-purple-400 text-white'
                            : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        {fl} Qavat ({fl === 100 ? '$200' : fl === 20 ? '$120' : '$20'})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cyber Villa ($500) */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedTool('cyber_villa');
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                    selectedTool === 'cyber_villa'
                      ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                      : 'border-gray-800 bg-gray-950/60 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Gem className="w-4 h-4 text-teal-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">Kiber Villa</div>
                      <div className="text-[10px] text-gray-400">Hovuzli qasr • +25 aholi</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-teal-400">$500</span>
                </button>

                {/* Megapolis Mall ($1,500) */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedTool('megamall');
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                    selectedTool === 'megamall'
                      ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                      : 'border-gray-800 bg-gray-950/60 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4 text-pink-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">Savdo Majmuasi (Mall)</div>
                      <div className="text-[10px] text-gray-400">+200 xaridor & aholi</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-pink-400">$1,500</span>
                </button>

                {/* Kosmodrom ($5,000) */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedTool('spaceport');
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                    selectedTool === 'spaceport'
                      ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                      : 'border-gray-800 bg-gray-950/60 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Rocket className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">Kosmodrom</div>
                      <div className="text-[10px] text-gray-400">Kiber raketalar • +150 aholi</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-400">$5,000</span>
                </button>

                {/* Yo'l, Daraxt, Park */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setSelectedTool('road');
                    }}
                    className={`p-2 rounded-xl border text-center transition ${
                      selectedTool === 'road'
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                        : 'border-gray-800 bg-gray-950/60 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Footprints className="w-3.5 h-3.5 mx-auto mb-1 text-cyan-400" />
                    <div className="text-[10px] font-bold">Yo'l</div>
                    <div className="text-[9px] font-mono text-cyan-400">$5</div>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setSelectedTool('tree');
                    }}
                    className={`p-2 rounded-xl border text-center transition ${
                      selectedTool === 'tree'
                        ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300'
                        : 'border-gray-800 bg-gray-950/60 text-gray-400 hover:text-white'
                    }`}
                  >
                    <TreePine className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-400" />
                    <div className="text-[10px] font-bold">Daraxt</div>
                    <div className="text-[9px] font-mono text-emerald-400">$10</div>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setSelectedTool('park');
                    }}
                    className={`p-2 rounded-xl border text-center transition ${
                      selectedTool === 'park'
                        ? 'border-purple-400 bg-purple-950/40 text-purple-300'
                        : 'border-gray-800 bg-gray-950/60 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 mx-auto mb-1 text-purple-400" />
                    <div className="text-[10px] font-bold">Park</div>
                    <div className="text-[9px] font-mono text-purple-400">$25</div>
                  </button>
                </div>
              </div>

              {/* Utility Tools: Demolish & Inspect */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800">
                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedTool('demolish');
                  }}
                  className={`p-2 rounded-xl border text-center font-mono text-xs flex items-center justify-center gap-1.5 transition ${
                    selectedTool === 'demolish'
                      ? 'border-rose-500 bg-rose-950/50 text-rose-300 font-bold'
                      : 'border-gray-800 bg-gray-950/60 text-gray-400 hover:text-rose-300'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Buzish</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedTool('inspect');
                  }}
                  className={`p-2 rounded-xl border text-center font-mono text-xs flex items-center justify-center gap-1.5 transition ${
                    selectedTool === 'inspect'
                      ? 'border-purple-500 bg-purple-950/50 text-purple-300 font-bold'
                      : 'border-gray-800 bg-gray-950/60 text-gray-400 hover:text-purple-300'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Tekshirish</span>
                </button>
              </div>
            </div>

            {/* 2. YANGI RANGLAR & 24K OLTIN ($999.9) PALITRASI */}
            <div className="p-4 rounded-2xl bg-gray-900/80 border border-purple-500/30 shadow-xl space-y-2.5">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <h3 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-purple-400" />
                  <span>Fasad Ranglari</span>
                </h3>
                <span className="text-[10px] text-amber-400 font-mono font-bold">
                  Oltin $999.9
                </span>
              </div>

              {/* Color swatches */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {BUILDING_COLORS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedColor(color);
                    }}
                    className={`w-full p-2 rounded-xl border text-left text-xs flex items-center justify-between transition ${
                      selectedColor.id === color.id
                        ? 'border-cyan-400 bg-gray-800/90 text-white font-bold shadow-md'
                        : 'border-gray-800/80 bg-gray-950/50 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-[11px] truncate">{color.name}</span>
                      {color.isVip && (
                        <span className="text-[9px] bg-amber-500 text-black px-1.5 py-0.2 rounded font-bold font-mono">
                          VIP
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-cyan-300 font-bold shrink-0">
                      +${color.price}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3D BUILDING INSPECTOR & INSTAGRAM NAMING MODAL */}
        {inspectCell && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0e1424] border border-cyan-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-scaleUp">
              <button
                onClick={() => setInspectCell(null)}
                className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-white bg-gray-900/60"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                    {inspectCell.customName || inspectCell.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    Koordinata: ({inspectCell.x}, {inspectCell.y})
                  </p>
                </div>
              </div>

              {/* Custom Name input */}
              <div className="mb-4">
                <label className="block text-xs font-mono text-cyan-300 uppercase mb-1.5">
                  Bino Nomi (Instagram yoki maxsus nom):
                </label>
                <input
                  type="text"
                  value={editNameInput}
                  onChange={e => setEditNameInput(e.target.value)}
                  placeholder="Masalan: @bibixatcha2 qasri"
                  className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Instagram Handle input */}
              <div className="mb-4">
                <label className="block text-xs font-mono text-pink-400 uppercase mb-1.5 flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Instagram Niki:</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editInstagramInput}
                    onChange={e => setEditInstagramInput(e.target.value)}
                    placeholder="@tanlovmahallasi"
                    className="flex-1 bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                  <button
                    onClick={handleSaveInspectDetails}
                    className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Saqlash</span>
                  </button>
                </div>
              </div>

              {/* Color alteration */}
              <div className="mb-5">
                <label className="block text-xs font-mono text-cyan-300 uppercase mb-1.5">
                  Fasad Rangini Yangilash:
                </label>
                <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {BUILDING_COLORS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        sound.playClick();
                        const key = `${inspectCell.x},${inspectCell.y}`;
                        const next = new Map(cells);
                        const updated = { ...inspectCell, colorId: c.id };
                        next.set(key, updated);
                        setCells(next);
                        setInspectCell(updated);
                        triggerSaveNow({ cells: Array.from(next.entries()) });
                      }}
                      className={`px-2 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 justify-center ${
                        inspectCell.colorId === c.id
                          ? 'border-white bg-white/10 text-white font-bold'
                          : 'border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.hex }} />
                      <span className="truncate text-[10px]">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-800">
                <button
                  onClick={() => {
                    const key = `${inspectCell.x},${inspectCell.y}`;
                    sound.playDemolish();
                    const next = new Map(cells);
                    next.delete(key);
                    setCells(next);
                    setInspectCell(null);
                    triggerSaveNow({ cells: Array.from(next.entries()) });
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900/60 text-xs font-medium flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  Binoni Buzish
                </button>

                <button
                  onClick={() => setInspectCell(null)}
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
