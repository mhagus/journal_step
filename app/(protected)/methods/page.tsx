"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ListChecks,
  Percent,
  Tag,
} from "lucide-react";
import { useTradingStore } from "@/store/tradingStore";
import { TradingMethod } from "@/types";
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
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";

function AddMethodModal({ onClose }: { onClose: () => void }) {
  const { addMethod } = useTradingStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState<string[]>([""]);
  const [riskPercent, setRiskPercent] = useState("1");
  const [tags, setTags] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addRule = () => setRules([...rules, ""]);
  const updateRule = (index: number, value: string) => {
    const updated = [...rules];
    updated[index] = value;
    setRules(updated);
  };
  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Strategy name is required";
    if (!description.trim()) newErrors.description = "Description is required";
    const risk = parseFloat(riskPercent);
    if (isNaN(risk) || risk <= 0 || risk > 10)
      newErrors.riskPercent = "Risk must be between 0.1% and 10%";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addMethod({
      name: name.trim(),
      description: description.trim(),
      rules: rules.filter((r) => r.trim() !== ""),
      riskPercent: risk,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Strategy Name"
        id="method-name"
        placeholder="e.g., SMC - Smart Money Concepts"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
      />
      <Textarea
        label="Description"
        id="method-description"
        placeholder="Describe the core concept of this strategy..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors.description}
        className="min-h-[90px]"
      />

      {/* Rules */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
          <ListChecks size={12} />
          Trading Rules / Checklist
        </label>
        <div className="space-y-2">
          {rules.map((rule, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-xs text-zinc-600 w-5 shrink-0 text-center">
                {index + 1}.
              </span>
              <input
                type="text"
                value={rule}
                onChange={(e) => updateRule(index, e.target.value)}
                placeholder={`Rule ${index + 1}...`}
                className="flex-1 h-8 rounded-md border border-zinc-700/80 bg-zinc-900 px-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
              />
              {rules.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRule(index)}
                  className="text-zinc-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addRule}
          className="text-sky-400 hover:text-sky-300 text-xs"
        >
          <Plus size={12} />
          Add Rule
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Risk % per Trade"
          id="method-risk"
          type="number"
          step="0.1"
          min="0.1"
          max="10"
          placeholder="1.0"
          value={riskPercent}
          onChange={(e) => setRiskPercent(e.target.value)}
          error={errors.riskPercent}
          leftIcon={<Percent size={12} />}
        />
        <Input
          label="Tags (comma-separated)"
          id="method-tags"
          placeholder="SMC, Zones, H4"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          leftIcon={<Tag size={12} />}
        />
      </div>

      <DialogFooter className="pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          <Plus size={14} />
          Save Strategy
        </Button>
      </DialogFooter>
    </form>
  );
}

function MethodCard({ method }: { method: TradingMethod }) {
  const { deleteMethod, trades } = useTradingStore();
  const [expanded, setExpanded] = useState(false);

  const methodTrades = trades.filter((t) => t.methodId === method.id);
  const wins = methodTrades.filter((t) => t.result === "Win").length;
  const winRate =
    methodTrades.length > 0
      ? ((wins / methodTrades.length) * 100).toFixed(1)
      : "N/A";
  const totalPnl = methodTrades.reduce((sum, t) => sum + t.pnl, 0);

  return (
    <Card className="hover:border-zinc-700/80 transition-all duration-200">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              <BookOpen size={16} className="text-sky-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-white truncate">
                {method.name}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                {method.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id={`expand-method-${method.id}`}
              onClick={() => setExpanded(!expanded)}
              className="text-zinc-500 hover:text-white transition-colors p-1"
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <button
              id={`delete-method-${method.id}`}
              onClick={() => deleteMethod(method.id)}
              className="text-zinc-600 hover:text-red-400 transition-colors p-1"
              aria-label="Delete method"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-zinc-800/60">
          <div className="text-center">
            <p className="text-xs text-zinc-500">Risk/Trade</p>
            <p className="text-sm font-bold text-white mt-0.5">
              {method.riskPercent}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-zinc-500">Trades</p>
            <p className="text-sm font-bold text-white mt-0.5">
              {methodTrades.length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-zinc-500">Win Rate</p>
            <p
              className={cn(
                "text-sm font-bold mt-0.5",
                winRate !== "N/A" && parseFloat(winRate) >= 50
                  ? "text-green-400"
                  : winRate !== "N/A"
                  ? "text-red-400"
                  : "text-zinc-500"
              )}
            >
              {winRate === "N/A" ? "—" : `${winRate}%`}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-zinc-500">Total PnL</p>
            <p
              className={cn(
                "text-sm font-bold mt-0.5",
                totalPnl > 0
                  ? "text-green-400"
                  : totalPnl < 0
                  ? "text-red-400"
                  : "text-zinc-500"
              )}
            >
              {methodTrades.length === 0
                ? "—"
                : `${totalPnl > 0 ? "+" : ""}$${totalPnl}`}
            </p>
          </div>
        </div>

        {/* Tags */}
        {method.tags && method.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {method.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px] py-0">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Rules (expanded) */}
        {expanded && method.rules.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-800/60">
            <p className="text-xs font-semibold text-zinc-400 mb-2.5 flex items-center gap-1.5">
              <ListChecks size={12} />
              Trading Rules
            </p>
            <ol className="space-y-1.5">
              {method.rules.map((rule, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-xs text-sky-400 font-mono font-bold w-4 shrink-0 mt-px">
                    {i + 1}.
                  </span>
                  <span className="text-xs text-zinc-300 leading-relaxed">
                    {rule}
                  </span>
                </li>
              ))}
            </ol>
            <p className="text-[10px] text-zinc-600 mt-3">
              Created {formatDate(method.createdAt)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function MethodsPage() {
  const { methods } = useTradingStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500">
            {methods.length} active strateg{methods.length === 1 ? "y" : "ies"}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button id="add-method-btn">
              <Plus size={16} />
              New Strategy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Create Trading Strategy</DialogTitle>
            </DialogHeader>
            <AddMethodModal onClose={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Methods grid */}
      {methods.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
            <BookOpen size={24} className="text-zinc-600" />
          </div>
          <h3 className="text-base font-semibold text-zinc-300 mb-1">
            No strategies yet
          </h3>
          <p className="text-sm text-zinc-600 max-w-xs">
            Create your first trading strategy to start linking trades and
            tracking performance.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {methods.map((method) => (
            <MethodCard key={method.id} method={method} />
          ))}
        </div>
      )}
    </div>
  );
}
