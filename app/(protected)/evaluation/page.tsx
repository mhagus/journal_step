"use client";

import { useMemo } from "react";
import {
  Target,
  DollarSign,
  BarChart2,
  Activity,
  Award,
  TrendingDown,
  Zap,
} from "lucide-react";
import { useTradingStore } from "@/store/tradingStore";
import {
  calculateKPIs,
  calculateEquityCurve,
  calculateMethodPerformance,
  formatCurrency,
  formatPercent,
  cn,
} from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie,
} from "recharts";

const KPICard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "sky",
  large = false,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  color?: "sky" | "green" | "red" | "yellow" | "purple";
  large?: boolean;
}) => {
  const colorMap = {
    sky: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    green: "text-green-400 bg-green-500/10 border-green-500/20",
    red: "text-red-400 bg-red-500/10 border-red-500/20",
    yellow: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  };

  return (
    <Card className="hover:border-zinc-700/80 transition-all">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              {title}
            </p>
            <p
              className={cn(
                "font-bold text-white mt-1.5",
                large ? "text-3xl" : "text-2xl"
              )}
            >
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl border",
              colorMap[color]
            )}
          >
            <Icon size={18} />
          </div>
        </div>
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
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-zinc-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-bold text-white">
            {p.name === "equity"
              ? `$${p.value.toLocaleString()}`
              : `${p.value}%`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function EvaluationPage() {
  const { trades } = useTradingStore();

  const kpis = useMemo(() => calculateKPIs(trades), [trades]);
  const equityCurve = useMemo(() => calculateEquityCurve(trades), [trades]);
  const methodPerf = useMemo(() => calculateMethodPerformance(trades), [trades]);

  // Session performance
  const sessionData = useMemo(() => {
    const sessions: Record<string, { wins: number; total: number; pnl: number }> = {};
    for (const trade of trades) {
      const s = trade.session || "Unknown";
      if (!sessions[s]) sessions[s] = { wins: 0, total: 0, pnl: 0 };
      sessions[s].total++;
      if (trade.result === "Win") sessions[s].wins++;
      sessions[s].pnl += trade.pnl;
    }
    return Object.entries(sessions).map(([name, data]) => ({
      name,
      winRate: parseFloat(((data.wins / data.total) * 100).toFixed(1)),
      pnl: data.pnl,
      trades: data.total,
    }));
  }, [trades]);

  // Monthly PnL
  const monthlyPnl = useMemo(() => {
    const months: Record<string, number> = {};
    for (const trade of trades) {
      const month = new Date(trade.date).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      months[month] = (months[month] || 0) + trade.pnl;
    }
    return Object.entries(months).map(([month, pnl]) => ({ month, pnl }));
  }, [trades]);

  // Pie chart data for Win/Loss/BE
  const resultDistribution = useMemo(() => {
    const wins = trades.filter((t) => t.result === "Win").length;
    const losses = trades.filter((t) => t.result === "Loss").length;
    const be = trades.filter((t) => t.result === "Breakeven").length;
    return [
      { name: "Win", value: wins, color: "#22c55e" },
      { name: "Loss", value: losses, color: "#ef4444" },
      { name: "Breakeven", value: be, color: "#eab308" },
    ].filter((d) => d.value > 0);
  }, [trades]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title="Overall Win Rate"
          value={formatPercent(kpis.winRate)}
          subtitle={`${trades.filter((t) => t.result === "Win").length} wins / ${trades.filter((t) => t.result === "Loss").length} losses`}
          icon={Target}
          color={kpis.winRate >= 50 ? "green" : "red"}
          large
        />
        <KPICard
          title="Total PnL"
          value={formatCurrency(kpis.totalPnl)}
          subtitle="From $10,000 starting capital"
          icon={DollarSign}
          color={kpis.totalPnl >= 0 ? "green" : "red"}
          large
        />
        <KPICard
          title="Profit Factor"
          value={kpis.profitFactor.toFixed(2)}
          subtitle={kpis.profitFactor >= 1.5 ? "✓ Above target (1.5)" : "Below target (1.5)"}
          icon={BarChart2}
          color={kpis.profitFactor >= 1.5 ? "sky" : "yellow"}
          large
        />
        <KPICard
          title="Total Trades"
          value={kpis.totalTrades.toString()}
          subtitle={`Avg RR: 1:${kpis.avgRR.toFixed(2)}`}
          icon={Activity}
          color="purple"
          large
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title="Best Trade"
          value={formatCurrency(kpis.bestTrade)}
          icon={Award}
          color="green"
        />
        <KPICard
          title="Worst Trade"
          value={formatCurrency(kpis.worstTrade)}
          icon={TrendingDown}
          color="red"
        />
        <KPICard
          title="Avg Risk/Reward"
          value={`1:${kpis.avgRR.toFixed(2)}`}
          icon={Target}
          color="sky"
        />
        <KPICard
          title="Current Streak"
          value={`${kpis.currentStreak > 0 ? "+" : ""}${kpis.currentStreak}`}
          subtitle={kpis.currentStreak > 0 ? "Win streak 🔥" : kpis.currentStreak < 0 ? "Loss streak" : "Neutral"}
          icon={Zap}
          color={kpis.currentStreak > 0 ? "green" : kpis.currentStreak < 0 ? "red" : "sky"}
        />
      </div>

      {/* Charts Row 1: Equity Curve + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Equity Curve</CardTitle>
          </CardHeader>
          <CardContent>
            {equityCurve.length < 2 ? (
              <div className="flex items-center justify-center h-[240px] text-zinc-600 text-sm">
                Add more trades to see your equity curve
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={equityCurve} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="evalEquityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={48} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={10000} stroke="#3f3f46" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="equity" name="equity" stroke="#0ea5e9" strokeWidth={2} fill="url(#evalEquityGrad)" dot={false} activeDot={{ r: 4, fill: "#0ea5e9" }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Trade Distribution Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Trade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={resultDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {resultDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    `${value ?? 0} trades`,
                    String(name),
                  ]}
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {resultDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-zinc-400">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Win Rate by Method + Monthly PnL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Win Rate by Method */}
        <Card>
          <CardHeader>
            <CardTitle>Win Rate by Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            {methodPerf.length === 0 ? (
              <div className="flex items-center justify-center h-[220px] text-zinc-600 text-sm">
                No method data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={methodPerf} margin={{ top: 5, right: 5, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis
                    dataKey="method"
                    tick={{ fill: "#71717a", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                    height={50}
                    tickFormatter={(v: string) => v.split(" - ")[0]}
                  />
                  <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} width={40} />
                  <Tooltip
                    formatter={(v) => [`${v ?? 0}%`, "Win Rate"]}
                    contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                  />
                  <ReferenceLine y={50} stroke="#3f3f46" strokeDasharray="4 4" label={{ value: "50%", fill: "#52525b", fontSize: 10 }} />
                  <Bar dataKey="winRate" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {methodPerf.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.winRate >= 50 ? "#22c55e" : "#ef4444"}
                        opacity={0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Monthly PnL */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly PnL</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyPnl.length === 0 ? (
              <div className="flex items-center justify-center h-[220px] text-zinc-600 text-sm">
                No monthly data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyPnl} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} width={48} />
                  <Tooltip
                    formatter={(v) => [`$${v ?? 0}`, "PnL"]}
                    contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                  />
                  <ReferenceLine y={0} stroke="#3f3f46" />
                  <Bar dataKey="pnl" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {monthlyPnl.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.pnl >= 0 ? "#22c55e" : "#ef4444"}
                        opacity={0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Session Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Session Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sessionData.length === 0 ? (
              <p className="col-span-4 text-center text-zinc-600 text-sm py-6">
                No session data available
              </p>
            ) : (
              sessionData.map((session) => (
                <div
                  key={session.name}
                  className="rounded-xl bg-zinc-800/40 border border-zinc-800 p-4 text-center"
                >
                  <p className="text-sm font-semibold text-white">
                    {session.name}
                  </p>
                  <p
                    className={cn(
                      "text-2xl font-bold mt-2",
                      session.winRate >= 50 ? "text-green-400" : "text-red-400"
                    )}
                  >
                    {session.winRate}%
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {session.trades} trades ·{" "}
                    <span
                      className={
                        session.pnl >= 0 ? "text-green-400" : "text-red-400"
                      }
                    >
                      ${session.pnl}
                    </span>
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
