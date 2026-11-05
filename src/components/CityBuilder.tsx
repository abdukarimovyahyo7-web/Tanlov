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
} from 'lucide-react';
import {
  BuildingType,
  SkyscraperFloors,
  BUILDING_COLORS,
  BuildingColorOption,
  calculateBuildingCost,
  calculatePopulationIncrease,
  calculateIncomePerSecond,
  getUstaExpansionStatus,
  canAfford,
} from '../game/rules.ts';
import { GridCell, Citizen } from '../types/game.ts';
import { sound } from '../utils/audio.ts';
import { SavedActionLog, SavedGameState } from '../utils/storage.ts';

interface CityBuilderProps {
  isHokimGodMode: boolean;
  onToggleHokimGodMode: () => void;
  onOpenMayorDashboard: () => void;
  onAssignInstagramGlobal?: (instagram: string) => void;
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

  // Selected cell for inspecting & instagram editing
  const [inspectCell, setInspectCell] = useState<GridCell | null>(null);
  const [editInstagramInput, setEditInstagramInput] = useState<string>('');

  // Notification / banner
  const [bannerMessage, setBannerMessage] = useState<{ text: string; type: 'success' | 'warn' | 'expansion' } | null>(null);

  // Recalculate stats whenever cells change
  useEffect(() => {
    let newPop = 0;
    let businesses = 0;
    let parks = 0;
    let trees = 0;

    cells.forEach(cell => {
      if (cell.type === 'residential_simple') newPop += calculatePopulationIncrease('residential_simple');
      else if (cell.type === 'business') {
        newPop += calculatePopulationIncrease('business');
        businesses += 1;
      } else if (cell.type === 'skyscraper') {
        newPop += calculatePopulationIncrease('skyscraper', cell.floors || 1);
      } else if (cell.type === 'park') {
        newPop += calculatePopulationIncrease('park');
        parks += 1;
      } else if (cell.type === 'tree') {
        trees += 1;
      }
    });

    setPopulation(newPop);

    // Calculate happiness based on eco balance (parks & trees) vs density
    const totalEco = trees + parks * 3;
    const baseHappy = 80;
    const ecoBonus = Math.min(20, totalEco * 3);
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
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#b026ff', '#ffb703'],
        });
      } catch {
        // ignore
      }
      setGridSize(expansionStatus.nextSize);
    }
  }, [expansionStatus, population, gridSize]);

  // Calculate current action cost
  const currentActionCost = selectedTool === 'demolish' || selectedTool === 'inspect'
    ? 0
    : calculateBuildingCost({
        type: selectedTool,
        floors: selectedTool === 'skyscraper' ? selectedFloors : undefined,
        colorId: selectedColor.id,
        isHokimGodMode,
      });

  // Handle cell click
  const handleCellClick = (x: number, y: number) => {
    sound.playClick();
    const key = `${x},${y}`;
    const existing = cells.get(key);

    // If inspect mode or cell has building and user clicked inspect
    if (selectedTool === 'inspect') {
      if (existing) {
        setInspectCell(existing);
        setEditInstagramInput(existing.instagram || '');
      } else {
        setInspectCell(null);
      }
      return;
    }

    // Demolish tool
    if (selectedTool === 'demolish') {
      if (existing) {
        sound.playDemolish();
        const next = new Map(cells);
        next.delete(key);
        setCells(next);
        setBannerMessage({ text: `Bino buzildi (${x}, ${y})`, type: 'warn' });
        if (onLogAction) {
          onLogAction(`Maydon (${x}, ${y}) dagi ${existing.name || 'bino'} buzildi`, 'demolish');
        }
        triggerSaveNow({ cells: Array.from(next.entries()) });
        if (inspectCell?.x === x && inspectCell?.y === y) {
          setInspectCell(null);
        }
      }
      return;
    }

    // Building tool
    const cost = currentActionCost;
    if (!canAfford(budget, cost, isHokimGodMode)) {
      setBannerMessage({ text: `Mablag' yetarli emas! Sizga $${cost} kerak.`, type: 'warn' });
      return;
    }

    // Deduct cost if not God Mode
    const newBudget = isHokimGodMode ? budget : Math.max(0, budget - cost);
    if (!isHokimGodMode) {
      setBudget(newBudget);
    }

    sound.playBuild();
    if (selectedTool === 'skyscraper' && selectedFloors === 100) {
      sound.playExpansion();
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.5 },
          colors: ['#00f0ff', '#ffffff', '#ffd700'],
        });
      } catch {
        // ignore
      }
    }

    const next = new Map(cells);
    const newCell: GridCell = {
      x,
      y,
      type: selectedTool,
      floors: selectedTool === 'skyscraper' ? selectedFloors : undefined,
      colorId: selectedColor.id,
      name:
        selectedTool === 'residential_simple'
          ? 'Oddiy Uy'
          : selectedTool === 'business'
          ? 'Biznes Binosi'
          : selectedTool === 'skyscraper'
          ? `${selectedFloors} Qavatli Osmono'par`
          : selectedTool === 'tree'
          ? 'Kiber Daraxt'
          : selectedTool === 'park'
          ? 'Favvora va Park'
          : 'Yo\'l',
      instagram: existing?.instagram || (['residential_simple', 'business', 'skyscraper'].includes(selectedTool) ? '@fuqaro_' + Math.floor(100 + Math.random() * 900) : undefined),
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

  // Save Instagram update on cell
  const handleSaveInstagram = () => {
    if (!inspectCell) return;
    sound.playClick();
    const key = `${inspectCell.x},${inspectCell.y}`;
    const next = new Map(cells);
    const updated = {
      ...inspectCell,
      instagram: editInstagramInput.startsWith('@') ? editInstagramInput : `@${editInstagramInput}`,
    };
    next.set(key, updated);
    setCells(next);
    setInspectCell(updated);
    setBannerMessage({ text: `Instagram niki saqlandi: ${updated.instagram}`, type: 'success' });
    if (onLogAction) {
      onLogAction(`Bino (${inspectCell.x}, ${inspectCell.y}) ga Instagram: ${updated.instagram} biriktirildi`, 'instagram');
    }
    triggerSaveNow({ cells: Array.from(next.entries()) });
  };

  // Sardor & Laylo auto-styling
  const handleAgentAutoDesign = (agent: 'sardor' | 'laylo') => {
    sound.playBuild();
    const next = new Map(cells);
    let count = 0;
    next.forEach((cell, key) => {
      if (['residential_simple', 'business', 'skyscraper'].includes(cell.type)) {
        cell.colorId = agent === 'sardor' ? 'neon_cyan' : 'royal_purple';
        next.set(key, cell);
        count++;
      }
    });
    setCells(next);
    setBannerMessage({
      text: agent === 'sardor'
        ? `Arxitektor Sardor: ${count} ta bino fasadiga futuristik Kiber Moviy neon berildi!`
        : `Dizayner Laylo: ${count} ta bino fasadiga zamonaviy Qirol Binafshasi uyg'unligi berildi!`,
      type: 'success',
    });
    if (onLogAction) {
      onLogAction(
        `${agent === 'sardor' ? 'Arxitektor Sardor' : 'Dizayner Laylo'} ${count} ta bino fasadini kiber rangda yangiladi`,
        'color'
      );
    }
    triggerSaveNow({ cells: Array.from(next.entries()) });
  };

  // Generate grid array
  const gridRows = Array.from({ length: gridSize }, (_, y) =>
    Array.from({ length: gridSize }, (_, x) => ({ x, y }))
  );

  return (
    <section id="game-section" className="py-12 relative overflow-hidden bg-[#070913]">
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
              <span>Interaktiv 3D Prototip • Tanlov Mahallasi</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk']">
              Shaharsozlik <span className="text-cyan-400">Maydoni</span>
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Maydonga bosing, uylarni quring, aholini ko'paytiring va Instagram niklarini biriktiring.
            </p>
          </div>

          {/* Quick HUD controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle (3D Isometric vs 2D Flat) */}
            <button
              onClick={() => {
                sound.playClick();
                setIsometric3D(!isometric3D);
              }}
              className="px-3 py-1.5 rounded-lg bg-gray-900/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center gap-1.5 hover:bg-cyan-500/20 transition"
              title="3D Izometrik / 2D Ko'rinish"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isometric3D ? '3D Izometrik' : '2D Tekis'}</span>
            </button>

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

            {/* Auto-save status badge */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono shadow-[0_0_10px_rgba(16,185,129,0.15)]"
              title="Har bir harakat va har soniya avtomatik saqlanadi"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
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

        {/* TOP STATUS BAR (Aholi soni, Mablag', Daromad, Baxt darajasi, Maydon) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-6">
          {/* Mablag' / Budget */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-amber-500/30 flex items-center justify-between shadow-lg shadow-amber-950/20">
            <div>
              <p className="text-[10px] uppercase font-mono text-gray-400">Mablag' (PUL)</p>
              <p className="text-lg sm:text-xl font-bold font-mono text-amber-300 flex items-center gap-1">
                <span>{isHokimGodMode ? '∞ CHEKSIZ' : `$${budget.toLocaleString()}`}</span>
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>

          {/* Aholi Soni */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-cyan-500/30 flex items-center justify-between shadow-lg shadow-cyan-950/20">
            <div>
              <p className="text-[10px] uppercase font-mono text-gray-400">Aholi Soni</p>
              <p className="text-lg sm:text-xl font-bold font-mono text-cyan-300">
                {population.toLocaleString()} <span className="text-xs font-normal text-cyan-400/80">kishi</span>
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
          </div>

          {/* Daromad/sekund */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-emerald-500/30 flex items-center justify-between shadow-lg shadow-emerald-950/20">
            <div>
              <p className="text-[10px] uppercase font-mono text-gray-400">Soliq Tushumi</p>
              <p className="text-lg sm:text-xl font-bold font-mono text-emerald-400">
                +${calculateIncomePerSecond(
                  Array.from(cells.values()).filter(c => c.type === 'business').length,
                  population,
                  taxRate,
                  happiness
                )}<span className="text-xs font-normal text-emerald-500/80">/sek</span>
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>

          {/* Baxt Darajasi */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-purple-500/30 flex items-center justify-between shadow-lg shadow-purple-950/20">
            <div>
              <p className="text-[10px] uppercase font-mono text-gray-400">Baxt Darajasi</p>
              <p className="text-lg sm:text-xl font-bold font-mono text-purple-300">
                {happiness}% <span className="text-xs">😊</span>
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
              <p className="text-lg sm:text-xl font-bold font-mono text-blue-300">
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

          {/* Hokimiyat Boshqaruv Markazi Link */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenMayorDashboard();
            }}
            className="p-3 rounded-xl bg-gradient-to-br from-purple-900/40 to-cyan-900/30 border border-cyan-400/40 hover:border-cyan-300 flex items-center justify-between shadow-lg shadow-cyan-950/30 group transition text-left"
          >
            <div>
              <p className="text-[10px] uppercase font-mono text-cyan-300 group-hover:text-white">Tizimli Nazorat</p>
              <p className="text-sm font-bold text-white flex items-center gap-1">
                <span>Hokimiyat Paneli</span>
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
              <Crown className="w-4 h-4" />
            </div>
          </button>
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

        {/* MAIN GAME INTERACTION AREA (Center Grid + Right Toolbar) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* CENTER: THE 3D / ISOMETRIC GREEN TERRAIN GRID */}
          <div className="lg:col-span-3 rounded-2xl bg-[#0b0f1a] border border-cyan-500/20 p-3 sm:p-6 shadow-2xl relative min-h-[500px] flex flex-col justify-between overflow-x-auto">
            {/* Grid Environment Lighting Background */}
            <div
              className={`absolute inset-0 rounded-2xl pointer-events-none transition-colors duration-1000 ${
                timeOfDay === 'day'
                  ? 'bg-gradient-to-b from-sky-500/10 via-emerald-500/5 to-transparent'
                  : timeOfDay === 'sunset'
                  ? 'bg-gradient-to-b from-orange-600/15 via-purple-600/10 to-transparent'
                  : 'bg-gradient-to-b from-indigo-950/40 via-purple-950/20 to-black/60'
              }`}
            />

            {/* Top Toolbar overlay on grid: Selected tool preview & cost */}
            <div className="relative z-10 flex items-center justify-between gap-2 flex-wrap mb-4 bg-gray-900/70 backdrop-blur-md px-3 py-2 rounded-xl border border-gray-800">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400 font-mono">Tanlangan uskuna:</span>
                <span className="font-bold text-white uppercase font-mono px-2 py-0.5 rounded bg-gray-800 border border-gray-700">
                  {selectedTool === 'residential_simple'
                    ? 'Oddiy Uy ($30)'
                    : selectedTool === 'business'
                    ? 'Biznes Binosi ($60)'
                    : selectedTool === 'skyscraper'
                    ? `Osmono'par ${selectedFloors} Qavat ($${selectedFloors === 100 ? 200 : selectedFloors === 20 ? 120 : 20})`
                    : selectedTool === 'tree'
                    ? 'Daraxt ($10)'
                    : selectedTool === 'road'
                    ? 'Yo\'l ($5)'
                    : selectedTool === 'park'
                    ? 'Park / Favvora ($25)'
                    : selectedTool === 'demolish'
                    ? 'Buzish / Ekskavator ($0)'
                    : 'Tekshirish'}
                </span>
                {['residential_simple', 'business', 'skyscraper'].includes(selectedTool) && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1 border"
                    style={{
                      borderColor: selectedColor.hex,
                      backgroundColor: `${selectedColor.hex}20`,
                      color: selectedColor.hex,
                    }}
                  >
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: selectedColor.hex }} />
                    {selectedColor.name} (+${selectedColor.price})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-gray-400">
                  Narxi: <strong className="text-amber-400 font-bold">{isHokimGodMode ? '$0 (Hokim)' : `$${currentActionCost}`}</strong>
                </span>
                {selectedTool !== 'inspect' && (
                  <button
                    onClick={() => setSelectedTool('inspect')}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 underline"
                  >
                    Bino tafsilotlarini ko'rish
                  </button>
                )}
              </div>
            </div>

            {/* THE INTERACTIVE CITY GRID (Isometric / Orthogonal with Cyber Styling) */}
            <div className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-auto">
              <div
                className={`transition-all duration-500 origin-center ${
                  isometric3D
                    ? 'transform rotate-x-[55deg] rotate-z-[-40deg] my-4'
                    : 'transform my-2'
                }`}
                style={{
                  perspective: '1200px',
                  transformStyle: 'preserve-3d',
                  transform: isometric3D
                    ? `rotateX(55deg) rotateZ(-40deg) scale(${
                        gridSize >= 14 ? 0.72 : gridSize >= 12 ? 0.8 : gridSize >= 10 ? 0.9 : 1
                      })`
                    : 'scale(1)',
                }}
              >
                <div
                  className="grid gap-1 sm:gap-1.5 p-3 rounded-2xl border border-cyan-500/30 shadow-[0_0_50px_rgba(0,240,255,0.15)] transition-colors duration-500"
                  style={{
                    gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                    backgroundColor:
                      timeOfDay === 'night'
                        ? '#091517'
                        : timeOfDay === 'sunset'
                        ? '#141724'
                        : '#0b241b',
                  }}
                >
                  {gridRows.map((row, y) =>
                    row.map(({ x }) => {
                      const key = `${x},${y}`;
                      const cell = cells.get(key);
                      const isOccupied = !!cell;
                      const cellColor = cell?.colorId ? BUILDING_COLORS.find(c => c.id === cell.colorId) || BUILDING_COLORS[0] : null;

                      return (
                        <button
                          key={key}
                          onClick={() => handleCellClick(x, y)}
                          className={`${
                            gridSize >= 14
                              ? 'w-7 h-7 sm:w-9 sm:h-9'
                              : gridSize >= 12
                              ? 'w-8 h-8 sm:w-10 sm:h-10'
                              : 'w-9 h-9 sm:w-12 sm:h-12'
                          } rounded-lg relative flex items-center justify-center transition-all duration-200 group active:scale-95 border ${
                            cell?.type === 'road'
                              ? 'bg-gray-800/90 border-gray-600/50 shadow-inner'
                              : isOccupied
                              ? 'bg-slate-900/90 border-cyan-500/40 shadow-md hover:border-cyan-300'
                              : 'bg-emerald-950/40 border-emerald-500/20 hover:bg-emerald-900/50 hover:border-cyan-400/60'
                          }`}
                          style={{
                            transformStyle: 'preserve-3d',
                          }}
                          title={`Maydon (${x}, ${y}) ${cell ? `- ${cell.name} (${cell.instagram || 'Fuqaro yo\'q'})` : '- Bo\'sh joy'}`}
                          aria-label={`Cell ${x},${y}`}
                        >
                          {/* Empty cell hover guide */}
                          {!cell && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Plus className="w-3.5 h-3.5 text-cyan-400/70" />
                            </div>
                          )}

                          {/* ROAD */}
                          {cell?.type === 'road' && (
                            <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                              <div className="w-full h-1 bg-yellow-400/60 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                              {/* Animated passing cyber car light */}
                              <div className="absolute w-2 h-1 bg-cyan-400 rounded-full animate-ping opacity-60" />
                            </div>
                          )}

                          {/* TREE */}
                          {cell?.type === 'tree' && (
                            <div className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform">
                              <TreePine className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                            </div>
                          )}

                          {/* PARK & FOUNTAIN */}
                          {cell?.type === 'park' && (
                            <div className="w-full h-full p-1 flex items-center justify-center relative">
                              <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.6)]">
                                <div className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
                              </div>
                            </div>
                          )}

                          {/* ODDIY UY ($30) */}
                          {cell?.type === 'residential_simple' && (
                            <div
                              className="relative flex flex-col items-center justify-center p-0.5 group-hover:-translate-y-1 transition-transform"
                              style={{ transform: isometric3D ? 'translateZ(10px)' : 'none' }}
                            >
                              <Home
                                className="w-5 h-5 sm:w-6 sm:h-6"
                                style={{
                                  color: cellColor?.hex || '#00f0ff',
                                  filter: `drop-shadow(0 0 6px ${cellColor?.hex || '#00f0ff'})`,
                                }}
                              />
                              <span className="text-[7px] sm:text-[8px] font-mono font-bold text-white bg-black/70 px-1 rounded truncate max-w-[34px] sm:max-w-[44px]">
                                {cell.instagram ? cell.instagram.replace('@', '') : 'Oddiy'}
                              </span>
                            </div>
                          )}

                          {/* BIZNES UCHUN BINO ($60) */}
                          {cell?.type === 'business' && (
                            <div
                              className="relative flex flex-col items-center justify-center p-0.5 group-hover:-translate-y-1 transition-transform"
                              style={{ transform: isometric3D ? 'translateZ(14px)' : 'none' }}
                            >
                              <Building2
                                className="w-5 h-5 sm:w-7 sm:h-7"
                                style={{
                                  color: cellColor?.hex || '#ffb703',
                                  filter: `drop-shadow(0 0 8px ${cellColor?.hex || '#ffb703'})`,
                                }}
                              />
                              <span className="text-[7px] font-mono text-amber-300 bg-black/80 px-1 rounded truncate max-w-[36px] sm:max-w-[44px]">
                                BIZNES
                              </span>
                            </div>
                          )}

                          {/* OSMONO'PAR BINO (1, 20, 100 Qavat) */}
                          {cell?.type === 'skyscraper' && (
                            <div
                              className="relative flex flex-col items-center justify-center group-hover:-translate-y-2 transition-transform"
                              style={{
                                transform: isometric3D
                                  ? `translateZ(${cell.floors === 100 ? '34px' : cell.floors === 20 ? '22px' : '12px'})`
                                  : 'none',
                              }}
                            >
                              {/* 100 floors ultra glowing beacon beam */}
                              {cell.floors === 100 && (
                                <div className="absolute -top-6 w-1 h-6 bg-gradient-to-t from-cyan-400 to-white animate-pulse shadow-[0_0_12px_#00f0ff]" />
                              )}
                              <Building
                                className={`w-5 h-5 sm:w-7 sm:h-7 ${cell.floors === 100 ? 'text-white' : ''}`}
                                style={{
                                  color: cell.floors === 100 ? '#ffffff' : cellColor?.hex || '#b026ff',
                                  filter: `drop-shadow(0 0 ${cell.floors === 100 ? '14px' : '8px'} ${cellColor?.hex || '#00f0ff'})`,
                                }}
                              />
                              <span
                                className={`text-[7px] font-mono font-bold px-1 rounded ${
                                  cell.floors === 100
                                    ? 'bg-purple-600 text-white animate-bounce'
                                    : cell.floors === 20
                                    ? 'bg-blue-600 text-cyan-200'
                                    : 'bg-gray-800 text-gray-300'
                                }`}
                              >
                                {cell.floors}Q
                              </span>
                            </div>
                          )}

                          {/* Instagram Badge dot if citizen assigned */}
                          {cell?.instagram && (
                            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_5px_#ec4899]" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Grid Legend / Citizens count */}
            <div className="relative z-10 mt-4 flex items-center justify-between text-xs text-gray-400 border-t border-gray-800/80 pt-3 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" /> Oddiy Uy
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" /> Biznes
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_6px_#a855f7]" /> Osmono'par
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_6px_#ec4899]" /> @Instagram
                </span>
              </div>

              <div className="font-mono text-cyan-400">
                Usta Rustam: Aholi {population} kishi • {gridSize}x{gridSize} Hudud
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR: TOOLBAR, SKYSCRAPER FLOORS, COLORS & AGENTS */}
          <div className="lg:col-span-1 space-y-4">
            {/* Tool Selection Box */}
            <div className="p-4 rounded-2xl bg-[#0b0f1a] border border-cyan-500/20 shadow-xl">
              <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] mb-3 flex items-center justify-between">
                <span>Qurilish Asboblari</span>
                <span className="text-[10px] font-mono text-gray-400">Bosing & Maydonga quying</span>
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {/* Oddiy Uy ($30) */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedTool('residential_simple');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    selectedTool === 'residential_simple'
                      ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'bg-gray-900/60 border-gray-800 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Home className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono font-bold text-cyan-300">$30</span>
                  </div>
                  <p className="text-xs font-semibold">Oddiy Uy</p>
                  <p className="text-[10px] text-gray-400">+6 Aholi</p>
                </button>

                {/* Biznes Binosi ($60) */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedTool('business');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    selectedTool === 'business'
                      ? 'bg-amber-950/80 border-amber-400 text-white shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                      : 'bg-gray-900/60 border-gray-800 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-mono font-bold text-amber-300">$60</span>
                  </div>
                  <p className="text-xs font-semibold">Biznes Bino</p>
                  <p className="text-[10px] text-gray-400">+$3.5/sek daromad</p>
                </button>

                {/* Osmono'par Bino */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedTool('skyscraper');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition col-span-2 ${
                    selectedTool === 'skyscraper'
                      ? 'bg-purple-950/80 border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                      : 'bg-gray-900/60 border-gray-800 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-semibold">Osmono'par Bino</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-purple-300">
                      ${selectedFloors === 100 ? 200 : selectedFloors === 20 ? 120 : 20}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {([1, 20, 100] as SkyscraperFloors[]).map(fl => (
                      <span
                        key={fl}
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playClick();
                          setSelectedTool('skyscraper');
                          setSelectedFloors(fl);
                        }}
                        className={`flex-1 py-1 text-center text-[10px] font-mono rounded border cursor-pointer transition ${
                          selectedFloors === fl && selectedTool === 'skyscraper'
                            ? 'bg-purple-600 text-white border-purple-400 font-bold'
                            : 'bg-gray-900 text-gray-400 border-gray-700 hover:text-white'
                        }`}
                      >
                        {fl} Qavat ({fl === 100 ? '$200' : fl === 20 ? '$120' : '$20'})
                      </span>
                    ))}
                  </div>
                </button>

                {/* Daraxt Ekish ($10) */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedTool('tree');
                  }}
                  className={`p-2 rounded-xl border text-left transition ${
                    selectedTool === 'tree'
                      ? 'bg-emerald-950/80 border-emerald-400 text-white'
                      : 'bg-gray-900/60 border-gray-800 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <TreePine className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono font-bold text-emerald-300">$10</span>
                  </div>
                  <p className="text-[11px] font-semibold mt-1">Daraxt Ekish</p>
                </button>

                {/* Yo'l Solish ($5) */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedTool('road');
                  }}
                  className={`p-2 rounded-xl border text-left transition ${
                    selectedTool === 'road'
                      ? 'bg-gray-800 border-gray-400 text-white'
                      : 'bg-gray-900/60 border-gray-800 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Footprints className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-mono font-bold text-yellow-300">$5</span>
                  </div>
                  <p className="text-[11px] font-semibold mt-1">Yo'l Solish</p>
                </button>

                {/* Park / Favvora ($25) */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedTool('park');
                  }}
                  className={`p-2 rounded-xl border text-left transition ${
                    selectedTool === 'park'
                      ? 'bg-blue-950/80 border-blue-400 text-white'
                      : 'bg-gray-900/60 border-gray-800 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-mono font-bold text-blue-300">$25</span>
                  </div>
                  <p className="text-[11px] font-semibold mt-1">Park & Favvora</p>
                </button>

                {/* Buzish / Demolish */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedTool('demolish');
                  }}
                  className={`p-2 rounded-xl border text-left transition ${
                    selectedTool === 'demolish'
                      ? 'bg-rose-950/80 border-rose-400 text-white shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                      : 'bg-gray-900/60 border-gray-800 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-mono font-bold text-rose-300">$0</span>
                  </div>
                  <p className="text-[11px] font-semibold mt-1">Buzish (Ekskavator)</p>
                </button>
              </div>
            </div>

            {/* Uy Ranglari ($10 - $30) */}
            <div className="p-4 rounded-2xl bg-[#0b0f1a] border border-cyan-500/20 shadow-xl">
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <Palette className="w-3.5 h-3.5" />
                  Uy Ranglari ($10 - $30)
                </span>
                <span className="text-[10px] text-gray-400">Fasad & Neon</span>
              </h3>

              <div className="space-y-1.5">
                {BUILDING_COLORS.map(col => {
                  const isChosen = selectedColor.id === col.id;
                  return (
                    <button
                      key={col.id}
                      onClick={() => {
                        sound.playClick();
                        setSelectedColor(col);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs flex items-center justify-between transition ${
                        isChosen
                          ? 'bg-gray-800/90 border-cyan-400 text-white'
                          : 'bg-gray-900/50 border-gray-800/80 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span className="font-medium text-white">{col.name}</span>
                      </div>
                      <span className="font-mono text-cyan-300 text-[11px]">+${col.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2 ta Uy Dizayneri Tezkor Maslahat & Uslublash */}
            <div className="p-4 rounded-2xl bg-[#0b0f1a] border border-cyan-500/20 shadow-xl space-y-2">
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5 text-purple-300">
                <Sparkles className="w-3.5 h-3.5" />
                2 ta Uy Dizayneri Agent
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleAgentAutoDesign('sardor')}
                  className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/40 hover:bg-cyan-500/20 text-cyan-300 flex flex-col items-center text-center transition"
                  title="Sardor: Barcha binolarga Kiber Moviy neon nuri berish"
                >
                  <span className="font-bold text-[11px]">Arxitektor Sardor</span>
                  <span className="text-[9px] text-gray-400 mt-0.5">Moviy Kiber Fasad</span>
                </button>

                <button
                  onClick={() => handleAgentAutoDesign('laylo')}
                  className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/40 hover:bg-purple-500/20 text-purple-300 flex flex-col items-center text-center transition"
                  title="Laylo: Barcha binolarga Qirol Binafshasi estetikasi berish"
                >
                  <span className="font-bold text-[11px]">Dizayner Laylo</span>
                  <span className="text-[9px] text-gray-400 mt-0.5">Binafsha Estetika</span>
                </button>
              </div>

              {/* Usta Rustam territory progress info */}
              <div className="pt-2 border-t border-gray-800/80 text-[11px] text-gray-400">
                <div className="flex justify-between font-mono mb-1 text-[10px]">
                  <span>Usta Rustam: Keyingi Kengaytirish</span>
                  <span className="text-cyan-400">{expansionStatus.progressPercent}%</span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full transition-all duration-300"
                    style={{ width: `${expansionStatus.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BINO TAFSILOTLARI VA INSTAGRAM NIKINI BIRIKTIRISH MODAL / POPOVER */}
        {inspectCell && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0e1322] border border-cyan-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-scaleUp">
              <button
                onClick={() => setInspectCell(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white bg-gray-900/60"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  {inspectCell.type === 'residential_simple' ? (
                    <Home className="w-6 h-6" />
                  ) : inspectCell.type === 'business' ? (
                    <Building2 className="w-6 h-6" />
                  ) : inspectCell.type === 'skyscraper' ? (
                    <Building className="w-6 h-6" />
                  ) : (
                    <Sparkles className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white font-['Space_Grotesk']">{inspectCell.name}</h4>
                  <p className="text-xs text-cyan-400 font-mono">
                    Koordinata: ({inspectCell.x}, {inspectCell.y})
                  </p>
                </div>
              </div>

              {/* Instagram handle binding */}
              <div className="mb-4 p-3.5 rounded-xl bg-gray-900/70 border border-pink-500/30">
                <label className="block text-xs font-mono text-pink-300 uppercase mb-1.5 flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-pink-400" />
                  Instagram Nikini Biriktirish
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editInstagramInput}
                    onChange={(e) => setEditInstagramInput(e.target.value)}
                    placeholder="@sizning_nikingiz"
                    className="flex-1 bg-black/60 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                  <button
                    onClick={handleSaveInstagram}
                    className="px-3 py-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Saqlash
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Ushbu bino egasiga Instagram profilini bog'lang. Shahar xaritasida ko'rinadi!
                </p>
              </div>

              {/* Color alteration */}
              {['residential_simple', 'business', 'skyscraper'].includes(inspectCell.type) && (
                <div className="mb-4">
                  <label className="block text-xs font-mono text-cyan-300 uppercase mb-1.5">
                    Fasad Rangini O'zgartirish:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
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
                        }}
                        className={`px-2 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 justify-center ${
                          inspectCell.colorId === c.id
                            ? 'border-white bg-white/10 text-white font-bold'
                            : 'border-gray-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.hex }} />
                        <span className="truncate">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Demolish button inside modal */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-800">
                <button
                  onClick={() => {
                    const key = `${inspectCell.x},${inspectCell.y}`;
                    sound.playDemolish();
                    const next = new Map(cells);
                    next.delete(key);
                    setCells(next);
                    setInspectCell(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900/60 text-xs font-medium flex items-center gap-1.5"
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
