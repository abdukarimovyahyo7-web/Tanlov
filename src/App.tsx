import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { FeaturesSection } from './components/FeaturesSection.tsx';
import { CityBuilder } from './components/CityBuilder.tsx';
import { MayorDashboard } from './components/MayorDashboard.tsx';
import { GallerySection } from './components/GallerySection.tsx';
import { Footer } from './components/Footer.tsx';
import { ContactModal } from './components/ContactModal.tsx';
import { DownloadModal } from './components/DownloadModal.tsx';
import { sound } from './utils/audio.ts';
import { GridCell } from './types/game.ts';
import {
  loadGameFromStorage,
  saveGameToStorage,
  clearGameStorage,
  getDefaultInitialCells,
  getDefaultInitialCitizens,
  SavedGameState,
  SavedActionLog,
  SavedCitizen,
} from './utils/storage.ts';
import { calculateIncomePerSecond } from './game/rules.ts';

export default function App() {
  // Load saved state or use initial fallbacks
  const [initialData] = useState(() => loadGameFromStorage());

  const [cells, setCells] = useState<Map<string, GridCell>>(() => {
    if (initialData?.cells && Array.isArray(initialData.cells)) {
      return new Map(initialData.cells);
    }
    return getDefaultInitialCells();
  });

  const [budget, setBudget] = useState<number>(() => initialData?.budget ?? 150);
  const [population, setPopulation] = useState<number>(() => initialData?.population ?? 45);
  const [happiness, setHappiness] = useState<number>(() => initialData?.happiness ?? 88);
  const [gridSize, setGridSize] = useState<number>(() => initialData?.gridSize ?? 10);
  const [taxRate, setTaxRate] = useState<number>(() => initialData?.taxRate ?? 8);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>(() => initialData?.timeOfDay ?? 'night');
  const [isHokimGodMode, setIsHokimGodMode] = useState<boolean>(() => initialData?.isHokimGodMode ?? false);
  const [gameSpeed, setGameSpeed] = useState<number>(() => initialData?.gameSpeed ?? 1);
  const [isometric3D, setIsometric3D] = useState<boolean>(() => initialData?.isometric3D ?? true);

  const [citizens, setCitizens] = useState<SavedCitizen[]>(() => {
    if (initialData?.citizens && Array.isArray(initialData.citizens) && initialData.citizens.length > 0) {
      return initialData.citizens;
    }
    return getDefaultInitialCitizens();
  });

  const [actionLog, setActionLog] = useState<SavedActionLog[]>(() => {
    if (initialData?.actionLog && Array.isArray(initialData.actionLog) && initialData.actionLog.length > 0) {
      return initialData.actionLog;
    }
    return [
      {
        id: 'init_1',
        timestamp: Date.now(),
        text: "Tanlov Mahallasi shaharsozlik tizimi ishga tushirildi. Harakatlar har soniya saqlanmoqda.",
        type: 'system',
      },
    ];
  });

  const [lastSavedText, setLastSavedText] = useState<string>(() => {
    return new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState<boolean>(false);

  // Keep a reference to current state to prevent stale closures in the 1-second auto-save interval
  const stateRef = useRef({
    cells,
    budget,
    population,
    happiness,
    gridSize,
    taxRate,
    timeOfDay,
    isHokimGodMode,
    gameSpeed,
    isometric3D,
    citizens,
    actionLog,
  });

  useEffect(() => {
    stateRef.current = {
      cells,
      budget,
      population,
      happiness,
      gridSize,
      taxRate,
      timeOfDay,
      isHokimGodMode,
      gameSpeed,
      isometric3D,
      citizens,
      actionLog,
    };
  }, [
    cells,
    budget,
    population,
    happiness,
    gridSize,
    taxRate,
    timeOfDay,
    isHokimGodMode,
    gameSpeed,
    isometric3D,
    citizens,
    actionLog,
  ]);

  // Immediate save helper called after any user action
  const triggerSaveNow = (override?: Partial<SavedGameState>) => {
    const cur = stateRef.current;
    const snapshot: SavedGameState = {
      version: 1,
      timestamp: Date.now(),
      lastSavedTimestamp: Date.now(),
      cells: override?.cells ?? Array.from(cur.cells.entries()),
      budget: override?.budget ?? cur.budget,
      population: override?.population ?? cur.population,
      happiness: override?.happiness ?? cur.happiness,
      gridSize: override?.gridSize ?? cur.gridSize,
      taxRate: override?.taxRate ?? cur.taxRate,
      timeOfDay: override?.timeOfDay ?? cur.timeOfDay,
      isHokimGodMode: override?.isHokimGodMode ?? cur.isHokimGodMode,
      gameSpeed: override?.gameSpeed ?? cur.gameSpeed,
      isometric3D: override?.isometric3D ?? cur.isometric3D,
      citizens: override?.citizens ?? cur.citizens,
      actionLog: override?.actionLog ?? cur.actionLog,
    };
    saveGameToStorage(snapshot);
    setLastSavedText(new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  // Action logger helper
  const handleLogAction = (text: string, type: SavedActionLog['type'] = 'system') => {
    const newEntry: SavedActionLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      text,
      type,
    };
    setActionLog(prev => {
      const updated = [newEntry, ...prev].slice(0, 50);
      triggerSaveNow({ actionLog: updated });
      return updated;
    });
  };

  // Every single second (1000ms): auto-save game state to localStorage & calculate city income tick
  useEffect(() => {
    const timer = setInterval(() => {
      const cur = stateRef.current;

      let nextBudget = cur.budget;
      if (cur.gameSpeed > 0) {
        let businesses = 0;
        cur.cells.forEach(c => {
          if (c.type === 'business') businesses++;
        });
        const income = calculateIncomePerSecond(businesses, cur.population, cur.taxRate, cur.happiness);
        if (income > 0) {
          nextBudget = Math.round((cur.budget + income) * 10) / 10;
          setBudget(nextBudget);
        }
      }

      const snapshot: SavedGameState = {
        version: 1,
        timestamp: Date.now(),
        lastSavedTimestamp: Date.now(),
        cells: Array.from(cur.cells.entries()),
        budget: nextBudget,
        population: cur.population,
        happiness: cur.happiness,
        gridSize: cur.gridSize,
        taxRate: cur.taxRate,
        timeOfDay: cur.timeOfDay,
        isHokimGodMode: cur.isHokimGodMode,
        gameSpeed: cur.gameSpeed,
        isometric3D: cur.isometric3D,
        citizens: cur.citizens,
        actionLog: cur.actionLog,
      };

      saveGameToStorage(snapshot);
      setLastSavedText(new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleToggleSound = () => {
    sound.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  const handleToggleHokimGodMode = () => {
    setIsHokimGodMode(prev => {
      const next = !prev;
      handleLogAction(
        next ? "Hokim God-Mode (Barcha imtiyozlar va cheksiz byudjet) yoqildi" : "Hokim God-Mode o'chirildi",
        'decree'
      );
      triggerSaveNow({ isHokimGodMode: next });
      return next;
    });
  };

  // Mayor dashboard action handlers
  const handleInjectFunds = (amount: number) => {
    sound.playCash();
    setBudget(prev => {
      const next = prev + amount;
      handleLogAction(`Hokim shahar g'aznasiga $${amount} investitsiya kiritdi`, 'fund');
      triggerSaveNow({ budget: next });
      return next;
    });
  };

  const handleTriggerFestival = () => {
    sound.playExpansion();
    setHappiness(100);
    handleLogAction("Hokim farmoyishi: Shahar kiber-festivali e'lon qilindi! Aholi kayfiyati 100%!", 'decree');
    triggerSaveNow({ happiness: 100 });
  };

  const handleExpandTerritory = () => {
    sound.playExpansion();
    const nextSizes: { [key: number]: number } = { 8: 10, 10: 12, 12: 14, 14: 16 };
    const target = nextSizes[gridSize] || gridSize;
    setGridSize(target);
    handleLogAction(`Hokim farmoyishi: Shahar chegarasi ${target}x${target} ga kengaytirildi!`, 'expand');
    triggerSaveNow({ gridSize: target });
  };

  const handleTaxRateChange = (rate: number) => {
    setTaxRate(rate);
    handleLogAction(`Soliq stavkasi o'zgartirildi: ${rate}%`, 'system');
    triggerSaveNow({ taxRate: rate });
  };

  const handleAddCitizen = (newCit: SavedCitizen) => {
    setCitizens(prev => {
      const updated = [newCit, ...prev];
      const handle = newCit.nick || newCit.instagram || '@fuqaro';
      handleLogAction(`Yangi fuqaro ro'yxatdan o'tdi: ${newCit.name} (${handle})`, 'instagram');
      triggerSaveNow({ citizens: updated });
      return updated;
    });
  };

  const handleResetCity = () => {
    if (window.confirm("Barcha shahar ma'lumotlari tozalansinmi va o'yin noldan boshlansinmi?")) {
      clearGameStorage();
      const initCells = getDefaultInitialCells();
      const initCitizens = getDefaultInitialCitizens();
      setCells(initCells);
      setBudget(150);
      setPopulation(45);
      setHappiness(88);
      setGridSize(10);
      setTaxRate(8);
      setTimeOfDay('night');
      setIsHokimGodMode(false);
      setGameSpeed(1);
      setIsometric3D(true);
      setCitizens(initCitizens);
      const resetLogs: SavedActionLog[] = [
        {
          id: `log_${Date.now()}`,
          timestamp: Date.now(),
          text: "Shahar noldan qayta boshlandi. Barcha harakatlar har soniya saqlanmoqda.",
          type: 'system',
        },
      ];
      setActionLog(resetLogs);
      setLastSavedText(new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
  };

  const scrollToGame = () => {
    const el = document.getElementById('game-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToDashboard = () => {
    const el = document.getElementById('dashboard-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#070913] text-gray-100 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-cyan-500 selection:text-black">
      {/* Navigation */}
      <Navbar
        isHokimGodMode={isHokimGodMode}
        onToggleHokimGodMode={handleToggleHokimGodMode}
        onOpenContact={() => setIsContactOpen(true)}
        onScrollToGame={scrollToGame}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenDownload={() => setIsDownloadOpen(true)}
        lastSavedText={lastSavedText}
      />

      <main className="flex-1">
        {/* 1. Bosh Sahifa (Hero Section) */}
        <HeroSection
          onPlayClick={scrollToGame}
          onDownloadClick={() => setIsDownloadOpen(true)}
        />

        {/* 2. Xususiyatlar (Features Section: Uylar, Aholi, Instagram Niklari, 4 AI Agent) */}
        <FeaturesSection onScrollToGame={scrollToGame} />

        {/* Interaktiv Shahar Qurish O'yini Prototipi */}
        <CityBuilder
          isHokimGodMode={isHokimGodMode}
          onToggleHokimGodMode={handleToggleHokimGodMode}
          onOpenMayorDashboard={scrollToDashboard}
          cells={cells}
          setCells={setCells}
          budget={budget}
          setBudget={setBudget}
          population={population}
          setPopulation={setPopulation}
          happiness={happiness}
          setHappiness={setHappiness}
          gridSize={gridSize}
          setGridSize={setGridSize}
          taxRate={taxRate}
          setTaxRate={setTaxRate}
          timeOfDay={timeOfDay}
          setTimeOfDay={setTimeOfDay}
          gameSpeed={gameSpeed}
          setGameSpeed={setGameSpeed}
          isometric3D={isometric3D}
          setIsometric3D={setIsometric3D}
          lastSavedText={lastSavedText}
          triggerSaveNow={triggerSaveNow}
          onResetCity={handleResetCity}
          onLogAction={handleLogAction}
        />

        {/* Hokimiyat Tizimli Nazorat Paneli (4 AI Agent, KPI, Farmoyishlar, Instagram Fuqarolari, Tarix) */}
        <MayorDashboard
          isHokimGodMode={isHokimGodMode}
          onToggleHokimGodMode={handleToggleHokimGodMode}
          onInjectFunds={handleInjectFunds}
          onTriggerFestival={handleTriggerFestival}
          onExpandTerritory={handleExpandTerritory}
          citizens={citizens}
          onAddCitizen={handleAddCitizen}
          taxRate={taxRate}
          onTaxRateChange={handleTaxRateChange}
          actionLog={actionLog}
          lastSavedText={lastSavedText}
          onLogAction={handleLogAction}
        />

        {/* 3. O'yin Galereyasi (3D Skyscraper & Cyber Visuals) */}
        <GallerySection />
      </main>

      {/* 4. Aloqa va Ijtimoiy Tarmoqlar (Footer: ONLY Instagram, tanlovmahallasi@gmail.com) */}
      <Footer
        onOpenContact={() => setIsContactOpen(true)}
        onScrollToGame={scrollToGame}
      />

      {/* Modals */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      <DownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
        onPlayInBrowser={scrollToGame}
      />
    </div>
  );
}
