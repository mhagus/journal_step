"use client";

import { useMemo, useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  LogIn,
  BookOpen,
  Wallet,
} from "lucide-react";
import { useTradingStore } from "@/store/tradingStore";
import { getInitialCapital } from "@/store/tradingStore";
import {
  calculateKPIs,
  calculateEquityCurve,
  formatCurrency,
  formatPercent,
  cn,
} from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

/* ─── Stat Card ─────────────────────────────────────────── */
const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "sky",
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  color?: "sky" | "green" | "red" | "yellow" | "purple";
}) => {
  const colorMap = {
    sky: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    green: "text-green-400 bg-green-500/10 border-green-500/20",
    red: "text-red-400 bg-red-500/10 border-red-500/20",
    yellow: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  };

  return (
    <Card className="group hover:border-slate-700/80 transition-all duration-200 hover:shadow-lg hover:shadow-black/20 bg-slate-900/50 border-slate-800">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              {title}
            </p>
            <p className="text-2xl font-bold text-white truncate">{value}</p>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-1.5">{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl border shrink-0 ml-3",
              colorMap[color]
            )}
          >
            <Icon size={18} />
          </div>
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 mt-3 text-xs font-medium",
              trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-slate-500"
            )}
          >
            {trend === "up" ? (
              <ArrowUpRight size={12} />
            ) : trend === "down" ? (
              <ArrowDownRight size={12} />
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/* ─── Chart Tooltip ─────────────────────────────────────── */
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-bold text-sky-400">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

/* ─── Guest CTA Banner ───────────────────────────────────── */
function GuestCTABanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-sky-500/30 bg-gradient-to-br from-sky-500/10 via-slate-900/80 to-blue-600/10 p-6 mb-6">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-sky-500/10 blur-[80px]" />
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/30 shrink-0">
          <LogIn size={22} className="text-sky-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-white leading-snug">
            Selamat Datang di Step Traders! 👋
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Login dengan Google untuk mulai mencatat jurnal dan menyimpan data trading Anda secara permanen.
          </p>
        </div>
        <button
          id="guest-cta-login-btn"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold transition-all shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 shrink-0 whitespace-nowrap"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
            <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Masuk dengan Google
        </button>
      </div>
    </div>
  );
}

/* ─── Empty Chart State ──────────────────────────────────── */
function EmptyChartState() {
  return (
    <div className="flex flex-col items-center justify-center h-[220px] gap-3">
      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
        <BarChart2 size={20} className="text-slate-600" />
      </div>
      <div className="text-center">
        <p className="text-sm text-slate-500 font-medium">Belum ada data grafik</p>
        <p className="text-xs text-slate-600 mt-0.5">Tambahkan trade pertama Anda untuk melihat equity curve</p>
      </div>
    </div>
  );
}

/* ─── Empty Trades State ─────────────────────────────────── */
function EmptyTradesState({ isGuest }: { isGuest: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
        <BookOpen size={18} className="text-slate-600" />
      </div>
      <div className="text-center">
        <p className="text-sm text-slate-500 font-medium">
          {isGuest ? "Login untuk melihat trade Anda" : "Belum ada trade terbaru"}
        </p>
        {!isGuest && (
          <Link href="/journal" className="text-xs text-sky-400 hover:text-sky-300 transition-colors mt-1 inline-block">
            Tambah trade pertama →
          </Link>
        )}
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────── */
export function DashboardContent() {
  const { data: session } = useSession();
  const isGuest = !session;
  const userEmail = session?.user?.email;

  const { trades, methods } = useTradingStore();

  // Initial capital (per-user localStorage)
  const [initialCapital, setInitialCapitalState] = useState<number>(10000);
  useEffect(() => {
    setInitialCapitalState(getInitialCapital(userEmail));
  }, [userEmail]);

  const kpis = useMemo(() => calculateKPIs(trades), [trades]);
  const equityCurve = useMemo(
    () => calculateEquityCurve(trades, initialCapital),
    [trades, initialCapital]
  );
  const totalPnl = useMemo(() => trades.reduce((sum, t) => sum + t.pnl, 0), [trades]);
  const currentBalance = initialCapital + totalPnl;

  const recentTrades = trades.slice(0, 5);

  // Display name
  const displayName = session?.user?.name?.split(" ")[0] ?? "Trader";

  return (
    <div className="space-y-6">
      {/* Guest banner */}
      {isGuest && <GuestCTABanner />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            Selamat datang,{" "}
            <span className="gradient-text">{isGuest ? "Tamu" : displayName}</span> 👋
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {isGuest
              ? "Login untuk mulai menyimpan jurnal trading Anda"
              : "Berikut ringkasan performa trading Anda"}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Market Buka
        </div>
      </div>

      {/* KPI Cards — row 0: capital */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-4">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
            <Wallet size={18} className="text-sky-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Modal Awal</p>
            <p className="text-2xl font-bold text-white truncate">
              ${initialCapital.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-4">
          <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center shrink-0",
            currentBalance >= initialCapital ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20")}>
            <DollarSign size={18} className={currentBalance >= initialCapital ? "text-green-400" : "text-red-400"} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Saldo Saat Ini</p>
            <p className={cn("text-2xl font-bold truncate",
              currentBalance >= initialCapital ? "text-green-400" : "text-red-400")}>
              ${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <span className={cn("text-xs font-semibold shrink-0", totalPnl >= 0 ? "text-green-400" : "text-red-400")}>
            {totalPnl >= 0 ? "+" : ""}{formatCurrency(totalPnl)}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Win Rate"
          value={trades.length === 0 ? "0%" : formatPercent(kpis.winRate)}
          subtitle={trades.length === 0 ? "Belum ada data" : `${trades.filter((t) => t.result === "Win").length}W / ${trades.filter((t) => t.result === "Loss").length}L`}
          icon={Target}
          color={kpis.winRate >= 50 && trades.length > 0 ? "green" : trades.length === 0 ? "sky" : "red"}
          trend={trades.length === 0 ? undefined : kpis.winRate >= 50 ? "up" : "down"}
        />
        <StatCard
          title="Total PnL"
          value={trades.length === 0 ? "$0.00" : formatCurrency(kpis.totalPnl)}
          subtitle="Performa keseluruhan"
          icon={DollarSign}
          color={kpis.totalPnl >= 0 && trades.length > 0 ? "green" : trades.length === 0 ? "sky" : "red"}
          trend={trades.length === 0 ? undefined : kpis.totalPnl >= 0 ? "up" : "down"}
        />
        <StatCard
          title="Profit Factor"
          value={trades.length === 0 ? "0.00" : kpis.profitFactor.toFixed(2)}
          subtitle="Target: ≥ 1.5"
          icon={BarChart2}
          color={trades.length === 0 ? "sky" : kpis.profitFactor >= 1.5 ? "sky" : "yellow"}
        />
        <StatCard
          title="Total Trade"
          value={kpis.totalTrades.toString()}
          subtitle={trades.length === 0 ? "Belum ada trade" : `Avg RR: ${kpis.avgRR.toFixed(1)}`}
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Trade Terbaik"
          value={trades.length === 0 ? "$0.00" : formatCurrency(kpis.bestTrade)}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Trade Terburuk"
          value={trades.length === 0 ? "$0.00" : formatCurrency(kpis.worstTrade)}
          icon={TrendingDown}
          color="red"
        />
        <StatCard
          title="Avg Risk/Reward"
          value={trades.length === 0 ? "1:0" : `1:${kpis.avgRR.toFixed(1)}`}
          icon={Target}
          color="sky"
        />
        <StatCard
          title="Streak"
          value={trades.length === 0 ? "0" : `${kpis.currentStreak > 0 ? "+" : ""}${kpis.currentStreak}`}
          subtitle={
            trades.length === 0
              ? "Belum ada data"
              : kpis.currentStreak > 0
              ? "Win streak 🔥"
              : kpis.currentStreak < 0
              ? "Loss streak"
              : "Netral"
          }
          icon={Zap}
          color={
            trades.length === 0
              ? "sky"
              : kpis.currentStreak > 0
              ? "green"
              : kpis.currentStreak < 0
              ? "red"
              : "sky"
          }
        />
      </div>

      {/* Equity Curve + Recent Trades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve */}
        <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Equity Curve</CardTitle>
              <span className="text-xs text-slate-500">
                {trades.length === 0 ? "Belum ada data" : `Modal awal: $${initialCapital.toLocaleString("en-US", { minimumFractionDigits: 0 })}`}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {equityCurve.length <= 1 ? (
              <EmptyChartState />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={equityCurve}
                  margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    width={48}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={initialCapital} stroke="#1e293b" strokeDasharray="4 4" />
                  <Area
                    type="monotone"
                    dataKey="equity"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    fill="url(#equityGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#0ea5e9" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Trades */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle>Trade Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {recentTrades.length === 0 ? (
              <EmptyTradesState isGuest={isGuest} />
            ) : (
              <div className="space-y-2">
                {recentTrades.map((trade) => (
                  <div
                    key={trade.id}
                    className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={cn(
                          "w-1.5 h-8 rounded-full shrink-0",
                          trade.result === "Win"
                            ? "bg-green-400"
                            : trade.result === "Loss"
                            ? "bg-red-400"
                            : "bg-yellow-400"
                        )}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {trade.instrument}
                        </p>
                        <p className="text-xs text-slate-500">
                          {trade.direction} · {trade.result}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-sm font-semibold shrink-0 ml-2",
                        trade.pnl > 0
                          ? "text-green-400"
                          : trade.pnl < 0
                          ? "text-red-400"
                          : "text-slate-400"
                      )}
                    >
                      {trade.pnl > 0 ? "+" : ""}${trade.pnl}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Strategies */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-300">Strategi Aktif</h3>
          <span className="text-xs text-slate-500">{methods.length} metode</span>
        </div>
        {methods.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col items-center gap-2 text-center">
            <BookOpen size={20} className="text-slate-600" />
            <p className="text-sm text-slate-500">
              {isGuest
                ? "Login untuk mengelola strategi trading Anda"
                : "Belum ada metode. Buat strategi pertama Anda di halaman Methods."}
            </p>
            {!isGuest && (
              <Link href="/methods" className="text-xs text-sky-400 hover:text-sky-300 transition-colors">
                Buat metode →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {methods.map((method) => {
              const methodTrades = trades.filter((t) => t.methodId === method.id);
              const winRate =
                methodTrades.length === 0
                  ? 0
                  : (methodTrades.filter((t) => t.result === "Win").length /
                      methodTrades.length) *
                    100;
              return (
                <Card
                  key={method.id}
                  className="hover:border-sky-500/20 transition-all duration-200 bg-slate-900/50 border-slate-800"
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                        <TrendingUp size={14} className="text-sky-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {method.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-slate-500">
                            {methodTrades.length} trade
                          </span>
                          <span
                            className={cn(
                              "text-xs font-medium",
                              winRate >= 50 ? "text-green-400" : "text-red-400"
                            )}
                          >
                            {winRate.toFixed(0)}% WR
                          </span>
                          <span className="text-xs text-slate-500">
                            {method.riskPercent}% risk
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
