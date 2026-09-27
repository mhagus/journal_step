"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  ScrollText,
  BarChart3,
  Newspaper,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTradingStore } from "@/store/tradingStore";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/methods",
    label: "Methods & Plan",
    icon: BookOpen,
  },
  {
    href: "/journal",
    label: "Trading Journal",
    icon: ScrollText,
  },
  {
    href: "/evaluation",
    label: "Evaluation",
    icon: BarChart3,
  },
  {
    href: "/news",
    label: "Economic News",
    icon: Newspaper,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useTradingStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile hamburger */}
      <button
        id="mobile-menu-btn"
        className="fixed top-4 left-4 z-50 lg:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-sky-500/50 transition-all"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full z-40 flex flex-col bg-[#0a0a0c] border-r border-zinc-800/60 sidebar-transition",
          // Desktop
          "hidden lg:flex",
          sidebarCollapsed ? "lg:w-16" : "lg:w-60",
          // Mobile
          mobileOpen
            ? "flex w-72"
            : "hidden"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center h-16 px-4 border-b border-zinc-800/60 shrink-0",
            sidebarCollapsed ? "justify-center" : "justify-between"
          )}
        >
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 shrink-0">
              <TrendingUp size={16} className="text-sky-400" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <span className="block text-sm font-bold text-white tracking-tight truncate">
                  Step Traders
                </span>
                <span className="block text-[10px] text-zinc-500 truncate">
                  Trading Journal
                </span>
              </div>
            )}
          </Link>
          {!sidebarCollapsed && (
            <button
              id="sidebar-collapse-btn"
              onClick={toggleSidebar}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={14} />
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/60",
                  sidebarCollapsed && "justify-center px-2"
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon
                  size={18}
                  className={cn(
                    "shrink-0 transition-colors",
                    isActive
                      ? "text-sky-400"
                      : "text-zinc-500 group-hover:text-white"
                  )}
                />
                {!sidebarCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
                {isActive && !sidebarCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer - expand button when collapsed */}
        {sidebarCollapsed && (
          <div className="p-2 border-t border-zinc-800/60">
            <button
              id="sidebar-expand-btn"
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center py-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
              aria-label="Expand sidebar"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Bottom section */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-zinc-800/60 shrink-0">
            <div className="rounded-lg bg-sky-500/5 border border-sky-500/10 p-3">
              <p className="text-xs text-zinc-400 leading-relaxed">
                <span className="text-sky-400 font-medium">Pro Tip:</span>{" "}
                Track every trade to build your statistical edge.
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
