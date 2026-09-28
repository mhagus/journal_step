"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Bell,
  LogIn,
  LogOut,
  User,
  Pencil,
  Check,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Page title map (Indonesian) ─────────────────────────── */
const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Dashboard",
    subtitle: "Ringkasan performa trading Anda",
  },
  "/methods": {
    title: "Methods & Trading Plan",
    subtitle: "Strategi, aturan, dan edge trading Anda",
  },
  "/journal": {
    title: "Jurnal Trading",
    subtitle: "Catat dan tinjau setiap trade",
  },
  "/evaluation": {
    title: "Evaluasi & Analitik",
    subtitle: "Analisis performa mendalam",
  },
  "/news": {
    title: "Berita Ekonomi",
    subtitle: "Kalender ekonomi dan event pasar",
  },
};

/* ─── Edit Profile Modal ─────────────────────────────────── */
function EditProfileModal({
  open,
  onClose,
  currentName,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  currentName: string;
  onSave: (name: string) => void;
}) {
  const [value, setValue] = useState(currentName);

  useEffect(() => {
    setValue(currentName);
  }, [currentName, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Edit profil"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl shadow-black/60 animate-float-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white">Pengaturan Akun</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
            aria-label="Tutup"
          >
            <X size={14} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="edit-username"
              className="text-xs font-medium text-slate-400 block mb-1.5"
            >
              Nama Pengguna
            </label>
            <input
              id="edit-username"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Masukkan nama pengguna"
              maxLength={40}
              className="w-full h-10 rounded-xl border border-slate-700/80 bg-slate-800 px-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
            />
            <p className="text-[10px] text-slate-600 mt-1.5">
              Nama ini menggantikan nama Google Anda di tampilan UI. Akan terhubung ke database di versi mendatang.
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            id="cancel-profile-btn"
            onClick={onClose}
            className="flex-1 h-9 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-medium transition-all hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            id="save-profile-btn"
            onClick={() => { onSave(value.trim() || currentName); onClose(); }}
            disabled={!value.trim()}
            className="flex-1 h-9 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20"
          >
            <Check size={14} />
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── User Avatar Dropdown ───────────────────────────────── */
function UserMenu({
  displayName,
  onEditProfile,
}: {
  displayName: string;
  onEditProfile: () => void;
}) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!session) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        id="user-menu-btn"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-800/60 transition-all group"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {session.user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt={displayName}
            className="w-8 h-8 rounded-full border border-slate-700 group-hover:border-sky-500/40 transition-all"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
            <span className="text-xs font-bold text-sky-400">
              {displayName[0]?.toUpperCase() ?? "T"}
            </span>
          </div>
        )}
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-white leading-tight max-w-[120px] truncate">
            {displayName}
          </p>
          <p className="text-[10px] text-slate-500 leading-tight truncate max-w-[120px]">
            {session.user?.email}
          </p>
        </div>
        <ChevronDown
          size={12}
          className={cn(
            "text-slate-500 transition-transform hidden sm:block",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-xl shadow-black/40 py-1 z-50 animate-float-in">
          <div className="px-3 py-2 border-b border-slate-800/60">
            <p className="text-xs font-semibold text-white truncate">{displayName}</p>
            <p className="text-[10px] text-slate-500 truncate">{session.user?.email}</p>
          </div>
          <button
            id="edit-profile-menu-btn"
            onClick={() => { setOpen(false); onEditProfile(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
          >
            <Pencil size={13} />
            Pengaturan Akun
          </button>
          <div className="border-t border-slate-800/60 my-1" />
          <button
            id="topbar-logout-btn"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={13} />
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Topbar ─────────────────────────────────────────────── */
export function Topbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isGuest = !session;

  const pageInfo = pageTitles[pathname] ?? {
    title: "Step Traders",
    subtitle: "",
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Custom username — localStorage override, falls back to session name
  const sessionName = session?.user?.name ?? "Trader";
  const storageKey = `step-traders-username-${session?.user?.email ?? "guest"}`;

  const [displayName, setDisplayName] = useState(sessionName);
  const [editOpen, setEditOpen] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined" && session?.user?.email) {
      const saved = localStorage.getItem(storageKey);
      setDisplayName(saved ?? sessionName);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email]);

  const handleSaveName = (name: string) => {
    setDisplayName(name);
    if (typeof window !== "undefined" && session?.user?.email) {
      localStorage.setItem(storageKey, name);
    }
  };

  return (
    <>
      <header className="h-16 flex items-center justify-between px-6 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm shrink-0 sticky top-0 z-30">
        {/* Left - Page info */}
        <div className="pl-10 lg:pl-0">
          <h1 className="text-base font-semibold text-white leading-tight">
            {pageInfo.title}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            {pageInfo.subtitle}
          </p>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          {/* Date badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span>{dateStr}</span>
          </div>

          {/* Notification bell */}
          <button
            id="notifications-btn"
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-sky-500/40 transition-all relative"
            aria-label="Notifikasi"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-sky-400" />
          </button>

          {/* Auth state */}
          {status === "loading" ? (
            <div className="w-20 h-8 rounded-lg bg-slate-800 animate-pulse" />
          ) : isGuest ? (
            <button
              id="topbar-login-btn"
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20 hover:border-sky-500/50 text-xs font-semibold transition-all"
            >
              <LogIn size={14} />
              <span className="hidden sm:inline">Masuk</span>
            </button>
          ) : (
            <UserMenu
              displayName={displayName}
              onEditProfile={() => setEditOpen(true)}
            />
          )}
        </div>
      </header>

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        currentName={displayName}
        onSave={handleSaveName}
      />
    </>
  );
}
