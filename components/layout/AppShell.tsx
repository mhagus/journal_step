"use client";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useTradingStore } from "@/store/tradingStore";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useTradingStore();

  return (
    <div className="flex h-full">
      <Sidebar />
      <div
        className={cn(
          "flex flex-col flex-1 min-w-0 sidebar-transition",
          // Desktop offset for sidebar
          "lg:ml-60",
          sidebarCollapsed && "lg:ml-16"
        )}
      >
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
