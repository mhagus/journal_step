import { TradingMethod } from "@/types";

export const mockMethods: TradingMethod[] = [
  {
    id: "method-1",
    name: "SMC - Smart Money Concepts",
    description:
      "Trading based on institutional order flow, liquidity pools, and market structure shifts. Focuses on identifying where smart money (banks & institutions) place their orders.",
    rules: [
      "Wait for a Market Structure Break (MSB) on H4 or D1",
      "Identify the Order Block (OB) that caused the MSB",
      "Wait for price to return to the OB",
      "Confirm with a lower timeframe entry pattern (FVG or rejection wick)",
      "Enter with SL below/above the OB",
      "Target the next liquidity pool or previous high/low",
    ],
    riskPercent: 1.0,
    createdAt: "2024-01-15T10:00:00Z",
    tags: ["SMC", "Institutional", "Order Flow"],
  },
  {
    id: "method-2",
    name: "S&D - Supply and Demand",
    description:
      "Classic supply and demand trading. Identifying price zones where large orders were placed causing a strong imbalance. Trade the re-test of these zones.",
    rules: [
      "Mark key supply and demand zones on H4/Daily chart",
      "Qualify zones: stronger if only visited once (fresh zone)",
      "Wait for price to reach the zone with minimal candles in the zone",
      "Enter at the proximal line of the zone",
      "SL beyond the distal line of the zone (+5 pips buffer)",
      "Minimum 1:3 Risk to Reward before taking the trade",
      "Close 50% at 1:1.5 and trail the rest",
    ],
    riskPercent: 1.5,
    createdAt: "2024-01-20T10:00:00Z",
    tags: ["S&D", "Zones", "Classic"],
  },
  {
    id: "method-3",
    name: "Breakout Strategy",
    description:
      "Trading breakouts of key levels during high-impact news events or after consolidation periods. Uses volume confirmation for validity.",
    rules: [
      "Identify consolidation range or key resistance/support level",
      "Set alert at the breakout level",
      "Wait for strong candle close beyond the level",
      "Enter on retest of the broken level",
      "SL inside the range or below the retest candle",
      "Target measured move (height of range projected)",
      "Only trade during London or NY sessions",
    ],
    riskPercent: 0.75,
    createdAt: "2024-02-01T10:00:00Z",
    tags: ["Breakout", "Momentum", "News"],
  },
];
