"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useTradingStore } from "@/store/tradingStore";
import { Trade, TradeDirection, TradeResult } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency, formatDateTime, formatPercent } from "@/lib/utils";

const INSTRUMENTS = [
  "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD",
  "NZDUSD", "GBPJPY", "EURJPY", "XAUUSD", "XAGUSD",
  "US30", "NAS100", "SPX500", "BTCUSD", "ETHUSD",
];

function AddTradeModal({ onClose }: { onClose: () => void }) {
  const { addTrade, methods } = useTradingStore();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [instrument, setInstrument] = useState("");
  const [direction, setDirection] = useState<TradeDirection>("Buy");
  const [methodId, setMethodId] = useState<string>("none");
  const [riskReward, setRiskReward] = useState("");
  const [result, setResult] = useState<TradeResult>("Win");
  const [pnl, setPnl] = useState("");
  const [notes, setNotes] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!instrument.trim()) newErrors.instrument = "Instrument is required";
    const rr = parseFloat(riskReward);
    if (isNaN(rr) || rr <= 0) newErrors.riskReward = "Enter a valid R:R ratio";
    const pnlNum = parseFloat(pnl);
    if (isNaN(pnlNum)) newErrors.pnl = "Enter a valid PnL amount";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedMethod = methods.find((m) => m.id === methodId);
    addTrade({
      date: new Date(date).toISOString(),
      instrument: instrument.toUpperCase().trim(),
      direction,
      methodId: methodId === "none" ? null : methodId,
      methodName: selectedMethod?.name,
      riskReward: rr,
      result,
      pnl: pnlNum,
      notes: notes.trim(),
      screenshotUrl: screenshotUrl.trim(),
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Date & Time"
          id="trade-date"
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="[color-scheme:dark]"
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-400">Instrument</label>
          <input
            id="trade-instrument"
            list="instruments-list"
            placeholder="e.g., EURUSD"
            value={instrument}
            onChange={(e) => setInstrument(e.target.value.toUpperCase())}
            className={cn(
              "h-9 w-full rounded-lg border border-zinc-700/80 bg-zinc-900 px-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all",
              errors.instrument && "border-red-500/50"
            )}
          />
          <datalist id="instruments-list">
            {INSTRUMENTS.map((inst) => <option key={inst} value={inst} />)}
          </datalist>
          {errors.instrument && <p className="text-xs text-red-400">{errors.instrument}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Direction buttons */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-400">Direction</label>
          <div className="flex gap-2">
            {(["Buy", "Sell"] as TradeDirection[]).map((dir) => (
              <button
                key={dir}
                type="button"
                id={`direction-${dir.toLowerCase()}`}
                onClick={() => setDirection(dir)}
                className={cn(
                  "flex-1 h-9 rounded-lg text-sm font-medium transition-all border flex items-center justify-center gap-1.5",
                  direction === dir
                    ? dir === "Buy"
                      ? "bg-green-500/20 text-green-400 border-green-500/40"
                      : "bg-red-500/20 text-red-400 border-red-500/40"
                    : "bg-zinc-900 text-zinc-500 border-zinc-700 hover:border-zinc-600"
                )}
              >
                {dir === "Buy" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {dir}
              </button>
            ))}
          </div>
        </div>

        {/* Result buttons */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-400">Result</label>
          <div className="flex gap-1.5">
            {(["Win", "Loss", "Breakeven"] as TradeResult[]).map((res) => (
              <button
                key={res}
                type="button"
                id={`result-${res.toLowerCase()}`}
                onClick={() => setResult(res)}
                className={cn(
                  "flex-1 h-9 rounded-lg text-xs font-medium transition-all border",
                  result === res
                    ? res === "Win"
                      ? "bg-green-500/20 text-green-400 border-green-500/40"
                      : res === "Loss"
                      ? "bg-red-500/20 text-red-400 border-red-500/40"
                      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
                    : "bg-zinc-900 text-zinc-500 border-zinc-700 hover:border-zinc-600"
                )}
              >
                {res}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-400">Linked Method</label>
          <Select value={methodId} onValueChange={setMethodId}>
            <SelectTrigger id="trade-method-select">
              <SelectValue placeholder="No Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Method</SelectItem>
              {methods.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Input
          label="Risk/Reward"
          id="trade-rr"
          type="number"
          step="0.1"
          min="0"
          placeholder="2.5"
          value={riskReward}
          onChange={(e) => setRiskReward(e.target.value)}
          error={errors.riskReward}
        />
        <Input
          label="PnL ($)"
          id="trade-pnl"
          type="number"
          step="0.01"
          placeholder="250.00"
          value={pnl}
          onChange={(e) => setPnl(e.target.value)}
          error={errors.pnl}
        />
      </div>

      <Textarea
        label="Notes"
        id="trade-notes"
        placeholder="What happened? What did you do well? What can be improved?"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="min-h-[80px]"
      />
      <Input
        label="Screenshot URL (optional)"
        id="trade-screenshot"
        type="url"
        placeholder="https://prnt.sc/..."
        value={screenshotUrl}
        onChange={(e) => setScreenshotUrl(e.target.value)}
      />

      <DialogFooter className="pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">
          <Plus size={14} />
          Log Trade
        </Button>
      </DialogFooter>
    </form>
  );
}

type SortField = "date" | "instrument" | "pnl" | "result";
type SortDir = "asc" | "desc";

export default function JournalPage() {
  const { trades, deleteTrade } = useTradingStore();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterResult, setFilterResult] = useState<TradeResult | "All">("All");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filteredTrades = useMemo(() => {
    let filtered = [...trades];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.instrument.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q) ||
          (t.methodName || "").toLowerCase().includes(q)
      );
    }

    if (filterResult !== "All") {
      filtered = filtered.filter((t) => t.result === filterResult);
    }

    filtered.sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortField === "instrument") cmp = a.instrument.localeCompare(b.instrument);
      else if (sortField === "pnl") cmp = a.pnl - b.pnl;
      else if (sortField === "result") cmp = a.result.localeCompare(b.result);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return filtered;
  }, [trades, search, filterResult, sortField, sortDir]);

  const totalPnl = filteredTrades.reduce((sum, t) => sum + t.pnl, 0);
  const wins = filteredTrades.filter((t) => t.result === "Win").length;
  const winRate = filteredTrades.length > 0 ? (wins / filteredTrades.length) * 100 : 0;

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown size={12} className="text-zinc-600" />;
    return sortDir === "asc"
      ? <ChevronUp size={12} className="text-sky-400" />
      : <ChevronDown size={12} className="text-sky-400" />;
  };

  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500">Filtered Trades</p>
            <p className="text-xl font-bold text-white mt-0.5">{filteredTrades.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500">Win Rate</p>
            <p className={cn("text-xl font-bold mt-0.5", winRate >= 50 ? "text-green-400" : "text-red-400")}>
              {formatPercent(winRate)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500">Total PnL</p>
            <p className={cn("text-xl font-bold mt-0.5", totalPnl >= 0 ? "text-green-400" : "text-red-400")}>
              {formatCurrency(totalPnl)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            id="journal-search"
            type="text"
            placeholder="Search by instrument, notes, method..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 rounded-lg border border-zinc-700/80 bg-zinc-900 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
          />
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <Filter size={14} className="text-zinc-500 shrink-0" />
          {(["All", "Win", "Loss", "Breakeven"] as const).map((f) => (
            <button
              key={f}
              id={`filter-${f.toLowerCase()}`}
              onClick={() => setFilterResult(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                filterResult === f
                  ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                  : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-white"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button id="add-trade-btn">
              <Plus size={16} />
              Add Trade
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Log New Trade</DialogTitle>
            </DialogHeader>
            <AddTradeModal onClose={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/80">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 cursor-pointer hover:text-zinc-300 select-none" onClick={() => handleSort("date")}>
                  <div className="flex items-center gap-1">Date <SortIcon field="date" /></div>
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 cursor-pointer hover:text-zinc-300 select-none" onClick={() => handleSort("instrument")}>
                  <div className="flex items-center gap-1">Instrument <SortIcon field="instrument" /></div>
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Direction</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 hidden lg:table-cell">Method</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-zinc-500">R:R</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-zinc-500 cursor-pointer hover:text-zinc-300 select-none" onClick={() => handleSort("result")}>
                  <div className="flex items-center justify-center gap-1">Result <SortIcon field="result" /></div>
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 cursor-pointer hover:text-zinc-300 select-none" onClick={() => handleSort("pnl")}>
                  <div className="flex items-center justify-end gap-1">PnL <SortIcon field="pnl" /></div>
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 hidden xl:table-cell">Notes</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-zinc-600 text-sm">
                    No trades found. Add your first trade!
                  </td>
                </tr>
              ) : (
                filteredTrades.map((trade) => (
                  <tr key={trade.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors last:border-0 group">
                    <td className="px-4 py-3 text-xs text-zinc-400 whitespace-nowrap">{formatDateTime(trade.date)}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-white text-sm">{trade.instrument}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={trade.direction === "Buy" ? "buy" : "sell"} className="text-[10px]">
                        {trade.direction === "Buy" ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                        {trade.direction}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-zinc-400 line-clamp-1">
                        {trade.methodName || <span className="text-zinc-600">—</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs text-zinc-300 font-mono">1:{trade.riskReward}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={trade.result === "Win" ? "win" : trade.result === "Loss" ? "loss" : "breakeven"}
                        className="text-[10px]"
                      >
                        {trade.result === "Win" ? <TrendingUp size={9} /> : trade.result === "Loss" ? <TrendingDown size={9} /> : <Minus size={9} />}
                        {trade.result}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn("text-sm font-bold font-mono", trade.pnl > 0 ? "text-green-400" : trade.pnl < 0 ? "text-red-400" : "text-zinc-500")}>
                        {trade.pnl > 0 ? "+" : ""}${trade.pnl}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <span className="text-xs text-zinc-500 line-clamp-1">{trade.notes || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        id={`delete-trade-${trade.id}`}
                        onClick={() => deleteTrade(trade.id)}
                        className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all"
                        aria-label="Delete trade"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
