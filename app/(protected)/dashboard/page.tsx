import { redirect } from "next/navigation";

/**
 * /dashboard now permanently redirects to the root dashboard at /.
 * The dashboard was moved to app/page.tsx to support the soft-gate public mode.
 */
export default function DashboardPage() {
  redirect("/");
}
