"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  ScrollText,
  BarChart3,
  Newspaper,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogIn,
  LogOut,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTradingStore } from "@/store/tradingStore";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    guestAllowed: true,
  },
  {
    href: "/methods",
    label: "Methods & Plan",
    icon: BookOpen,
    guestAllowed: false,
  },
  {
    href: "/journal",
    label: "Trading Journal",
    icon: ScrollText,
    guestAllowed: false,
  },
  {
    href: "/evaluation",
    label: "Evaluasi",
    icon: BarChart3,
    guestAllowed: false,
  },
  {
    href: "/news",
    label: "Berita Ekonomi",
    icon: Newspaper,
    guestAllowed: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isGuest = !session;
  const { sidebarCollapsed, toggleSidebar } = useTradingStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleGuestNavClick = (e: React.MouseEvent, guestAllowed: boolean) => {
    if (isGuest && !guestAllowed) {
      e.preventDefault();
      signIn("google", { callbackUrl: "/" });
    }
  };

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
        className="fixed top-4 left-4 z-50 lg:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-sky-500/50 transition-all"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full z-40 flex flex-col bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/60 sidebar-transition",
          // Desktop
          "hidden lg:flex",
          sidebarCollapsed ? "lg:w-16" : "lg:w-60",
          // Mobile
          mobileOpen ? "flex w-72" : "hidden"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center h-16 px-4 border-b border-slate-800/60 shrink-0",
            sidebarCollapsed ? "justify-center" : "justify-between"
          )}
        >
          <Link href="/" className="flex items-center gap-3 min-w-0">
            {sidebarCollapsed ? (
              /* Collapsed: show square icon only */
              <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-sky-500/20">
                <Image
                  src="/icon.jpg"
                  alt="Step Traders"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            ) : (
              /* Expanded: show full logo */
              <div className="relative h-8 w-36 shrink-0">
                <Image
                  src="/logo.jpg"
                  alt="Step Traders"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            )}
          </Link>
          {!sidebarCollapsed && (
            <button
              id="sidebar-collapse-btn"
              onClick={toggleSidebar}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
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
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(item.href);
            const isLocked = isGuest && !item.guestAllowed;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={(e) => handleGuestNavClick(e, item.guestAllowed)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative",
                  isActive
                    ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                    : isLocked
                    ? "text-slate-600 hover:text-slate-400 hover:bg-slate-800/40 cursor-pointer"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60",
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
                      : isLocked
                      ? "text-slate-600 group-hover:text-slate-500"
                      : "text-slate-500 group-hover:text-white"
                  )}
                />
                {!sidebarCollapsed && (
                  <span className="truncate flex-1">{item.label}</span>
                )}
                {isLocked && !sidebarCollapsed && (
                  <Lock size={11} className="text-slate-600 shrink-0" />
                )}
                {isActive && !sidebarCollapsed && !isLocked && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Expand button when collapsed */}
        {sidebarCollapsed && (
          <div className="p-2 border-t border-slate-800/60">
            <button
              id="sidebar-expand-btn"
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center py-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
              aria-label="Expand sidebar"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Bottom — Login/Logout */}
        {!sidebarCollapsed && (
          <div className="p-3 border-t border-slate-800/60 shrink-0 space-y-2">
            {status === "loading" ? (
              <div className="h-10 rounded-lg bg-slate-800/50 animate-pulse" />
            ) : isGuest ? (
              <button
                id="sidebar-login-btn"
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 hover:border-sky-500/50 transition-all text-sm font-medium group"
              >
                <LogIn size={16} className="shrink-0" />
                <span className="truncate">Masuk / Login</span>
                <svg className="w-3.5 h-3.5 ml-auto shrink-0" viewBox="0 0 24 24" aria-hidden>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </button>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 px-2 py-1.5">
                  {session.user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={session.user.image}
                      alt={session.user.name ?? "Avatar"}
                      className="w-7 h-7 rounded-full border border-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-sky-400">
                        {(session.user?.name ?? "T")[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">{session.user?.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{session.user?.email}</p>
                  </div>
                </div>
                <button
                  id="sidebar-logout-btn"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
                >
                  <LogOut size={14} className="shrink-0" />
                  <span className="truncate">Keluar</span>
                </button>
              </div>
            )}

            {/* Pro tip for guests */}
            {isGuest && (
              <p className="text-[10px] text-slate-600 text-center px-2 leading-relaxed">
                Mode Tamu — data tidak tersimpan
              </p>
            )}
          </div>
        )}

        {/* Collapsed bottom — login/logout icon */}
        {sidebarCollapsed && (
          <div className="p-2 border-t border-slate-800/60">
            {isGuest ? (
              <button
                id="sidebar-login-icon-btn"
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="w-full flex items-center justify-center py-2 rounded-lg text-sky-400 hover:bg-sky-500/10 transition-all"
                aria-label="Login"
                title="Masuk / Login"
              >
                <LogIn size={16} />
              </button>
            ) : (
              <button
                id="sidebar-logout-icon-btn"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center justify-center py-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                aria-label="Keluar"
                title="Keluar"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
