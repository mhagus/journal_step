"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Your trading overview at a glance",
  },
  "/methods": {
    title: "Methods & Trading Plan",
    subtitle: "Your strategies, rules, and edge",
  },
  "/journal": {
    title: "Trading Journal",
    subtitle: "Log and review every trade",
  },
  "/evaluation": {
    title: "Evaluation & Analytics",
    subtitle: "Deep performance analysis",
  },
  "/news": {
    title: "Economic News",
    subtitle: "Market-moving economic events",
  },
};

export function Topbar() {
  const pathname = usePathname();
  const pageInfo = pageTitles[pathname] || {
    title: "Step Traders",
    subtitle: "",
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-zinc-800/60 bg-[#09090b]/80 backdrop-blur-sm shrink-0 sticky top-0 z-30">
      {/* Left - Page info (mobile has offset for hamburger) */}
      <div className="pl-10 lg:pl-0">
        <h1 className="text-base font-semibold text-white leading-tight">
          {pageInfo.title}
        </h1>
        <p className="text-xs text-zinc-500 hidden sm:block">
          {pageInfo.subtitle}
        </p>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        {/* Date badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span>{dateStr}</span>
        </div>

        {/* Notification bell */}
        <button
          id="notifications-btn"
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-sky-500/40 transition-all relative"
          aria-label="Notifications"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-sky-400" />
        </button>
      </div>
    </header>
  );
}
