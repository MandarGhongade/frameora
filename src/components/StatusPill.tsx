import type { Status } from "@/lib/store";

const COLORS: Record<Status, string> = {
  Placed: "bg-sky-100 text-sky-800",
  Printing: "bg-amber-100 text-amber-800",
  Framing: "bg-orange-100 text-orange-800",
  Shipped: "bg-violet-100 text-violet-800",
  Delivered: "bg-emerald-100 text-emerald-800",
  Cancelled: "bg-stone-200 text-stone-700",
};

export function StatusPill({ s }: { s: Status }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${COLORS[s]}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" />{s}
  </span>;
}
