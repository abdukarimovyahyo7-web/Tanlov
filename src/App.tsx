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
import { PhoneWidgetsModal } from './components/PhoneWidgetsModal.tsx';
import { OfflineIndicator } from './components/OfflineIndicator.tsx';
import { UzbekistanElectionModal } from './components/UzbekistanElectionModal.tsx';
import { GitHubModal } from './components/GitHubModal.tsx';
import { sound } from './utils/audio.ts';
import { GridCell } from './types/game.ts';
import { NationalJob, INITIAL_NATIONAL_JOBS, calculateJobsIncomePerSecond } from './game/jobs.ts';
import {
  loadGameFromStorage,
  saveGameToStorage,
  clearGameStorage,
  getDefaultInitialCells,
  getDefaultInitialCitizens,
  SavedGameState,
  SavedActionLog,
  SavedCitizen,
  SavedDistrictData,
} from './utils/storage.ts';
import { calculateIncomePerSecond } from './game/rules.ts';
import { findDistrictById, DEFAULT_DISTRICT_ID, UZBEKISTAN_REGIONS } from './data/uzbekistanRegions.ts';
import { DistrictElectionState, Candidate, initializeDistrictElection } from './types/election.ts';

export default function App() {
  // Load saved state or use initial fallbacks
  const [initialData] = useState(() => loadGameFromStorage());

  // Current selected district in Uzbekistan (Google Maps official naming)
  const [currentDistrictId, setCurrentDistrictId] = useState<string>(
    () => initialData?.currentDistrictId ?? DEFAULT_DISTRICT_ID
  );

  // Player Instagram Handle & Presidential Status
  const [playerInstagram, setPlayerInstagram] = useState<string>(
    () => initialData?.playerInstagram ?? '@prezident_uzb'
  );
  const [isPrezident, setIsPrezident] = useState<boolean>(
    () => initialData?.isPrezident ?? true
  );

  // Multi-District saved states
  const [districtsData, setDistrictsData] = useState<Record<string, SavedDistrictData>>(
    () => initialData?.districtsData ?? {}
  );

  // District Elections state
  const [districtElections, setDistrictElections] = useState<Record<string, DistrictElectionState>>(() => {
    if (initialData?.districtElections && typeof initialData.districtElections === 'object') {
      return initialData.districtElections;
    }
    const initialElections: Record<string, DistrictElectionState> = {};
    initialElections[DEFAULT_DISTRICT_ID] = initializeDistrictElection(DEFAULT_DISTRICT_ID, 'Chilonzor tumani');
    return initialElections;
  });

  const [isElectionModalOpen, setIsElectionModalOpen] = useState<boolean>(false);
  const [isGitHubOpen, setIsGitHubOpen] = useState<boolean>(false);

  // National Jobs & Industries State (v1.2)
  const [nationalJobs, setNationalJobs] = useState<NationalJob[]>(
    () => initialData?.nationalJobs ?? INITIAL_NATIONAL_JOBS
  );

  const [cells, setCells] = useState<Map<string, GridCell>>(() => {
    if (initialData?.cells && Array.isArray(initialData.cells)) {
      return new Map(initialData.cells);
    }
    return getDefaultInitialCells();
  });

  const [budget, setBudget] = useState<number>(() => Math.max(initialData?.budget ?? 500, 500));
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
        text: "Tanlov Mahallasi v1.2 3D Next-Gen tizimi ishga tushirildi. Harakatlar har soniya saqlanmoqda.",
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
  const [isPhoneWidgetsOpen, setIsPhoneWidgetsOpen] = useState<boolean>(false);

  // Check if Burj Khalifa exists in the city
  const hasBurjKhalifa = Array.from(cells.values()).some(c => c.type === 'burj_khalifa');

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
    currentDistrictId,
    playerInstagram,
    isPrezident,
    districtsData,
    districtElections,
    nationalJobs,
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
      currentDistrictId,
      playerInstagram,
      isPrezident,
      districtsData,
      districtElections,
      nationalJobs,
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
    currentDistrictId,
    playerInstagram,
    isPrezident,
    districtsData,
    districtElections,
    nationalJobs,
  ]);

  // Immediate save helper called after any user action
  const triggerSaveNow = (override?: Partial<SavedGameState>) => {
    const cur = stateRef.current;
    const snapshot: SavedGameState = {
      version: 1,
      timestamp: Date.now(),
      lastSavedTimestamp: Date.now(),
      currentDistrictId: override?.currentDistrictId ?? cur.currentDistrictId,
      playerInstagram: override?.playerInstagram ?? cur.playerInstagram,
      isPrezident: override?.isPrezident ?? cur.isPrezident,
      districtsData: override?.districtsData ?? cur.districtsData,
      districtElections: override?.districtElections ?? cur.districtElections,
      nationalJobs: override?.nationalJobs ?? cur.nationalJobs,
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
        let burjPresent = false;
        cur.cells.forEach(c => {
          if (c.type === 'business' || c.type === 'megamall') businesses++;
          if (c.type === 'burj_khalifa') burjPresent = true;
        });
        const income = calculateIncomePerSecond(businesses, cur.population, cur.taxRate, cur.happiness, burjPresent);
        const jobsIncome = cur.nationalJobs ? calculateJobsIncomePerSecond(cur.nationalJobs) : 0;
        const totalIncome = income + jobsIncome;
        if (totalIncome > 0) {
          nextBudget = Math.round((cur.budget + totalIncome) * 10) / 10;
          setBudget(nextBudget);
        }
      }

      const snapshot: SavedGameState = {
        version: 1,
        timestamp: Date.now(),
        lastSavedTimestamp: Date.now(),
        currentDistrictId: cur.currentDistrictId,
        playerInstagram: cur.playerInstagram,
        isPrezident: cur.isPrezident,
        districtsData: cur.districtsData,
        districtElections: cur.districtElections,
        nationalJobs: cur.nationalJobs,
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

  // District Switching Handler (preserves each district's unique city build)
  const handleSelectDistrict = (districtId: string) => {
    sound.playExpansion();
    const curDistrictInfo = findDistrictById(districtId);
    const districtName = curDistrictInfo?.name || districtId;

    // 1. Snapshot current active district
    const curSnapshot: SavedDistrictData = {
      cells: Array.from(cells.entries()),
      population,
      budget,
      happiness,
      gridSize,
    };
    const nextDistrictsData = {
      ...districtsData,
      [currentDistrictId]: curSnapshot,
    };
    setDistrictsData(nextDistrictsData);

    // 2. Load target district or create fresh layout
    const targetData = nextDistrictsData[districtId];
    if (targetData && Array.isArray(targetData.cells) && targetData.cells.length > 0) {
      setCells(new Map(targetData.cells));
      setPopulation(targetData.population);
      setBudget(targetData.budget);
      setHappiness(targetData.happiness);
      setGridSize(targetData.gridSize);
    } else {
      const freshCells = getDefaultInitialCells();
      setCells(freshCells);
      setPopulation(50);
      setBudget(300);
      setHappiness(92);
      setGridSize(10);
    }

    // 3. Initialize district election if not yet present
    let nextElections = { ...districtElections };
    if (!nextElections[districtId]) {
      nextElections[districtId] = initializeDistrictElection(districtId, districtName);
      setDistrictElections(nextElections);
    }

    setCurrentDistrictId(districtId);
    handleLogAction(`O'zbekiston xaritasi: ${districtName} hududiga o'tildi.`, 'system');

    triggerSaveNow({
      currentDistrictId: districtId,
      districtsData: nextDistrictsData,
      districtElections: nextElections,
    });
  };

  // Voting Handler
  const handleVote = (candidateId: string, role: 'hokim' | 'yordamchi') => {
    sound.playCash();
    const curElec = districtElections[currentDistrictId] || initializeDistrictElection(currentDistrictId);
    const nick = (playerInstagram || '@fuqaro').trim().toLowerCase();

    if (curElec.votedInstagrams.some(v => v.trim().toLowerCase() === nick)) {
      alert("Siz ushbu saylov davrida allaqachon ovoz bergansiz!");
      return;
    }

    let updatedCandName = '';
    const updatedHokimCand = curElec.hokimCandidates.map(c => {
      if (c.id === candidateId) {
        updatedCandName = c.name;
        return { ...c, votes: c.votes + 1 };
      }
      return c;
    });

    const updatedYordamchiCand = curElec.yordamchiCandidates.map(c => {
      if (c.id === candidateId) {
        updatedCandName = c.name;
        return { ...c, votes: c.votes + 1 };
      }
      return c;
    });

    // Check if leader changed
    const topHokim = [...updatedHokimCand].sort((a, b) => b.votes - a.votes)[0];
    const topYordamchi = [...updatedYordamchiCand].sort((a, b) => b.votes - a.votes)[0];

    const updatedState: DistrictElectionState = {
      ...curElec,
      hokimCandidates: updatedHokimCand,
      yordamchiCandidates: updatedYordamchiCand,
      hokim: topHokim
        ? {
            name: topHokim.name,
            instagram: topHokim.instagram,
            votes: topHokim.votes,
            electedTimestamp: curElec.hokim.electedTimestamp,
            role: 'hokim',
          }
        : curElec.hokim,
      yordamchi: topYordamchi
        ? {
            name: topYordamchi.name,
            instagram: topYordamchi.instagram,
            votes: topYordamchi.votes,
            electedTimestamp: curElec.yordamchi.electedTimestamp,
            role: 'yordamchi',
          }
        : curElec.yordamchi,
      votedInstagrams: [...curElec.votedInstagrams, nick],
    };

    const nextElections = {
      ...districtElections,
      [currentDistrictId]: updatedState,
    };
    setDistrictElections(nextElections);

    handleLogAction(`Ovoz berildi: ${updatedCandName} ga 1 ta ovoz qo'shildi (${playerInstagram})`, 'system');
    triggerSaveNow({ districtElections: nextElections });
  };

  // Candidate Registration Handler
  const handleRegisterCandidate = (newCandData: Omit<Candidate, 'id' | 'votes'>) => {
    sound.playExpansion();
    const curElec = districtElections[currentDistrictId] || initializeDistrictElection(currentDistrictId);
    const newCand: Candidate = {
      ...newCandData,
      id: `cand_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      votes: 1, // Candidate starts with 1 vote (self-vote)
    };

    const nextHokimCand = newCand.role === 'hokim' ? [newCand, ...curElec.hokimCandidates] : curElec.hokimCandidates;
    const nextYordamchiCand = newCand.role === 'yordamchi' ? [newCand, ...curElec.yordamchiCandidates] : curElec.yordamchiCandidates;

    const nextElecState: DistrictElectionState = {
      ...curElec,
      hokimCandidates: nextHokimCand,
      yordamchiCandidates: nextYordamchiCand,
    };

    const nextElections = {
      ...districtElections,
      [currentDistrictId]: nextElecState,
    };
    setDistrictElections(nextElections);

    handleLogAction(`Yangi nomzod ro'yxatdan o'tdi: ${newCand.name} (${newCand.instagram}) - ${newCand.role.toUpperCase()}`, 'system');
    triggerSaveNow({ districtElections: nextElections });
  };

  // Presidential Decrees Handler
  const handlePresidentialDecree = (decreeTitle: string, decreeType: string) => {
    sound.playExpansion();
    if (decreeType === 'funds') {
      setBudget(prev => prev + 500000);
    } else if (decreeType === 'holiday') {
      setHappiness(100);
    } else if (decreeType === 'tax') {
      setTaxRate(3);
    } else if (decreeType === 'election') {
      const curElec = districtElections[currentDistrictId] || initializeDistrictElection(currentDistrictId);
      const resetCycle: DistrictElectionState = {
        ...curElec,
        hokimCycleStart: Date.now(),
        yordamchiCycleStart: Date.now(),
        votedInstagrams: [],
      };
      setDistrictElections(prev => ({ ...prev, [currentDistrictId]: resetCycle }));
    }

    handleLogAction(decreeTitle, 'decree');
    triggerSaveNow();
  };

  const handleUpdatePlayerInstagram = (nick: string) => {
    setPlayerInstagram(nick);
    handleLogAction(`Foydalanuvchi Instagram profili yangilandi: ${nick}`, 'instagram');
    triggerSaveNow({ playerInstagram: nick });
  };

  const handleTogglePrezident = (val: boolean) => {
    setIsPrezident(val);
    handleLogAction(val ? "Prezidentlik (Oliy Rahbar) maqomi faollashtirildi" : "Oddiy fuqaro rejimiga o'tildi", 'decree');
    triggerSaveNow({ isPrezident: val });
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

  // District metadata helpers
  const currentDistrictInfo = findDistrictById(currentDistrictId);
  const currentRegionInfo = UZBEKISTAN_REGIONS.find(r => r.id === currentDistrictInfo?.regionId);
  const currentDistrictName = currentDistrictInfo?.name || 'Chilonzor tumani';
  const currentRegionName = currentRegionInfo?.name || 'Toshkent shahri';
  const activeElectionState = districtElections[currentDistrictId] || initializeDistrictElection(currentDistrictId, currentDistrictName);

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
        onOpenPhoneWidgets={() => setIsPhoneWidgetsOpen(true)}
        onOpenElectionModal={() => setIsElectionModalOpen(true)}
        onOpenGitHub={() => setIsGitHubOpen(true)}
        currentDistrictName={currentDistrictName}
        isPrezident={isPrezident}
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

        {/* Interaktiv 3D Shahar Qurish O'yini */}
        <CityBuilder
          isHokimGodMode={isHokimGodMode}
          onToggleHokimGodMode={handleToggleHokimGodMode}
          onOpenMayorDashboard={scrollToDashboard}
          onOpenPhoneWidgets={() => setIsPhoneWidgetsOpen(true)}
          currentDistrictId={currentDistrictId}
          currentDistrictName={currentDistrictName}
          currentRegionName={currentRegionName}
          playerInstagram={playerInstagram}
          isPrezident={isPrezident}
          onOpenElectionModal={() => setIsElectionModalOpen(true)}
          onSelectDistrict={handleSelectDistrict}
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

        {/* Prezidentlik Oliy Nazorat Paneli (v1.2) */}
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
          currentDistrictId={currentDistrictId}
          currentDistrictName={currentDistrictName}
          onSelectDistrict={handleSelectDistrict}
          isPrezident={isPrezident}
          population={population}
          budget={budget}
          nationalJobs={nationalJobs}
          onUpdateNationalJobs={(updated) => {
            setNationalJobs(updated);
            triggerSaveNow({ nationalJobs: updated });
          }}
          onOpenGitHubModal={() => setIsGitHubOpen(true)}
          onOpenElectionModal={() => setIsElectionModalOpen(true)}
        />

        {/* 3. O'yin Galereyasi (3D Skyscraper, Burj Khalifa & Cyber Visuals) */}
        <GallerySection />
      </main>

      {/* 4. Aloqa va Ijtimoiy Tarmoqlar (Footer: ONLY Instagram, tanlovmahallasi@gmail.com) */}
      <Footer
        onOpenContact={() => setIsContactOpen(true)}
        onScrollToGame={scrollToGame}
      />

      {/* Uzbekistan Election & President Center Modal */}
      <UzbekistanElectionModal
        isOpen={isElectionModalOpen}
        onClose={() => setIsElectionModalOpen(false)}
        currentDistrictId={currentDistrictId}
        onSelectDistrict={handleSelectDistrict}
        playerInstagram={playerInstagram}
        onUpdatePlayerInstagram={handleUpdatePlayerInstagram}
        isPrezident={isPrezident}
        onTogglePrezident={handleTogglePrezident}
        electionState={activeElectionState}
        onVote={handleVote}
        onRegisterCandidate={handleRegisterCandidate}
        onPresidentialDecree={handlePresidentialDecree}
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
        onOpenGitHub={() => setIsGitHubOpen(true)}
      />

      <GitHubModal
        isOpen={isGitHubOpen}
        onClose={() => setIsGitHubOpen(false)}
      />

      <PhoneWidgetsModal
        isOpen={isPhoneWidgetsOpen}
        onClose={() => setIsPhoneWidgetsOpen(false)}
        population={population}
        budget={budget}
        happiness={happiness}
        hasBurjKhalifa={hasBurjKhalifa}
        citizens={citizens}
        onInjectFunds={handleInjectFunds}
        onTriggerFestival={handleTriggerFestival}
      />

      {/* PWA Offline status indicator */}
      <OfflineIndicator />
    </div>
  );
}
