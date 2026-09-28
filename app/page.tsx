"use client";

/**
 * app/page.tsx — Public Dashboard (root route)
 *
 * Displays the full dashboard UI for everyone (authenticated or guest).
 * - Authenticated users: see their real data
 * - Guests: see empty state + a prominent CTA overlay to login
 *
 * The AppShell (Sidebar + Topbar) renders here, replacing the old login-only page.
 * The actual login form is now accessible via the sidebar/topbar login buttons.
 */

import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

function DashboardPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="flex-1 animate-pulse bg-slate-900/30 rounded-xl" />}>
        <DashboardContent />
      </Suspense>
    </AppShell>
  );
}

export default DashboardPage;
