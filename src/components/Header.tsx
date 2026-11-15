"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X, Package } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { site } from "@/lib/site";
import { useStore } from "@/lib/store";

const NAV = [
  { href: "/shop", label: "Shop all" },
  { href: "/shop?c=couple", label: "Couple" },
  { href: "/shop?c=wedding", label: "Wedding" },
  { href: "/shop?c=acrylic", label: "Acrylic" },
  { href: "/shop?c=ready-made", label: "Ready-made" },
];

export function Header() {
  const { totals, ready } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const path = usePathname();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [path]);

  if (path.startsWith("/admin")) return null;

  return (
    <>
      <div className="bg-ink text-paper/90 overflow-hidden text-[12px] tracking-wide">
        <div className="marquee flex w-max gap-12 whitespace-nowrap py-2">
          {[...Array(2)].map((_, k) => (
            <div key={k} className="flex gap-12">
              <span>Free shipping across India above ₹{site.freeShippingAbove}</span>
              <span>✦ Free photo touch-up on every order</span>
              <span>✦ Approve your design on WhatsApp before we print</span>
              <span>✦ Free replacement if it arrives damaged</span>
              <span>✦ Cash on delivery available</span>
            </div>
          ))}
        </div>
      </div>
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-paper/80 shadow-[0_1px_0_var(--color-line)] backdrop-blur-xl" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-8">
          <button className="md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <Link href="/" className="display text-2xl font-medium md:text-[28px]">
            {site.name}
            <span className="text-clay">.</span>
          </Link>
          <nav className="hidden items-center gap-8 text-[14px] md:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="link-underline text-ink-soft hover:text-ink">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-5">
            <Link href="/orders" className="hidden items-center gap-1.5 text-[14px] text-ink-soft hover:text-ink sm:flex">
              <Package size={18} /> Track order
            </Link>
            <Link href="/cart" className="relative" aria-label="Cart">
              <ShoppingBag size={22} />
              {ready && totals.count > 0 && (
                <motion.span
                  key={totals.count}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  className="bg-clay absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full text-[11px] font-semibold text-white"
                >
                  {totals.count}
                </motion.span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[70] md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-ink/40 absolute inset-0" onClick={() => setOpen(false)} />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="bg-paper absolute inset-y-0 left-0 w-[80%] max-w-sm p-6"
            >
              <div className="mb-10 flex items-center justify-between">
                <span className="display text-2xl">{site.name}</span>
                <button onClick={() => setOpen(false)} aria-label="Close menu">
                  <X />
                </button>
              </div>
              <nav className="display flex flex-col gap-5 text-3xl">
                {[...NAV, { href: "/orders", label: "Track order" }].map((n) => (
                  <Link key={n.href} href={n.href}>
                    {n.label}
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
