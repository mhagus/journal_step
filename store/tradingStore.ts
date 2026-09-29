"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Trade, TradingMethod } from "@/types";

/* ─── Initial Capital helpers (per-user, outside main persist store) ─── */
const IC_KEY = "step-traders-initial-capital";

export function getInitialCapital(email: string | undefined | null): number {
  if (typeof window === "undefined" || !email) return 10000;
  try {
    const raw = localStorage.getItem(IC_KEY);
    const map: Record<string, number> = raw ? JSON.parse(raw) : {};
    return map[email] ?? 10000;
  } catch {
    return 10000;
  }
}

export function setInitialCapital(
  email: string | undefined | null,
  value: number
): void {
  if (typeof window === "undefined" || !email) return;
  try {
    const raw = localStorage.getItem(IC_KEY);
    const map: Record<string, number> = raw ? JSON.parse(raw) : {};
    map[email] = value;
    localStorage.setItem(IC_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

/* ─── Zustand Store ──────────────────────────────────────────────────── */

interface TradingStore {
  trades: Trade[];
  methods: TradingMethod[];
  sidebarCollapsed: boolean;

  // Trade actions
  addTrade: (trade: Omit<Trade, "id">) => void;
  updateTrade: (id: string, trade: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;

  // Method actions
  addMethod: (method: Omit<TradingMethod, "id" | "createdAt">) => void;
  updateMethod: (id: string, method: Partial<TradingMethod>) => void;
  deleteMethod: (id: string) => void;

  // UI actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useTradingStore = create<TradingStore>()(
  persist(
    (set) => ({
      trades: [],    // starts empty — no mock data
      methods: [],   // starts empty — no mock data
      sidebarCollapsed: false,

      addTrade: (trade) =>
        set((state) => ({
          trades: [
            { ...trade, id: `trade-${Date.now()}` },
            ...state.trades,
          ],
        })),

      updateTrade: (id, tradeUpdate) =>
        set((state) => ({
          trades: state.trades.map((t) =>
            t.id === id ? { ...t, ...tradeUpdate } : t
          ),
        })),

      deleteTrade: (id) =>
        set((state) => ({
          trades: state.trades.filter((t) => t.id !== id),
        })),

      addMethod: (method) =>
        set((state) => ({
          methods: [
            {
              ...method,
              id: `method-${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
            ...state.methods,
          ],
        })),

      updateMethod: (id, methodUpdate) =>
        set((state) => ({
          methods: state.methods.map((m) =>
            m.id === id ? { ...m, ...methodUpdate } : m
          ),
        })),

      deleteMethod: (id) =>
        set((state) => ({
          methods: state.methods.filter((m) => m.id !== id),
        })),

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: "step-traders-storage",
    }
  )
);
