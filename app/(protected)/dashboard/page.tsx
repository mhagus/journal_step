"use client";

import { useMemo } from "react";
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
} from "lucide-react";
import { useTradingStore } from "@/store/tradingStore";
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
    <Card className="group hover:border-zinc-700/80 transition-all duration-200 hover:shadow-lg hover:shadow-black/20">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              {title}
            </p>
            <p className="text-2xl font-bold text-white truncate">{value}</p>
            {subtitle && (
              <p className="text-xs text-zinc-500 mt-1.5">{subtitle}</p>
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
              trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-zinc-500"
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
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-zinc-400">{label}</p>
        <p className="text-sm font-bold text-sky-400">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { trades, methods } = useTradingStore();

  const kpis = useMemo(() => calculateKPIs(trades), [trades]);
  const equityCurve = useMemo(() => calculateEquityCurve(trades), [trades]);

  const recentTrades = trades.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            Welcome back,{" "}
            <span className="gradient-text">Trader</span> 👋
          </h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Here&apos;s your performance summary
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Markets Open
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Win Rate"
          value={formatPercent(kpis.winRate)}
          subtitle={`${trades.filter((t) => t.result === "Win").length}W / ${trades.filter((t) => t.result === "Loss").length}L`}
          icon={Target}
          color={kpis.winRate >= 50 ? "green" : "red"}
          trend={kpis.winRate >= 50 ? "up" : "down"}
        />
        <StatCard
          title="Total PnL"
          value={formatCurrency(kpis.totalPnl)}
          subtitle="All-time performance"
          icon={DollarSign}
          color={kpis.totalPnl >= 0 ? "green" : "red"}
          trend={kpis.totalPnl >= 0 ? "up" : "down"}
        />
        <StatCard
          title="Profit Factor"
          value={kpis.profitFactor.toFixed(2)}
          subtitle="Target: ≥ 1.5"
          icon={BarChart2}
          color={kpis.profitFactor >= 1.5 ? "sky" : "yellow"}
        />
        <StatCard
          title="Total Trades"
          value={kpis.totalTrades.toString()}
          subtitle={`Avg RR: ${kpis.avgRR.toFixed(1)}`}
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Best Trade"
          value={formatCurrency(kpis.bestTrade)}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Worst Trade"
          value={formatCurrency(kpis.worstTrade)}
          icon={TrendingDown}
          color="red"
        />
        <StatCard
          title="Avg Risk/Reward"
          value={`1:${kpis.avgRR.toFixed(1)}`}
          icon={Target}
          color="sky"
        />
        <StatCard
          title="Streak"
          value={`${kpis.currentStreak > 0 ? "+" : ""}${kpis.currentStreak}`}
          subtitle={kpis.currentStreak > 0 ? "Win streak 🔥" : kpis.currentStreak < 0 ? "Loss streak" : "Neutral"}
          icon={Zap}
          color={kpis.currentStreak > 0 ? "green" : kpis.currentStreak < 0 ? "red" : "sky"}
        />
      </div>

      {/* Equity Curve + Recent Trades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Equity Curve</CardTitle>
              <span className="text-xs text-zinc-500">Starting: $10,000</span>
            </div>
          </CardHeader>
          <CardContent>
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
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#27272a"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  width={48}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={10000} stroke="#27272a" strokeDasharray="4 4" />
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
          </CardContent>
        </Card>

        {/* Recent Trades */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Recent Trades</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {recentTrades.map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between py-2 border-b border-zinc-800/60 last:border-0"
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
                      <p className="text-xs text-zinc-500">
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
                        : "text-zinc-400"
                    )}
                  >
                    {trade.pnl > 0 ? "+" : ""}${trade.pnl}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Methods */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-zinc-300">
            Active Strategies
          </h3>
          <span className="text-xs text-zinc-500">{methods.length} methods</span>
        </div>
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
                className="hover:border-sky-500/20 transition-all duration-200"
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
                        <span className="text-xs text-zinc-500">
                          {methodTrades.length} trades
                        </span>
                        <span
                          className={cn(
                            "text-xs font-medium",
                            winRate >= 50 ? "text-green-400" : "text-red-400"
                          )}
                        >
                          {winRate.toFixed(0)}% WR
                        </span>
                        <span className="text-xs text-zinc-500">
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
      </div>
    </div>
  );
}
