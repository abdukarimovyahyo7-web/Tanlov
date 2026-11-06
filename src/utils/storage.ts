import { GridCell } from '../types/game.ts';

export const STORAGE_KEY = 'tanlov_mahallasi_save_v2';

export interface SavedCitizen {
  id: string;
  name: string;
  nick: string;
  role: string;
  happiness: number;
  house: string;
  instagram?: string;
}

export interface SavedActionLog {
  id: string;
  text: string;
  timestamp: number;
  type: 'build' | 'demolish' | 'decree' | 'expand' | 'color' | 'instagram' | 'income' | 'system' | 'fund';
}

import { DistrictElectionState } from '../types/election.ts';
import { NationalJob } from '../game/jobs.ts';

export interface SavedDistrictData {
  cells: [string, GridCell][];
  population: number;
  budget: number;
  happiness: number;
  gridSize: number;
}

export interface SavedGameState {
  version: number;
  timestamp: number;
  lastSavedTimestamp?: number;
  currentDistrictId?: string;
  playerInstagram?: string;
  isPrezident?: boolean;
  districtsData?: Record<string, SavedDistrictData>;
  districtElections?: Record<string, DistrictElectionState>;
  nationalJobs?: NationalJob[];
  gridSize: number;
  budget: number;
  population: number;
  happiness: number;
  taxRate: number;
  timeOfDay: 'day' | 'sunset' | 'night';
  isHokimGodMode: boolean;
  gameSpeed: number;
  isometric3D: boolean;
  cells: [string, GridCell][];
  citizens: SavedCitizen[];
  actionLog: SavedActionLog[];
}

export function getDefaultInitialCells(): Map<string, GridCell> {
  const initial = new Map<string, GridCell>();
  initial.set('2,2', { x: 2, y: 2, type: 'road' });
  initial.set('2,3', { x: 2, y: 3, type: 'road' });
  initial.set('2,4', { x: 2, y: 4, type: 'road' });
  initial.set('3,3', {
    x: 3,
    y: 3,
    type: 'residential_simple',
    colorId: 'neon_cyan',
    name: 'Oddiy Uy',
    instagram: '@tanlovmahallasi',
    createdAt: Date.now(),
  });
  initial.set('1,3', {
    x: 1,
    y: 3,
    type: 'business',
    colorId: 'solar_gold',
    name: 'Kiber Kafe & Biznes',
    instagram: '@city_founder',
    createdAt: Date.now(),
  });
  initial.set('3,2', { x: 3, y: 2, type: 'tree', createdAt: Date.now() });
  initial.set('3,4', { x: 3, y: 4, type: 'park', colorId: 'emerald_eco', createdAt: Date.now() });
  return initial;
}

export function getDefaultInitialCitizens(): SavedCitizen[] {
  return [
    { id: '1', name: 'Islombek', nick: '@islom_cyber', role: 'Kiber Dasturchi', happiness: 98, house: 'Osmono\'par 100Q' },
    { id: '2', name: 'Madinabonu', nick: '@madina_toshkent', role: 'Arxitektura Talabasi', happiness: 95, house: 'Oddiy Uy 2-sektor' },
    { id: '3', name: 'Sardorbek', nick: '@sardor_invest', role: 'Biznesmen', happiness: 92, house: 'Biznes Markazi' },
    { id: '4', name: 'Zulayho', nick: '@zulayho_art', role: '3D Rassom', happiness: 96, house: 'Kiber Villa' },
    { id: '5', name: 'Alisher', nick: '@ali_hokimiyat', role: 'Mahalla Oqsoqoli', happiness: 99, house: 'Markaziy Rezedensiya' },
  ];
}

export function serializeGameState(state: SavedGameState): string {
  return JSON.stringify(state);
}

export function deserializeGameState(jsonStr: string): SavedGameState | null {
  try {
    const parsed = JSON.parse(jsonStr) as SavedGameState;
    if (!parsed || typeof parsed !== 'object') return null;
    if (!Array.isArray(parsed.cells)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveGameToStorage(state: SavedGameState): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    const serialized = serializeGameState({
      ...state,
      timestamp: Date.now(),
    });
    window.localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
    return false;
  }
}

export function loadGameFromStorage(): SavedGameState | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return deserializeGameState(raw);
  } catch (err) {
    console.error('Failed to load from localStorage:', err);
    return null;
  }
}

export function clearGameStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear localStorage:', err);
  }
}
