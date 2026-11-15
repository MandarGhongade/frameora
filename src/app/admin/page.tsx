"use client";

import Link from "next/link";
import { IndianRupee, Package, Clock, Truck } from "lucide-react";
import { useStore } from "@/lib/store";
import { inr } from "@/lib/site";
import { OrdersTable } from "@/components/admin/OrdersTable";

export default function AdminHome() {
  const { orders, ready } = useStore();
  if (!ready) return null;
  const live = orders.filter((o) => o.status !== "Cancelled");
  const revenue = live.reduce((s, o) => s + o.total, 0);
  const pending = live.filter((o) => ["Placed", "Printing", "Framing"].includes(o.status)).length;
  const transit = live.filter((o) => o.status === "Shipped").length;

  const cards = [
    { label: "Revenue", value: inr(revenue), icon: IndianRupee },
    { label: "Orders", value: String(orders.length), icon: Package },
    { label: "To make & dispatch", value: String(pending), icon: Clock },
    { label: "In transit", value: String(transit), icon: Truck },
  ];

  return (
    <div>
      <h1 className="display text-4xl">Good day 👋</h1>
      <p className="text-muted mt-1">Here&apos;s what&apos;s happening in your studio.</p>
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="border-line rounded-2xl border bg-white p-5">
            <div className="text-muted flex items-center justify-between text-xs uppercase tracking-[0.1em]">
              {c.label} <c.icon size={16} />
            </div>
            <div className="display mt-3 text-3xl">{c.value}</div>
          </div>
        ))}
      </div>
      <div className="mb-4 mt-10 flex items-center justify-between">
        <h2 className="display text-2xl">Needs attention</h2>
        <Link href="/admin/orders" className="text-sm font-semibold hover:underline">All orders →</Link>
      </div>
      <OrdersTable orders={orders.filter((o) => ["Placed", "Printing", "Framing"].includes(o.status))} />
    </div>
  );
}
