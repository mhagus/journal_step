"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Plus,
  Trash2,
  Pencil,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  ChevronUp,
  ChevronDown,
  Download,
  Brain,
  ScrollText,
  ExternalLink,
  Wallet,
  DollarSign,
  Sigma,
} from "lucide-react";
import { useTradingStore } from "@/store/tradingStore";
import { getInitialCapital, setInitialCapital } from "@/store/tradingStore";
import {
  Trade,
  TradeDirection,
  TradeResult,
  TradePsychologyTag,
  TradingSession,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  cn,
  formatCurrency,
  formatDateTime,
  formatPercent,
  calculateTotalPips,
} from "@/lib/utils";
import { exportTradesToCSV } from "@/lib/csvExport";

/* ─── Constants ────────────────────────────────────────────── */
const INSTRUMENTS = [
  "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD",
  "NZDUSD", "GBPJPY", "EURJPY", "XAUUSD", "XAGUSD",
  "US30", "NAS100", "SPX500", "BTCUSD", "ETHUSD",
];

const PSYCHOLOGY_TAGS: TradePsychologyTag[] = [
  "Sesuai Plan",
  "FOMO",
  "Revenge Trading",
  "Overleveraged",
  "Ragu-ragu",
];

const PSYCHOLOGY_TAG_COLORS: Record<TradePsychologyTag, string> = {
  "Sesuai Plan": "bg-green-500/15 text-green-400 border-green-500/30",
  "FOMO": "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "Revenge Trading": "bg-red-500/15 text-red-400 border-red-500/30",
  "Overleveraged": "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  "Ragu-ragu": "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

const SESSION_CONFIG: Record<
  TradingSession,
  { label: string; color: string; dot: string }
> = {
  Asia: {
    label: "Asia",
    color: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    dot: "bg-amber-400",
  },
  London: {
    label: "London",
    color: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    dot: "bg-sky-400",
  },
  "New York": {
    label: "NY",
    color: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    dot: "bg-violet-400",
  },
};

/* ─── Modal Awal Dialog ────────────────────────────────────── */
function ModalAwalDialog({
  open,
  currentValue,
  onSave,
  onClose,
}: {
  open: boolean;
  currentValue: number;
  onSave: (val: number) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(currentValue.toString());
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) setValue(currentValue.toString());
  }, [open, currentValue]);

  const handleSave = () => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      setError("Masukkan jumlah modal yang valid (> 0)");
      return;
    }
    onSave(num);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet size={16} className="text-sky-400" />
            Set Modal Awal
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-xs text-slate-400">
            Modal awal digunakan untuk menghitung Saldo Saat Ini (Modal Awal + Total PnL).
            Data ini disimpan lokal per akun.
          </p>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">
              Jumlah Modal Awal ($)
            </label>
            <input
              id="modal-awal-input"
              type="number"
              min="1"
              step="100"
              placeholder="10000"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError("");
              }}
              className="h-9 w-full rounded-lg border border-slate-700/80 bg-slate-900 px-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSave}>
            <Wallet size={14} />
            Simpan Modal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Trade Modal (Add + Edit) ─────────────────────────────── */
interface TradeModalProps {
  trade?: Trade | null;
  onClose: () => void;
}

function TradeModal({ trade: editTrade, onClose }: TradeModalProps) {
  const { addTrade, updateTrade, methods } = useTradingStore();
  const isEdit = !!editTrade;

  const [date, setDate] = useState(
    editTrade?.date
      ? new Date(editTrade.date).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [instrument, setInstrument] = useState(editTrade?.instrument ?? "");
  const [direction, setDirection] = useState<TradeDirection>(
    editTrade?.direction ?? "Buy"
  );
  const [session, setSession] = useState<TradingSession | "">(
    editTrade?.session ?? ""
  );
  const [methodId, setMethodId] = useState<string>(
    editTrade?.methodId ?? "none"
  );
  const [riskReward, setRiskReward] = useState(
    editTrade?.riskReward?.toString() ?? ""
  );
  const [result, setResult] = useState<TradeResult>(
    editTrade?.result ?? "Win"
  );
  const [pnl, setPnl] = useState(editTrade?.pnl?.toString() ?? "");
  const [pips, setPips] = useState(
    editTrade ? Math.abs(editTrade.pips ?? 0).toString() : ""
  );
  const [notes, setNotes] = useState(editTrade?.notes ?? "");
  const [screenshotUrl, setScreenshotUrl] = useState(
    editTrade?.screenshotUrl ?? ""
  );
  const [psychologyTags, setPsychologyTags] = useState<TradePsychologyTag[]>(
    editTrade?.psychologyTags ?? []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleTag = (tag: TradePsychologyTag) => {
    setPsychologyTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!instrument.trim()) newErrors.instrument = "Instrumen wajib diisi";
    const rr = parseFloat(riskReward);
    if (isNaN(rr) || rr <= 0) newErrors.riskReward = "Masukkan rasio R:R yang valid";
    const pnlNum = parseFloat(pnl);
    if (isNaN(pnlNum)) newErrors.pnl = "Masukkan nilai PnL yang valid";
    const pipsNum = parseFloat(pips);
    if (pips && isNaN(pipsNum)) newErrors.pips = "Masukkan nilai pips yang valid";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedMethod = methods.find((m) => m.id === methodId);

    const payload: Omit<Trade, "id"> = {
      date: new Date(date).toISOString(),
      instrument: instrument.toUpperCase().trim(),
      direction,
      methodId: methodId === "none" ? null : methodId,
      methodName: selectedMethod?.name,
      riskReward: rr,
      result,
      pnl: pnlNum,
      pips: pips ? Math.abs(pipsNum) : 0,
      notes: notes.trim(),
      screenshotUrl: screenshotUrl.trim(),
      session: session || undefined,
      psychologyTags,
    };

    if (isEdit && editTrade) {
      updateTrade(editTrade.id, payload);
    } else {
      addTrade(payload);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Tanggal & Waktu"
          id="trade-date"
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="[color-scheme:dark]"
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400">Instrumen</label>
          <input
            id="trade-instrument"
            list="instruments-list"
            placeholder="cth. EURUSD"
            value={instrument}
            onChange={(e) => setInstrument(e.target.value.toUpperCase())}
            className={cn(
              "h-9 w-full rounded-lg border border-slate-700/80 bg-slate-900 px-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all",
              errors.instrument && "border-red-500/50"
            )}
          />
          <datalist id="instruments-list">
            {INSTRUMENTS.map((inst) => <option key={inst} value={inst} />)}
          </datalist>
          {errors.instrument && (
            <p className="text-xs text-red-400">{errors.instrument}</p>
          )}
        </div>
      </div>

      {/* Direction + Result */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400">Arah</label>
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
                    : "bg-slate-900 text-slate-500 border-slate-700 hover:border-slate-600"
                )}
              >
                {dir === "Buy" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {dir}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400">Hasil</label>
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
                    : "bg-slate-900 text-slate-500 border-slate-700 hover:border-slate-600"
                )}
              >
                {res === "Win" ? "Profit" : res === "Loss" ? "Loss" : "BE"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Session (Sesi Trading) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-slate-400">
          Sesi Trading
        </label>
        <div className="flex gap-2">
          {(["Asia", "London", "New York"] as TradingSession[]).map((s) => {
            const cfg = SESSION_CONFIG[s];
            return (
              <button
                key={s}
                type="button"
                id={`session-${s.toLowerCase().replace(" ", "-")}`}
                onClick={() => setSession(session === s ? "" : s)}
                className={cn(
                  "flex-1 h-9 rounded-lg text-xs font-medium transition-all border flex items-center justify-center gap-1.5",
                  session === s
                    ? cfg.color
                    : "bg-slate-900 text-slate-500 border-slate-700 hover:border-slate-600"
                )}
              >
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    session === s ? cfg.dot : "bg-slate-600"
                  )}
                />
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Method + R:R + PnL + Pips */}
      <div className="grid grid-cols-4 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400">
            Linked Method
          </label>
          <Select value={methodId} onValueChange={setMethodId}>
            <SelectTrigger id="trade-method-select">
              <SelectValue placeholder="Tanpa Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Tanpa Method</SelectItem>
              {methods.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
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
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400">
            Pips
            {result === "Loss" && (
              <span className="ml-1 text-red-400 text-[10px]">(−auto)</span>
            )}
          </label>
          <input
            id="trade-pips"
            type="number"
            step="0.1"
            min="0"
            placeholder="25"
            value={pips}
            onChange={(e) => setPips(e.target.value)}
            className={cn(
              "h-9 w-full rounded-lg border border-slate-700/80 bg-slate-900 px-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all",
              errors.pips && "border-red-500/50"
            )}
          />
          {errors.pips && (
            <p className="text-xs text-red-400">{errors.pips}</p>
          )}
        </div>
      </div>

      {/* Psychology Tags */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
          <Brain size={12} />
          Psikologi Trading
        </label>
        <div className="flex flex-wrap gap-2">
          {PSYCHOLOGY_TAGS.map((tag) => {
            const selected = psychologyTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                id={`psych-tag-${tag.replace(/\s+/g, "-").toLowerCase()}`}
                onClick={() => toggleTag(tag)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                  selected
                    ? PSYCHOLOGY_TAG_COLORS[tag]
                    : "bg-slate-900 text-slate-500 border-slate-700 hover:border-slate-600"
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-600">
          Pilih satu atau lebih tag psikologi untuk trade ini
        </p>
      </div>

      <Textarea
        label="Catatan"
        id="trade-notes"
        placeholder="Apa yang terjadi? Apa yang dilakukan dengan baik? Apa yang bisa diperbaiki?"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="min-h-[80px]"
      />
      <Input
        label="URL Screenshot (opsional)"
        id="trade-screenshot"
        type="url"
        placeholder="https://prnt.sc/..."
        value={screenshotUrl}
        onChange={(e) => setScreenshotUrl(e.target.value)}
      />

      <DialogFooter className="pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Batal
        </Button>
        <Button type="submit">
          {isEdit ? <Pencil size={14} /> : <Plus size={14} />}
          {isEdit ? "Simpan Perubahan" : "Simpan Trade"}
        </Button>
      </DialogFooter>
    </form>
  );
}

/* ─── Journal Page ─────────────────────────────────────────── */
type SortField = "date" | "instrument" | "pnl" | "result";
type SortDir = "asc" | "desc";

export default function JournalPage() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;

  const { trades, deleteTrade } = useTradingStore();

  // Modal state
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [modalAwalOpen, setModalAwalOpen] = useState(false);

  // Initial capital
  const [initialCapital, setInitialCapitalState] = useState<number>(10000);

  // Load from localStorage on mount / when user changes
  useEffect(() => {
    setInitialCapitalState(getInitialCapital(userEmail));
  }, [userEmail]);

  const handleSaveModalAwal = useCallback(
    (val: number) => {
      setInitialCapital(userEmail, val);
      setInitialCapitalState(val);
    },
    [userEmail]
  );

  // Open edit modal
  const handleEdit = (trade: Trade) => {
    setEditingTrade(trade);
    setTradeModalOpen(true);
  };

  // Close any trade modal
  const handleCloseTradeModal = () => {
    setTradeModalOpen(false);
    setEditingTrade(null);
  };

  // Table filters
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
          (t.methodName || "").toLowerCase().includes(q) ||
          (t.session || "").toLowerCase().includes(q) ||
          (t.psychologyTags ?? []).some((tag) => tag.toLowerCase().includes(q))
      );
    }

    if (filterResult !== "All") {
      filtered = filtered.filter((t) => t.result === filterResult);
    }

    filtered.sort((a, b) => {
      let cmp = 0;
      if (sortField === "date")
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortField === "instrument")
        cmp = a.instrument.localeCompare(b.instrument);
      else if (sortField === "pnl") cmp = a.pnl - b.pnl;
      else if (sortField === "result")
        cmp = a.result.localeCompare(b.result);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return filtered;
  }, [trades, search, filterResult, sortField, sortDir]);

  // Computed summary metrics
  const totalPnl = useMemo(
    () => trades.reduce((sum, t) => sum + t.pnl, 0),
    [trades]
  );
  const currentBalance = initialCapital + totalPnl;

  const filteredTotalPnl = filteredTrades.reduce((sum, t) => sum + t.pnl, 0);
  const wins = filteredTrades.filter((t) => t.result === "Win").length;
  const winRate =
    filteredTrades.length > 0 ? (wins / filteredTrades.length) * 100 : 0;
  const totalPips = useMemo(
    () => calculateTotalPips(filteredTrades),
    [filteredTrades]
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <ChevronDown size={12} className="text-slate-600" />;
    return sortDir === "asc" ? (
      <ChevronUp size={12} className="text-sky-400" />
    ) : (
      <ChevronDown size={12} className="text-sky-400" />
    );
  };

  return (
    <div className="space-y-5">
      {/* Capital Banner */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setModalAwalOpen(true)}
          className="group flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-4 hover:border-sky-500/30 hover:bg-slate-900/80 transition-all text-left"
          title="Klik untuk ubah Modal Awal"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
            <Wallet size={18} className="text-sky-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 uppercase tracking-wider">
              Modal Awal
            </p>
            <p className="text-xl font-bold text-white mt-0.5 truncate">
              ${initialCapital.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <span className="text-[10px] text-slate-600 group-hover:text-sky-400 transition-colors shrink-0">
            Edit →
          </span>
        </button>

        <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-4">
          <div
            className={cn(
              "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0",
              currentBalance >= initialCapital
                ? "bg-green-500/10 border-green-500/20"
                : "bg-red-500/10 border-red-500/20"
            )}
          >
            <DollarSign
              size={18}
              className={
                currentBalance >= initialCapital
                  ? "text-green-400"
                  : "text-red-400"
              }
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 uppercase tracking-wider">
              Saldo Saat Ini
            </p>
            <p
              className={cn(
                "text-xl font-bold mt-0.5 truncate",
                currentBalance >= initialCapital
                  ? "text-green-400"
                  : "text-red-400"
              )}
            >
              ${currentBalance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <span
            className={cn(
              "text-xs font-semibold shrink-0",
              totalPnl >= 0 ? "text-green-400" : "text-red-400"
            )}
          >
            {totalPnl >= 0 ? "+" : ""}
            {formatCurrency(totalPnl)}
          </span>
        </div>
      </div>

      {/* Summary bar (filtered) */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-slate-500">Jumlah Trade</p>
            <p className="text-xl font-bold text-white mt-0.5">
              {filteredTrades.length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-slate-500">Win Rate</p>
            <p
              className={cn(
                "text-xl font-bold mt-0.5",
                filteredTrades.length === 0
                  ? "text-slate-500"
                  : winRate >= 50
                  ? "text-green-400"
                  : "text-red-400"
              )}
            >
              {filteredTrades.length === 0 ? "0%" : formatPercent(winRate)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-slate-500">Total PnL</p>
            <p
              className={cn(
                "text-xl font-bold mt-0.5",
                filteredTrades.length === 0
                  ? "text-slate-500"
                  : filteredTotalPnl >= 0
                  ? "text-green-400"
                  : "text-red-400"
              )}
            >
              {filteredTrades.length === 0
                ? "$0.00"
                : formatCurrency(filteredTotalPnl)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Sigma size={10} />
              Total Pips
            </p>
            <p
              className={cn(
                "text-xl font-bold mt-0.5 font-mono",
                filteredTrades.length === 0
                  ? "text-slate-500"
                  : totalPips >= 0
                  ? "text-green-400"
                  : "text-red-400"
              )}
            >
              {filteredTrades.length === 0
                ? "0"
                : `${totalPips >= 0 ? "+" : ""}${totalPips.toFixed(1)}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            id="journal-search"
            type="text"
            placeholder="Cari instrumen, sesi, catatan, metode, psikologi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 rounded-lg border border-slate-700/80 bg-slate-900 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
          />
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <Filter size={14} className="text-slate-500 shrink-0" />
          {(["All", "Win", "Loss", "Breakeven"] as const).map((f) => (
            <button
              key={f}
              id={`filter-${f.toLowerCase()}`}
              onClick={() => setFilterResult(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                filterResult === f
                  ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                  : "bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-700 hover:text-white"
              )}
            >
              {f === "All" ? "Semua" : f}
            </button>
          ))}
        </div>

        {/* CSV Export */}
        <Button
          id="export-csv-btn"
          variant="outline"
          onClick={() => exportTradesToCSV(filteredTrades)}
          disabled={filteredTrades.length === 0}
          className="shrink-0"
        >
          <Download size={14} />
          Unduh CSV
        </Button>

        {/* Add Trade Button */}
        <Button
          id="add-trade-btn"
          className="shrink-0"
          onClick={() => {
            setEditingTrade(null);
            setTradeModalOpen(true);
          }}
        >
          <Plus size={16} />
          Tambah Trade
        </Button>
      </div>

      {/* Trade Modal (shared for Add + Edit) */}
      <Dialog open={tradeModalOpen} onOpenChange={handleCloseTradeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTrade ? "Edit Trade" : "Catat Trade Baru"}
            </DialogTitle>
          </DialogHeader>
          <TradeModal
            trade={editingTrade}
            onClose={handleCloseTradeModal}
          />
        </DialogContent>
      </Dialog>

      {/* Modal Awal Dialog */}
      <ModalAwalDialog
        open={modalAwalOpen}
        currentValue={initialCapital}
        onSave={handleSaveModalAwal}
        onClose={() => setModalAwalOpen(false)}
      />

      {/* Table */}
      <Card className="bg-slate-900/50 border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/80">
                <th
                  className="text-left px-4 py-3 text-xs font-medium text-slate-500 cursor-pointer hover:text-slate-300 select-none"
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center gap-1">
                    Tanggal <SortIcon field="date" />
                  </div>
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-medium text-slate-500 cursor-pointer hover:text-slate-300 select-none"
                  onClick={() => handleSort("instrument")}
                >
                  <div className="flex items-center gap-1">
                    Instrumen <SortIcon field="instrument" />
                  </div>
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">
                  Sesi
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">
                  Arah
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 hidden lg:table-cell">
                  Metode
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-500">
                  R:R
                </th>
                <th
                  className="text-center px-4 py-3 text-xs font-medium text-slate-500 cursor-pointer hover:text-slate-300 select-none"
                  onClick={() => handleSort("result")}
                >
                  <div className="flex items-center justify-center gap-1">
                    Hasil <SortIcon field="result" />
                  </div>
                </th>
                <th
                  className="text-right px-4 py-3 text-xs font-medium text-slate-500 cursor-pointer hover:text-slate-300 select-none"
                  onClick={() => handleSort("pnl")}
                >
                  <div className="flex items-center justify-end gap-1">
                    PnL <SortIcon field="pnl" />
                  </div>
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500">
                  Pips
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 hidden xl:table-cell">
                  Psikologi
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 hidden xl:table-cell">
                  Catatan
                </th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 text-center">
                  Lampiran
                </th>
                <th className="px-4 py-3 w-16" />
              </tr>
            </thead>
            <tbody>
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={13} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                        <ScrollText size={18} className="text-slate-600" />
                      </div>
                      <p className="text-sm text-slate-500 font-medium">
                        {search || filterResult !== "All"
                          ? "Tidak ada trade yang sesuai filter"
                          : "Belum ada data jurnal. Silakan tambah trade pertama Anda."}
                      </p>
                      {!search && filterResult === "All" && (
                        <p className="text-xs text-slate-600">
                          Klik &quot;Tambah Trade&quot; untuk mulai mencatat
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTrades.map((trade) => {
                  const pipDisplay =
                    trade.result === "Loss"
                      ? -(trade.pips ?? 0)
                      : trade.pips ?? 0;
                  return (
                    <tr
                      key={trade.id}
                      className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors last:border-0 group"
                    >
                      {/* Date */}
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                        {formatDateTime(trade.date)}
                      </td>

                      {/* Instrument */}
                      <td className="px-4 py-3">
                        <span className="font-mono font-semibold text-white text-sm">
                          {trade.instrument}
                        </span>
                      </td>

                      {/* Session badge */}
                      <td className="px-4 py-3">
                        {trade.session ? (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border",
                              SESSION_CONFIG[trade.session].color
                            )}
                          >
                            <span
                              className={cn(
                                "w-1 h-1 rounded-full",
                                SESSION_CONFIG[trade.session].dot
                              )}
                            />
                            {SESSION_CONFIG[trade.session].label}
                          </span>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>

                      {/* Direction */}
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            trade.direction === "Buy" ? "buy" : "sell"
                          }
                          className="text-[10px]"
                        >
                          {trade.direction === "Buy" ? (
                            <TrendingUp size={9} />
                          ) : (
                            <TrendingDown size={9} />
                          )}
                          {trade.direction}
                        </Badge>
                      </td>

                      {/* Method */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-slate-400 line-clamp-1">
                          {trade.methodName || (
                            <span className="text-slate-600">—</span>
                          )}
                        </span>
                      </td>

                      {/* R:R */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs text-slate-300 font-mono">
                          1:{trade.riskReward}
                        </span>
                      </td>

                      {/* Result */}
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={
                            trade.result === "Win"
                              ? "win"
                              : trade.result === "Loss"
                              ? "loss"
                              : "breakeven"
                          }
                          className="text-[10px]"
                        >
                          {trade.result === "Win" ? (
                            <TrendingUp size={9} />
                          ) : trade.result === "Loss" ? (
                            <TrendingDown size={9} />
                          ) : (
                            <Minus size={9} />
                          )}
                          {trade.result}
                        </Badge>
                      </td>

                      {/* PnL */}
                      <td className="px-4 py-3 text-right">
                        <span
                          className={cn(
                            "text-sm font-bold font-mono",
                            trade.pnl > 0
                              ? "text-green-400"
                              : trade.pnl < 0
                              ? "text-red-400"
                              : "text-slate-500"
                          )}
                        >
                          {trade.pnl > 0 ? "+" : ""}${trade.pnl}
                        </span>
                      </td>

                      {/* Pips */}
                      <td className="px-4 py-3 text-right">
                        <span
                          className={cn(
                            "text-xs font-mono",
                            pipDisplay > 0
                              ? "text-green-400"
                              : pipDisplay < 0
                              ? "text-red-400"
                              : "text-slate-500"
                          )}
                        >
                          {pipDisplay === 0
                            ? "—"
                            : `${pipDisplay > 0 ? "+" : ""}${pipDisplay}`}
                        </span>
                      </td>

                      {/* Psychology Tags */}
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {(trade.psychologyTags ?? []).length === 0 ? (
                            <span className="text-slate-600 text-xs">—</span>
                          ) : (
                            (trade.psychologyTags ?? []).map((tag) => (
                              <span
                                key={tag}
                                className={cn(
                                  "inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium border",
                                  PSYCHOLOGY_TAG_COLORS[tag]
                                )}
                              >
                                {tag}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      {/* Notes */}
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <span className="text-xs text-slate-500 line-clamp-1">
                          {trade.notes || "—"}
                        </span>
                      </td>

                      {/* Screenshot link */}
                      <td className="px-4 py-3 text-center">
                        {trade.screenshotUrl ? (
                          <a
                            href={trade.screenshotUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Buka screenshot"
                            className="inline-flex items-center justify-center w-6 h-6 rounded-md text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition-all"
                          >
                            <ExternalLink size={13} />
                          </a>
                        ) : (
                          <span className="text-slate-700 text-xs">—</span>
                        )}
                      </td>

                      {/* Actions: Edit + Delete */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            id={`edit-trade-${trade.id}`}
                            onClick={() => handleEdit(trade)}
                            className="text-slate-600 hover:text-sky-400 transition-colors"
                            aria-label="Edit trade"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            id={`delete-trade-${trade.id}`}
                            onClick={() => deleteTrade(trade.id)}
                            className="text-slate-600 hover:text-red-400 transition-colors"
                            aria-label="Hapus trade"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
