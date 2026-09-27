"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, Clock, Globe, Search } from "lucide-react";
import { mockNews } from "@/data/mockNews";
import { EconomicEvent, ImpactLevel } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ImpactIcon = ({
  impact,
  size = 14,
}: {
  impact: ImpactLevel;
  size?: number;
}) => {
  if (impact === "High") {
    return (
      <div className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 rounded-sm bg-red-500"
            style={{ height: `${8 + i * 3}px`, alignSelf: "flex-end" }}
          />
        ))}
      </div>
    );
  }
  if (impact === "Medium") {
    return (
      <div className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "w-1.5 rounded-sm",
              i < 2 ? "bg-orange-500" : "bg-zinc-700"
            )}
            style={{ height: `${8 + i * 3}px`, alignSelf: "flex-end" }}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "w-1.5 rounded-sm",
            i < 1 ? "bg-yellow-500" : "bg-zinc-700"
          )}
          style={{ height: `${8 + i * 3}px`, alignSelf: "flex-end" }}
        />
      ))}
    </div>
  );
};

const CurrencyFlag: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  JPY: "🇯🇵",
  AUD: "🇦🇺",
  CAD: "🇨🇦",
  CHF: "🇨🇭",
  NZD: "🇳🇿",
  CNY: "🇨🇳",
};

function DataCell({
  value,
  label,
}: {
  value?: string;
  label: string;
}) {
  return (
    <div className="text-center min-w-[60px]">
      <p className="text-[10px] text-zinc-600 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p
        className={cn(
          "text-sm font-medium",
          value ? "text-zinc-200" : "text-zinc-700"
        )}
      >
        {value || "—"}
      </p>
    </div>
  );
}

const NOW_HOUR = new Date().getHours();

function EventRow({ event, index }: { event: EconomicEvent; index: number }) {
  const hour = parseInt(event.time.split(":")[0]);
  const isPast = event.actual !== undefined;
  const isUpcoming = !isPast && hour >= NOW_HOUR && hour < NOW_HOUR + 2;

  return (
    <tr
      className={cn(
        "border-b border-zinc-800/40 transition-colors",
        isPast ? "opacity-50" : "hover:bg-zinc-800/20",
        isUpcoming && "bg-sky-500/5 border-l-2 border-l-sky-500/50"
      )}
    >
      {/* Time */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          {isUpcoming && (
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse shrink-0" />
          )}
          <span
            className={cn(
              "text-sm font-mono font-semibold",
              isUpcoming ? "text-sky-400" : "text-zinc-300"
            )}
          >
            {event.time}
          </span>
        </div>
      </td>

      {/* Currency */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">
            {CurrencyFlag[event.currency] || "🌐"}
          </span>
          <span className="text-sm font-bold text-white font-mono">
            {event.currency}
          </span>
        </div>
      </td>

      {/* Impact */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <ImpactIcon impact={event.impact} />
          <span
            className={cn(
              "text-xs font-medium hidden sm:block",
              event.impact === "High"
                ? "text-red-400"
                : event.impact === "Medium"
                ? "text-orange-400"
                : "text-yellow-400"
            )}
          >
            {event.impact}
          </span>
        </div>
      </td>

      {/* Event Name */}
      <td className="px-4 py-3 min-w-[200px]">
        <p className="text-sm text-white font-medium">{event.event}</p>
        {isPast && (
          <p className="text-[10px] text-green-400 mt-0.5">✓ Released</p>
        )}
        {isUpcoming && (
          <p className="text-[10px] text-sky-400 mt-0.5">⚡ Upcoming soon</p>
        )}
      </td>

      {/* Forecast */}
      <td className="px-4 py-3 hidden md:table-cell">
        <DataCell value={event.forecast} label="Forecast" />
      </td>

      {/* Previous */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <DataCell value={event.previous} label="Previous" />
      </td>

      {/* Actual */}
      <td className="px-4 py-3 hidden md:table-cell">
        <div className="text-center min-w-[60px]">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wide mb-0.5">
            Actual
          </p>
          <p
            className={cn(
              "text-sm font-bold",
              event.actual ? "text-green-400" : "text-zinc-700"
            )}
          >
            {event.actual || "—"}
          </p>
        </div>
      </td>
    </tr>
  );
}

export default function NewsPage() {
  const [search, setSearch] = useState("");
  const [filterImpact, setFilterImpact] = useState<ImpactLevel | "All">("All");
  const [filterCurrency, setFilterCurrency] = useState("All");

  const currencies = useMemo(
    () => ["All", ...new Set(mockNews.map((e) => e.currency))],
    []
  );

  const filteredEvents = useMemo(() => {
    let events = [...mockNews];

    if (search) {
      const q = search.toLowerCase();
      events = events.filter(
        (e) =>
          e.event.toLowerCase().includes(q) ||
          e.currency.toLowerCase().includes(q)
      );
    }
    if (filterImpact !== "All") {
      events = events.filter((e) => e.impact === filterImpact);
    }
    if (filterCurrency !== "All") {
      events = events.filter((e) => e.currency === filterCurrency);
    }

    return events.sort((a, b) => a.time.localeCompare(b.time));
  }, [search, filterImpact, filterCurrency]);

  const highImpact = mockNews.filter((e) => e.impact === "High").length;
  const released = mockNews.filter((e) => e.actual !== undefined).length;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-5">
      {/* Header info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <Clock size={14} className="text-sky-400" />
          <span>{today}</span>
          <span className="text-zinc-700">·</span>
          <span className="text-red-400 font-medium">{highImpact} high impact</span>
          <span className="text-zinc-700">·</span>
          <span className="text-green-400">{released} released</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-600">
          <Globe size={12} />
          Data: Forex Factory (Simulated)
        </div>
      </div>

      {/* Impact legend */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <ImpactIcon impact="High" />
          <span>High Impact</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <ImpactIcon impact="Medium" />
          <span>Medium Impact</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <ImpactIcon impact="Low" />
          <span>Low Impact</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-sky-400 ml-auto">
          <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          Upcoming soon
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            id="news-search"
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 rounded-lg border border-zinc-700/80 bg-zinc-900 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
          />
        </div>

        <div className="flex gap-1.5 items-center flex-wrap">
          {(["All", "High", "Medium", "Low"] as const).map((f) => (
            <button
              key={f}
              id={`impact-filter-${f.toLowerCase()}`}
              onClick={() => setFilterImpact(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                filterImpact === f
                  ? f === "High"
                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                    : f === "Medium"
                    ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                    : f === "Low"
                    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    : "bg-sky-500/10 text-sky-400 border-sky-500/30"
                  : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-white"
              )}
            >
              {f}
            </button>
          ))}

          <div className="h-5 w-px bg-zinc-800 mx-1" />

          {currencies.map((c) => (
            <button
              key={c}
              id={`currency-filter-${c.toLowerCase()}`}
              onClick={() => setFilterCurrency(c)}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all border",
                filterCurrency === c
                  ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                  : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-white"
              )}
            >
              {c === "All" ? "All" : (CurrencyFlag[c] || "") + " " + c}
            </button>
          ))}
        </div>
      </div>

      {/* Events table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/80">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                  Time
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                  Currency
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                  Impact
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                  Event
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-zinc-500 hidden md:table-cell">
                  Forecast
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-zinc-500 hidden lg:table-cell">
                  Previous
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-zinc-500 hidden md:table-cell">
                  Actual
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-16 text-zinc-600 text-sm"
                  >
                    No events match your filters
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event, index) => (
                  <EventRow key={event.id} event={event} index={index} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        <div className="px-4 py-3 border-t border-zinc-800/40 flex items-center gap-2 text-xs text-zinc-600">
          <AlertTriangle size={12} className="text-yellow-500/60" />
          This is simulated economic calendar data for demonstration purposes.
        </div>
      </Card>
    </div>
  );
}
