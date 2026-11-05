/**
 * Pure game rules and calculation helpers for Tanlov Mahallasi City Builder
 */

export type BuildingType = 'residential_simple' | 'business' | 'skyscraper' | 'road' | 'tree' | 'park';

export type SkyscraperFloors = 1 | 20 | 100;

export interface BuildingColorOption {
  id: string;
  name: string;
  hex: string;
  price: number; // $10 - $30
  accentHex: string;
}

export const BUILDING_COLORS: BuildingColorOption[] = [
  { id: 'neon_cyan', name: 'Kiber Moviy', hex: '#00f0ff', price: 15, accentHex: '#0077ff' },
  { id: 'royal_purple', name: 'Qirol Binafshasi', hex: '#b026ff', price: 20, accentHex: '#7928ca' },
  { id: 'solar_gold', name: 'Quyosh Oltini', hex: '#ffb703', price: 25, accentHex: '#fb8500' },
  { id: 'emerald_eco', name: 'Zumrad Eko', hex: '#10b981', price: 10, accentHex: '#059669' },
  { id: 'imperial_white', name: 'Oq Neoklassika', hex: '#f8fafc', price: 30, accentHex: '#94a3b8' },
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
 * - Daraxt: $10
 * - Yo'l: $5
 * - Park: $25
 * Plus color cost ($10-$30) if applicable.
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

  // Add color cost if chosen and item is a building
  if (['residential_simple', 'business', 'skyscraper'].includes(params.type) && params.colorId) {
    const color = BUILDING_COLORS.find(c => c.id === params.colorId);
    if (color) {
      base += color.price;
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
      return 14; // Workers & residents
    case 'skyscraper':
      if (floors === 100) return 1000;
      if (floors === 20) return 150;
      return 15;
    case 'park':
      return 2; // Attracts tourists/visitors
    default:
      return 0;
  }
}

/**
 * Calculates income generated per second based on businesses, population and tax rate
 */
export function calculateIncomePerSecond(
  businessCount: number,
  population: number,
  taxRatePercent: number = 10,
  happinessPercent: number = 90
): number {
  const businessRevenue = businessCount * 3.5;
  const residentTaxes = (population * 0.15) * (taxRatePercent / 10);
  const happinessMultiplier = Math.max(0.4, happinessPercent / 100);
  return Math.round((businessRevenue + residentTaxes) * happinessMultiplier * 10) / 10;
}

/**
 * Checks whether Usta Rustam should expand the territory.
 * Standard sizes: 8x8 (default), 10x10, 12x12, 14x14
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
  ];

  const currentTierIndex = tiers.findIndex(t => t.size === currentGridSize);
  if (currentTierIndex === -1 || currentTierIndex >= tiers.length - 1) {
    return {
      canExpand: false,
      nextSize: currentGridSize,
      threshold: 9999,
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
