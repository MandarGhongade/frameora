"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, X, ArrowRight, ShoppingBag } from "lucide-react";
import { useStore, itemTotal } from "@/lib/store";
import { ADDONS, FINISHES, borderLabel } from "@/lib/data";
import { inr, site } from "@/lib/site";
import { ItemThumb } from "@/components/ItemThumb";

export default function Cart() {
  const { cart, totals, updateQty, removeFromCart, ready } = useStore();
  if (!ready) return <div className="min-h-[60vh]" />;

  if (cart.length === 0)
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 text-center">
        <ShoppingBag size={40} strokeWidth={1.2} />
        <h1 className="display mt-6 text-4xl">Your cart is empty</h1>
        <p className="text-muted mt-3">Every great wall starts with one frame.</p>
        <Link href="/shop" className="bg-ink text-paper hover:bg-clay mt-8 rounded-full px-8 py-4 font-semibold transition-colors duration-500">
          Start framing
        </Link>
      </div>
    );

  const toFree = site.freeShippingAbove - totals.subtotal;

  return (
    <div className="mx-auto max-w-6xl px-5 pt-10 md:px-8 md:pt-16">
      <h1 className="display text-5xl md:text-6xl">Your cart</h1>
      <div className="mt-10 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <ul>
          <AnimatePresence initial={false}>
            {cart.map((i) => (
              <motion.li
                key={i.id}
                layout
                exit={{ opacity: 0, x: -40, height: 0, transition: { duration: 0.35 } }}
                className="border-line flex gap-5 border-b py-6"
              >
                <ItemThumb item={i} className="w-24 md:w-32" />
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-3">
                    <div>
                      <h3 className="display text-xl">{i.name}</h3>
                      <p className="text-muted mt-1 text-sm">
                        {FINISHES[i.finish].name} · {i.size}&quot;{borderLabel(i.mat)}
                      </p>
                      {i.addons.length > 0 && (
                        <p className="text-muted mt-1 text-xs">{i.addons.map((a) => ADDONS.find((x) => x.id === a)?.name).join(" · ")}</p>
                      )}
                    </div>
                    <button onClick={() => removeFromCart(i.id)} className="text-muted hover:text-ink h-fit" aria-label="Remove">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="border-line flex items-center rounded-full border">
                      <button className="px-3 py-2" onClick={() => updateQty(i.id, i.qty - 1)} aria-label="Decrease"><Minus size={14} /></button>
                      <span className="w-5 text-center text-sm font-semibold">{i.qty}</span>
                      <button className="px-3 py-2" onClick={() => updateQty(i.id, i.qty + 1)} aria-label="Increase"><Plus size={14} /></button>
                    </div>
                    <span className="font-semibold">{inr(itemTotal(i))}</span>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <aside className="bg-cream h-fit rounded-3xl p-7 lg:sticky lg:top-28">
          <h2 className="display text-2xl">Summary</h2>
          {toFree > 0 ? (
            <div className="mt-5">
              <p className="text-sm">Add <b>{inr(toFree)}</b> more for free shipping</p>
              <div className="bg-sand mt-2 h-1.5 overflow-hidden rounded-full">
                <motion.div className="bg-clay h-full" initial={false} animate={{ width: `${(totals.subtotal / site.freeShippingAbove) * 100}%` }} />
              </div>
            </div>
          ) : (
            <p className="text-sage mt-5 text-sm font-semibold">You&apos;ve unlocked free shipping ✦</p>
          )}
          <dl className="mt-6 space-y-3 text-sm">
            <Row k="Subtotal" v={inr(totals.subtotal)} />
            <Row k="Shipping" v={totals.shipping ? inr(totals.shipping) : "Free"} />
          </dl>
          <div className="border-sand mt-5 flex justify-between border-t pt-5 text-lg font-semibold">
            <span>Total</span>
            <span>{inr(totals.total)}</span>
          </div>
          <Link href="/checkout" className="bg-ink text-paper hover:bg-clay group mt-7 flex items-center justify-center gap-2 rounded-full py-4 font-semibold transition-colors duration-500">
            Checkout <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="text-muted mt-4 text-center text-xs">UPI · Cards · Netbanking · Cash on delivery</p>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
