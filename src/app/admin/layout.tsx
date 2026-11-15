"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Frame, ExternalLink } from "lucide-react";
import { site } from "@/lib/site";
import { supabaseConfigured } from "@/lib/supabase";
import { AdminGate } from "@/components/admin/AdminGate";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/products", label: "Products", icon: Frame },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="bg-cream/60 min-h-screen md:flex">
      <aside className="bg-ink text-paper/80 md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0">
        <div className="flex items-center justify-between px-6 py-5 md:block md:py-8">
          <Link href="/admin" className="display text-paper text-2xl">
            {site.name}<span className="text-clay">.</span>
            <span className="text-paper/50 ml-2 font-sans text-xs uppercase tracking-[0.2em]">Admin</span>
          </Link>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {NAV.map((n) => {
            const on = n.href === "/admin" ? path === "/admin" : path.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors ${on ? "bg-paper/10 text-paper" : "hover:bg-paper/5"}`}>
                <n.icon size={17} /> {n.label}
              </Link>
            );
          })}
          <Link href="/" className="hover:bg-paper/5 flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm md:mt-6">
            <ExternalLink size={17} /> View store
          </Link>
        </nav>
      </aside>
      <div className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-10">
        <div className="mb-6 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-2.5 text-xs text-amber-900">
          {supabaseConfigured
            ? "Products are live from the database. Orders are still demo data stored in this browser."
            : "Demo mode — Supabase isn't connected yet, so products can't be added and orders are stored in this browser. See README → Connect Supabase."}
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGate>
      <AdminShell>{children}</AdminShell>
    </AdminGate>
  );
}
