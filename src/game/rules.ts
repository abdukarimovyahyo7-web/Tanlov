/**
 * Pure game rules and calculation helpers for Tanlov Mahallasi 3D City Builder v1.2
 */

export type BuildingType =
  | 'residential_simple'
  | 'business'
  | 'skyscraper'
  | 'burj_khalifa'
  | 'cyber_villa'
  | 'megamall'
  | 'spaceport'
  | 'road'
  | 'tree'
  | 'park';

export type SkyscraperFloors = 1 | 20 | 100;

export interface BuildingColorOption {
  id: string;
  name: string;
  hex: string;
  price: number; // Oltin rang eng qimmati: $999.9, boshqa yangi ranglar $100 atrofida
  accentHex: string;
  isVip?: boolean;
}

export const BUILDING_COLORS: BuildingColorOption[] = [
  // 0. Standart bepul rang ($0 - Asosiy bino narxi ichida)
  {
    id: 'standard_cyan',
    name: 'Standart Moviy Kiber',
    hex: '#00f0ff',
    price: 0,
    accentHex: '#0284c7',
  },
  // 1. Eng qimmat Oltin rang ($999.9)
  {
    id: 'gold_24k',
    name: '24K Sof Oltin (VIP)',
    hex: '#ffd700',
    price: 999.9,
    accentHex: '#ffaa00',
    isVip: true,
  },
  // 2. Yangi ranglar ($100 atrofida)
  {
    id: 'diamond_white',
    name: 'Titanium Olmos Oq',
    hex: '#ffffff',
    price: 110,
    accentHex: '#cbd5e1',
  },
  {
    id: 'plasma_ruby',
    name: 'Plazma Qizil Rubidiy',
    hex: '#ff0055',
    price: 105,
    accentHex: '#ff3377',
  },
  {
    id: 'midnight_black',
    name: 'Obsidian Qora Metall',
    hex: '#1e293b',
    price: 100,
    accentHex: '#0f172a',
  },
  {
    id: 'galaxy_purple',
    name: 'Galaktika Qirol Binafshasi',
    hex: '#a855f7',
    price: 99,
    accentHex: '#7e22ce',
  },
  {
    id: 'emerald_cyber',
    name: 'Zumrad Kiber Neon',
    hex: '#10b981',
    price: 95,
    accentHex: '#059669',
  },
  {
    id: 'krypton_cyan',
    name: 'Kripton Lazer Moviy',
    hex: '#00f0ff',
    price: 90,
    accentHex: '#0284c7',
  },
  // 3. Klassik boshlang'ich ranglar ($10 - $25)
  {
    id: 'classic_cyan',
    name: 'Klassik Moviy',
    hex: '#38bdf8',
    price: 15,
    accentHex: '#0284c7',
  },
  {
    id: 'classic_purple',
    name: 'Klassik Binafsha',
    hex: '#c084fc',
    price: 20,
    accentHex: '#9333ea',
  },
];

export interface BuildingCostParams {
  type: BuildingType;
  floors?: SkyscraperFloors;
  colorId?: string;
  isHokimGodMode?: boolean;
}

/**
 * Calculates building base cost:
 * - Oddiy uy: $30
 * - Biznes uchun uy: $60
 * - Osmono'par bino: 1 qavat = $20, 20 qavat = $120, 100 qavat = $200
 * - BURJ KHALIFA: $2,000,000,000 ($2B wow!)
 * - Kiber Villa: $500
 * - Savdo Majmuasi (Megamall): $1,500
 * - Kosmodrom: $5,000
 * - Daraxt: $10
 * - Yo'l: $5
 * - Park: $25
 * Plus color cost (Oltin $999.9, boshqalar ~$100) if applicable.
 * If Hokim God Mode is enabled, cost is $0.
 */
export function calculateBuildingCost(params: BuildingCostParams): number {
  if (params.isHokimGodMode) return 0;

  let base = 0;
  switch (params.type) {
    case 'residential_simple':
      base = 30;
      break;
    case 'business':
      base = 60;
      break;
    case 'skyscraper':
      if (params.floors === 100) base = 200;
      else if (params.floors === 20) base = 120;
      else base = 20; // 1 floor
      break;
    case 'burj_khalifa':
      base = 1; // Exactly $1 as requested: Burj Khalifa eng baland bino, narxi $1!
      break;
    case 'cyber_villa':
      base = 500;
      break;
    case 'megamall':
      base = 1500;
      break;
    case 'spaceport':
      base = 5000;
      break;
    case 'tree':
      base = 10;
      break;
    case 'road':
      base = 5;
      break;
    case 'park':
      base = 25;
      break;
    default:
      base = 0;
  }

  // Add color cost if chosen and item is a building structure
  const coloredBuildings: BuildingType[] = [
    'residential_simple',
    'business',
    'skyscraper',
    'burj_khalifa',
    'cyber_villa',
    'megamall',
    'spaceport',
  ];

  if (coloredBuildings.includes(params.type) && params.colorId) {
    const color = BUILDING_COLORS.find(c => c.id === params.colorId);
    if (color) {
      base = Math.round((base + color.price) * 10) / 10;
    }
  }

  return base;
}

/**
 * Calculates population added by a building
 */
export function calculatePopulationIncrease(type: BuildingType, floors: SkyscraperFloors = 1): number {
  switch (type) {
    case 'residential_simple':
      return 6;
    case 'business':
      return 14;
    case 'skyscraper':
      if (floors === 100) return 1000;
      if (floors === 20) return 150;
      return 15;
    case 'burj_khalifa':
      return 50000; // Megatower brings huge population
    case 'cyber_villa':
      return 25;
    case 'megamall':
      return 200;
    case 'spaceport':
      return 150;
    case 'park':
      return 5;
    default:
      return 0;
  }
}

/**
 * Calculates income generated per second based on businesses, megamalls, population and tax rate
 */
export function calculateIncomePerSecond(
  businessCount: number,
  population: number,
  taxRatePercent: number = 10,
  happinessPercent: number = 90,
  hasBurjKhalifa: boolean = false
): number {
  const businessRevenue = businessCount * 4.5;
  const residentTaxes = (population * 0.18) * (taxRatePercent / 10);
  const burjBonus = hasBurjKhalifa ? 25000 : 0; // Huge tourism revenue for Burj Khalifa
  const happinessMultiplier = Math.max(0.4, happinessPercent / 100);
  return Math.round((businessRevenue + residentTaxes + burjBonus) * happinessMultiplier * 10) / 10;
}

/**
 * Checks whether Usta Rustam should expand the territory.
 * Standard sizes: 8x8 (default), 10x10, 12x12, 14x14, 16x16
 */
export function getUstaExpansionStatus(currentPopulation: number, currentGridSize: number): {
  canExpand: boolean;
  nextSize: number;
  threshold: number;
  progressPercent: number;
} {
  const tiers = [
    { size: 8, threshold: 0 },
    { size: 10, threshold: 40 },
    { size: 12, threshold: 180 },
    { size: 14, threshold: 500 },
    { size: 16, threshold: 1500 },
  ];

  const currentTierIndex = tiers.findIndex(t => t.size === currentGridSize);
  if (currentTierIndex === -1 || currentTierIndex >= tiers.length - 1) {
    return {
      canExpand: false,
      nextSize: currentGridSize,
      threshold: 99999,
      progressPercent: 100,
    };
  }

  const nextTier = tiers[currentTierIndex + 1];
  const prevThreshold = tiers[currentTierIndex].threshold;
  const needed = nextTier.threshold - prevThreshold;
  const currentProgress = Math.max(0, currentPopulation - prevThreshold);
  const progressPercent = Math.min(100, Math.round((currentProgress / needed) * 100));

  return {
    canExpand: currentPopulation >= nextTier.threshold,
    nextSize: nextTier.size,
    threshold: nextTier.threshold,
    progressPercent,
  };
}

/**
 * Checks if Hokim or player has sufficient funds
 */
export function canAfford(budget: number, cost: number, isHokimGodMode: boolean = false): boolean {
  if (isHokimGodMode) return true;
  return budget >= cost;
}
