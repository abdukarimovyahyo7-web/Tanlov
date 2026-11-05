import { BuildingType, SkyscraperFloors } from '../game/rules.ts';

export interface GridCell {
  x: number;
  y: number;
  type: BuildingType | 'empty';
  floors?: SkyscraperFloors;
  colorId?: string;
  name?: string;
  instagram?: string;
  createdAt?: number;
  level?: number;
}

export interface Citizen {
  id: string;
  name: string;
  instagram: string;
  cellX: number;
  cellY: number;
  profession: string;
  happiness: number;
  avatar: string;
  quote: string;
}

export interface AgentMessage {
  id: string;
  agentId: 'sardor' | 'laylo' | 'rustam' | 'jamshid';
  agentName: string;
  agentRole: string;
  avatar: string;
  badgeColor: string;
  message: string;
  timestamp: string;
  actionLabel?: string;
  actionType?: 'expand' | 'style' | 'festival' | 'grant';
}

export interface CityStats {
  population: number;
  budget: number;
  incomePerSecond: number;
  happiness: number;
  jobs: number;
  power: number; // percentage
  gridSize: number; // e.g. 8, 10, 12, 14
  taxRate: number; // e.g. 10%
  isHokimGodMode: boolean;
  timeOfDay: 'day' | 'sunset' | 'night';
  gameSpeed: number; // 0, 1, 2
}
