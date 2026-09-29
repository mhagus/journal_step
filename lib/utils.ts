import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Trade, KPIData, MethodPerformance, EquityPoint } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return value >= 0 ? `+$${formatted}` : `-$${formatted}`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function calculateKPIs(trades: Trade[]): KPIData {
  if (trades.length === 0) {
    return {
      winRate: 0,
      totalPnl: 0,
      profitFactor: 0,
      totalTrades: 0,
      avgRR: 0,
      bestTrade: 0,
      worstTrade: 0,
      currentStreak: 0,
    };
  }

  const wins = trades.filter((t) => t.result === "Win");
  const losses = trades.filter((t) => t.result === "Loss");

  const winRate = (wins.length / trades.length) * 100;
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);

  const totalWins = wins.reduce((sum, t) => sum + t.pnl, 0);
  const totalLosses = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
  const profitFactor = totalLosses === 0 ? totalWins : totalWins / totalLosses;

  const avgRR =
    trades.reduce((sum, t) => sum + t.riskReward, 0) / trades.length;
  const bestTrade = Math.max(...trades.map((t) => t.pnl));
  const worstTrade = Math.min(...trades.map((t) => t.pnl));

  // Calculate current streak
  let streak = 0;
  const sorted = [...trades].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  if (sorted.length > 0) {
    const lastResult = sorted[0].result;
    if (lastResult === "Breakeven") {
      streak = 0;
    } else {
      for (const trade of sorted) {
        if (trade.result === lastResult) streak++;
        else break;
      }
      if (lastResult === "Loss") streak = -streak;
    }
  }

  return {
    winRate,
    totalPnl,
    profitFactor,
    totalTrades: trades.length,
    avgRR,
    bestTrade,
    worstTrade,
    currentStreak: streak,
  };
}

export function calculateEquityCurve(
  trades: Trade[],
  startingCapital = 10000
): EquityPoint[] {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let equity = startingCapital;
  return sorted.map((trade, index) => {
    equity += trade.pnl;
    return {
      date: new Date(trade.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      equity: parseFloat(equity.toFixed(2)),
      trade: index + 1,
    };
  });
}

export function calculateTotalPips(trades: Trade[]): number {
  return trades.reduce((sum, t) => {
    // Loss pips are negative, Win/BE pips are positive
    const pipValue = t.pips ?? 0;
    return sum + (t.result === "Loss" ? -Math.abs(pipValue) : Math.abs(pipValue));
  }, 0);
}

export function calculateMethodPerformance(
  trades: Trade[]
): MethodPerformance[] {
  const methodMap = new Map<
    string,
    { wins: number; total: number; pnl: number }
  >();

  for (const trade of trades) {
    const key = trade.methodName || "Unknown";
    const current = methodMap.get(key) || { wins: 0, total: 0, pnl: 0 };
    methodMap.set(key, {
      wins: current.wins + (trade.result === "Win" ? 1 : 0),
      total: current.total + 1,
      pnl: current.pnl + trade.pnl,
    });
  }

  return Array.from(methodMap.entries()).map(([method, data]) => ({
    method,
    winRate: parseFloat(((data.wins / data.total) * 100).toFixed(1)),
    totalTrades: data.total,
    totalPnl: data.pnl,
  }));
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
