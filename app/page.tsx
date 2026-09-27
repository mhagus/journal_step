"use client";

import { useState, useTransition, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { TrendingUp, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, BarChart3, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
  { icon: BarChart3, label: "Analytics Dashboard", desc: "Equity curves, win rates & drawdown analysis" },
  { icon: Target,   label: "Trade Journal",        desc: "Log every trade with full context & notes" },
  { icon: Zap,      label: "Strategy Tracker",     desc: "Measure which methods give you the best edge" },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const urlError = searchParams.get("error");

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(
    urlError === "CredentialsSignin" ? "Invalid email or password." : null
  );
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();

  const handleCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      if (res?.error) {
        setError("Invalid email or password. Try trader@steptraders.com / demo1234");
      } else if (res?.ok) {
        setSuccess(true);
        setTimeout(() => router.push(callbackUrl), 600);
      }
    });
  };

  const handleGoogle = () => {
    startGoogleTransition(async () => {
      await signIn("google", { callbackUrl });
    });
  };

  return (
    <div className="relative min-h-screen w-full flex overflow-hidden bg-[#020617]">

      {/* ── Ambient Orbs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="orb-animate absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-sky-500/10 blur-[120px]" />
        <div className="orb-animate-slow absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full bg-blue-600/8 blur-[100px]" />
        <div className="orb-animate absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-cyan-500/6 blur-[100px]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(56,189,248,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.6) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* ── Left Panel — Hero ── */}
      <div className="hidden lg:flex flex-col justify-between flex-1 p-12 relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/25 glow-blue">
            <TrendingUp size={20} className="text-sky-400" />
          </div>
          <span className="text-lg font-bold gradient-text">Step Traders</span>
        </div>

        {/* Headline */}
        <div className="space-y-8">
          <div>
            <h1 className="text-5xl font-extrabold leading-tight text-white">
              Trade smarter.{" "}
              <span className="gradient-text-hero block">Track everything.</span>
            </h1>
            <p className="mt-4 text-lg text-slate-400 max-w-md leading-relaxed">
              A professional-grade trading journal built for serious traders.
              Analyse your edge, identify your weaknesses, and grow your account consistently.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3.5">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/15 shrink-0 mt-0.5">
                  <Icon size={16} className="text-sky-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-6 pt-4 border-t border-slate-800">
            {[
              { val: "66.7%", label: "Avg Win Rate" },
              { val: "+$2.1k", label: "Avg Monthly PnL" },
              { val: "1:2.7", label: "Risk/Reward" },
            ].map(({ val, label }) => (
              <div key={label}>
                <p className="text-xl font-bold text-sky-400">{val}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} Step Traders · Professional Trading Journal
        </p>
      </div>

      {/* ── Right Panel — Auth Form ── */}
      <div className="flex items-center justify-center w-full lg:w-[480px] shrink-0 p-6 relative z-10">
        <div className="w-full max-w-sm space-y-7 animate-float-in">

          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-3 lg:hidden mb-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/25 glow-blue">
              <TrendingUp size={18} className="text-sky-400" />
            </div>
            <span className="text-base font-bold gradient-text">Step Traders</span>
          </div>

          {/* Card */}
          <div className="glass-card-dark rounded-2xl p-7 shadow-2xl shadow-black/60 border border-slate-800/80">

            {/* Title */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">
                {mode === "login" ? "Welcome back" : "Create account"}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {mode === "login"
                  ? "Sign in to your trading journal"
                  : "Start tracking your trades today"}
              </p>
            </div>

            {/* Status messages */}
            {error && (
              <div className="mb-4 flex items-start gap-2.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3.5 py-3 text-sm text-red-400">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-4 flex items-center gap-2.5 rounded-lg bg-green-500/10 border border-green-500/20 px-3.5 py-3 text-sm text-green-400">
                <CheckCircle2 size={15} />
                <span>Signing you in…</span>
              </div>
            )}

            {/* Google OAuth */}
            <button
              id="google-signin-btn"
              onClick={handleGoogle}
              disabled={isGooglePending || isPending}
              className="w-full flex items-center justify-center gap-3 h-10 rounded-xl border border-slate-700/80 bg-slate-800/60 text-sm font-medium text-slate-200 hover:bg-slate-700/60 hover:border-slate-600 hover:text-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed mb-5"
            >
              {isGooglePending ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-xs text-slate-500 font-medium">or</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* Credentials form */}
            <form onSubmit={handleCredentials} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="text-xs font-medium text-slate-400">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="trader@steptraders.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input w-full h-10 rounded-xl pl-10 pr-4 text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="login-password" className="text-xs font-medium text-slate-400">
                  Password
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="login-password"
                    type={showPw ? "text" : "password"}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    required
                    placeholder={mode === "login" ? "Enter your password" : "Min. 6 characters"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input w-full h-10 rounded-xl pl-10 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isPending || isGooglePending || success}
                className={cn(
                  "w-full h-11 rounded-xl text-sm font-semibold text-white transition-all duration-200 mt-2",
                  "bg-sky-500 hover:bg-sky-400 active:scale-[0.98]",
                  "shadow-lg shadow-sky-500/20 hover:shadow-sky-500/35",
                  "disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                )}
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : mode === "login" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Demo hint */}
            {mode === "login" && (
              <div className="mt-4 rounded-lg bg-sky-500/5 border border-sky-500/10 px-3 py-2.5">
                <p className="text-xs text-slate-400 text-center">
                  <span className="text-sky-400 font-semibold">Demo: </span>
                  trader@steptraders.com · demo1234
                </p>
              </div>
            )}

            {/* Toggle mode */}
            <div className="mt-5 text-center">
              <span className="text-xs text-slate-500">
                {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button
                id="toggle-auth-mode-btn"
                type="button"
                onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
                className="text-xs text-sky-400 hover:text-sky-300 font-semibold transition-colors"
              >
                {mode === "login" ? "Sign up free" : "Sign in"}
              </button>
            </div>
          </div>

          {/* Privacy note */}
          <p className="text-center text-[11px] text-slate-600 px-4">
            By signing in, you agree to our{" "}
            <span className="text-slate-500 cursor-pointer hover:text-slate-300 transition-colors">Terms</span>
            {" "}and{" "}
            <span className="text-slate-500 cursor-pointer hover:text-slate-300 transition-colors">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617]" />}>
      <LoginContent />
    </Suspense>
  );
}
