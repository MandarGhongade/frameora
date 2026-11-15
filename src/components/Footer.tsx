"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { CATEGORIES } from "@/lib/data";

export function Footer() {
  const path = usePathname();
  if (path.startsWith("/admin")) return null;
  return (
    <footer className="bg-ink text-paper/80 mt-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-4 md:px-8">
        <div className="md:col-span-1">
          <div className="display text-paper text-3xl">
            {site.name}
            <span className="text-clay">.</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">{site.tagline} Printed, framed and shipped with care to every PIN code in India.</p>
        </div>
        <div>
          <h4 className="text-paper mb-4 text-xs uppercase tracking-[0.2em]">Shop</h4>
          <ul className="space-y-2.5 text-sm">
            {CATEGORIES.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link href={`/shop?c=${c.slug}`} className="link-underline hover:text-paper">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-paper mb-4 text-xs uppercase tracking-[0.2em]">Help</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/orders" className="link-underline hover:text-paper">Track your order</Link></li>
            <li><span>Shipping policy</span></li>
            <li><span>Refund & replacement</span></li>
            <li><span>Privacy policy</span></li>
            <li><span>Terms of service</span></li>
          </ul>
        </div>
        <div>
          <h4 className="text-paper mb-4 text-xs uppercase tracking-[0.2em]">Talk to us</h4>
          <p className="text-sm">WhatsApp: {site.whatsapp}</p>
          <p className="mt-1 text-sm">{site.email}</p>
          <p className="mt-6 text-xs text-paper/50">UPI · Cards · Netbanking · COD</p>
        </div>
      </div>
      <div className="border-paper/10 border-t">
        <div className="mx-auto flex max-w-7xl justify-between px-5 py-6 text-xs text-paper/50 md:px-8">
          <span>© {new Date().getFullYear()} {site.name}. Made in India.</span>
          <Link href="/admin" className="hover:text-paper">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
