import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";

/**
 * Protected layout — wraps /journal, /methods, /evaluation, /news
 * Hard-redirects unauthenticated users back to the root dashboard (soft-gate).
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return <AppShell>{children}</AppShell>;
}
