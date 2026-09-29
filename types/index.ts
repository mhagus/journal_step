// Types for the Step Traders application

export type TradeDirection = "Buy" | "Sell";
export type TradeResult = "Win" | "Loss" | "Breakeven";
export type ImpactLevel = "High" | "Medium" | "Low";

export interface TradingMethod {
  id: string;
  name: string;
  description: string;
  rules: string[];
  riskPercent: number;
  createdAt: string;
  tags?: string[];
}

export type TradePsychologyTag =
  | "Sesuai Plan"
  | "FOMO"
  | "Revenge Trading"
  | "Overleveraged"
  | "Ragu-ragu";

export type TradingSession = "Asia" | "London" | "New York";

export interface Trade {
  id: string;
  date: string; // ISO string
  instrument: string;
  direction: TradeDirection;
  methodId: string | null;
  methodName?: string;
  riskReward: number;
  result: TradeResult;
  pnl: number;
  pips: number;
  notes: string;
  screenshotUrl?: string;
  session?: TradingSession;
  psychologyTags?: TradePsychologyTag[];
}

/** Keyed by user email → starting capital in USD */
export type InitialCapitalMap = Record<string, number>;

export interface EconomicEvent {
  id: string;
  time: string; // e.g. "08:30"
  currency: string;
  impact: ImpactLevel;
  event: string;
  forecast?: string;
  previous?: string;
  actual?: string;
}

export interface KPIData {
  winRate: number;
  totalPnl: number;
  profitFactor: number;
  totalTrades: number;
  avgRR: number;
  bestTrade: number;
  worstTrade: number;
  currentStreak: number;
}

export interface EquityPoint {
  date: string;
  equity: number;
  trade: number;
}

export interface MethodPerformance {
  method: string;
  winRate: number;
  totalTrades: number;
  totalPnl: number;
}
