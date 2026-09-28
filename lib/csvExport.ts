import { Trade } from "@/types";

/**
 * Converts an array of trades to a CSV string and triggers a browser download.
 */
export function exportTradesToCSV(trades: Trade[], filename = "step-traders-journal.csv"): void {
  if (trades.length === 0) return;

  const headers = [
    "Tanggal",
    "Instrumen",
    "Arah",
    "Method",
    "Risk/Reward",
    "Hasil",
    "PnL ($)",
    "Psikologi",
    "Catatan",
    "Screenshot URL",
  ];

  const escape = (val: string | number | undefined | null): string => {
    if (val === null || val === undefined) return "";
    const str = String(val);
    // Wrap in quotes if it contains comma, quote, or newline
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = trades.map((t) => [
    escape(new Date(t.date).toLocaleString("id-ID")),
    escape(t.instrument),
    escape(t.direction),
    escape(t.methodName ?? ""),
    escape(t.riskReward),
    escape(t.result),
    escape(t.pnl),
    escape((t.psychologyTags ?? []).join("; ")),
    escape(t.notes),
    escape(t.screenshotUrl ?? ""),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
