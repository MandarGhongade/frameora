"use client";

import Link from "next/link";
import { useStore, STATUSES, type Status, type Order } from "@/lib/store";
import { inr } from "@/lib/site";
import { StatusPill } from "@/components/StatusPill";
import { ItemThumb } from "@/components/ItemThumb";

export function OrdersTable({ orders }: { orders: Order[] }) {
  const { setStatus } = useStore();
  if (orders.length === 0) return <p className="text-muted py-10 text-center text-sm">No orders here.</p>;
  return (
    <div className="border-line overflow-x-auto rounded-2xl border bg-white">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="text-muted text-left text-xs uppercase tracking-[0.1em]">
          <tr className="border-line border-b">
            <th className="px-5 py-4 font-medium">Order</th>
            <th className="px-5 py-4 font-medium">Customer</th>
            <th className="px-5 py-4 font-medium">Items</th>
            <th className="px-5 py-4 font-medium">Total</th>
            <th className="px-5 py-4 font-medium">Status</th>
            <th className="px-5 py-4 font-medium">Update</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-line hover:bg-cream/50 border-b transition-colors last:border-0">
              <td className="px-5 py-4">
                <Link href={`/admin/orders/${o.id}`} className="font-semibold hover:underline">#{o.id}</Link>
                <div className="text-muted text-xs">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
              </td>
              <td className="px-5 py-4">
                <div className="font-medium">{o.address.name}</div>
                <div className="text-muted text-xs">{o.address.city}, {o.address.state}</div>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <ItemThumb item={o.items[0]} className="w-11" />
                  <div>
                    <div className="max-w-[160px] truncate">{o.items[0].name}</div>
                    <div className="text-muted text-xs">{o.items[0].size}&quot;{o.items.length > 1 ? ` +${o.items.length - 1} more` : ""}</div>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4">
                <div className="font-semibold">{inr(o.total)}</div>
                <div className="text-muted text-xs">{o.payment}</div>
              </td>
              <td className="px-5 py-4"><StatusPill s={o.status} /></td>
              <td className="px-5 py-4">
                <select
                  value={o.status}
                  onChange={(e) => setStatus(o.id, e.target.value as Status)}
                  className="border-line focus:border-ink rounded-lg border bg-white px-2.5 py-1.5 text-sm outline-none"
                >
                  {[...STATUSES, "Cancelled" as const].map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
