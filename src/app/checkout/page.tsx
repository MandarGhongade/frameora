"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Lock, Smartphone, Banknote, Loader2 } from "lucide-react";
import { useStore, type Address } from "@/lib/store";
import { inr, site } from "@/lib/site";
import { ItemThumb } from "@/components/ItemThumb";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jammu & Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Andaman & Nicobar", "Chandigarh", "Dadra & Nagar Haveli and Daman & Diu", "Lakshadweep",
];

const empty: Address = { name: "", phone: "", email: "", line1: "", line2: "", city: "", state: "", pin: "" };

export default function Checkout() {
  const router = useRouter();
  const { cart, totals, placeOrder, ready } = useStore();
  const [a, setA] = useState<Address>(empty);
  const [pay, setPay] = useState<"Prepaid" | "COD">("Prepaid");
  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({});
  const [paying, setPaying] = useState(false);

  if (!ready) return <div className="min-h-[60vh]" />;
  if (cart.length === 0 && !paying)
    return (
      <div className="mx-auto max-w-md px-5 py-32 text-center">
        <p className="display text-3xl">Nothing to check out yet.</p>
        <Link href="/shop" className="link-underline mt-4 inline-block font-semibold">Browse frames</Link>
      </div>
    );

  const codFee = pay === "COD" ? site.codFee : 0;
  const set = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setA({ ...a, [k]: e.target.value });

  const validate = () => {
    const e: typeof errors = {};
    if (!a.name.trim()) e.name = "Required";
    if (!/^[6-9]\d{9}$/.test(a.phone.replace(/\D/g, "").slice(-10))) e.phone = "Enter a valid 10-digit mobile";
    if (!/^\S+@\S+\.\S+$/.test(a.email)) e.email = "Enter a valid email";
    if (!a.line1.trim()) e.line1 = "Required";
    if (!a.city.trim()) e.city = "Required";
    if (!a.state) e.state = "Select state";
    if (!/^[1-9]\d{5}$/.test(a.pin)) e.pin = "6-digit PIN";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setPaying(true);
    // DEMO: Razorpay checkout will open here. We simulate a successful payment.
    await new Promise((r) => setTimeout(r, pay === "Prepaid" ? 1800 : 900));
    const order = placeOrder(a, pay);
    router.push(`/orders/${order.id}?new=1`);
  };

  return (
    <div className="mx-auto max-w-6xl px-5 pt-10 md:px-8 md:pt-16">
      <h1 className="display text-5xl md:text-6xl">Checkout</h1>
      <div className="mt-10 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.12em]">Delivery address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" v={a.name} on={set("name")} err={errors.name} className="sm:col-span-2" />
            <Field label="Mobile (for WhatsApp updates)" v={a.phone} on={set("phone")} err={errors.phone} type="tel" />
            <Field label="Email" v={a.email} on={set("email")} err={errors.email} type="email" />
            <Field label="House / flat, street" v={a.line1} on={set("line1")} err={errors.line1} className="sm:col-span-2" />
            <Field label="Area, landmark (optional)" v={a.line2 ?? ""} on={set("line2")} className="sm:col-span-2" />
            <Field label="PIN code" v={a.pin} on={set("pin")} err={errors.pin} inputMode="numeric" maxLength={6} />
            <Field label="City" v={a.city} on={set("city")} err={errors.city} />
            <label className="sm:col-span-2">
              <span className="text-muted mb-1.5 block text-xs">State</span>
              <select value={a.state} onChange={set("state")} className={`w-full rounded-xl border bg-transparent px-4 py-3.5 outline-none transition-colors focus:border-ink ${errors.state ? "border-clay" : "border-line"}`}>
                <option value="">Select state</option>
                {STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
              {errors.state && <span className="text-clay mt-1 block text-xs">{errors.state}</span>}
            </label>
          </div>

          <h2 className="mb-5 mt-12 text-sm font-semibold uppercase tracking-[0.12em]">Payment</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <PayOpt on={pay === "Prepaid"} onClick={() => setPay("Prepaid")} icon={<Smartphone size={20} />} title="Pay online" sub="UPI, cards, netbanking, wallets" />
            <PayOpt on={pay === "COD"} onClick={() => setPay("COD")} icon={<Banknote size={20} />} title="Cash on delivery" sub={`+${inr(site.codFee)} COD fee`} />
          </div>
        </div>

        <aside className="bg-cream h-fit rounded-3xl p-7 lg:sticky lg:top-28">
          <h2 className="display text-2xl">Order summary</h2>
          <ul className="mt-5 space-y-4">
            {cart.map((i) => (
              <li key={i.id} className="flex items-center gap-4">
                <ItemThumb item={i} className="w-16" />
                <div className="flex-1 text-sm">
                  <div className="font-semibold">{i.name}</div>
                  <div className="text-muted">{i.size}&quot; × {i.qty}</div>
                </div>
                <div className="text-sm font-semibold">{inr(i.unitPrice * i.qty)}</div>
              </li>
            ))}
          </ul>
          <dl className="border-sand mt-6 space-y-2 border-t pt-5 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{inr(totals.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{totals.shipping ? inr(totals.shipping) : "Free"}</dd></div>
            {codFee > 0 && <div className="flex justify-between"><dt className="text-muted">COD fee</dt><dd>{inr(codFee)}</dd></div>}
          </dl>
          <div className="border-sand mt-4 flex justify-between border-t pt-4 text-lg font-semibold">
            <span>Total</span>
            <span>{inr(totals.total + codFee)}</span>
          </div>
          <button onClick={submit} disabled={paying} className="bg-clay hover:bg-clay-dark mt-7 flex w-full items-center justify-center gap-2 rounded-full py-4 font-semibold text-white transition-colors duration-500 disabled:opacity-80">
            <Lock size={16} /> {pay === "Prepaid" ? `Pay ${inr(totals.total)}` : "Place order"}
          </button>
          <p className="text-muted mt-3 text-center text-xs">Secured by Razorpay (demo mode)</p>
        </aside>
      </div>

      <AnimatePresence>
        {paying && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-ink/50 fixed inset-0 z-[80] grid place-items-center backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-paper w-[90%] max-w-sm rounded-3xl p-10 text-center">
              <Loader2 className="text-clay mx-auto animate-spin" size={40} />
              <p className="display mt-6 text-2xl">{pay === "Prepaid" ? "Confirming payment…" : "Placing your order…"}</p>
              <p className="text-muted mt-2 text-sm">Please don&apos;t close this window.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, v, on, err, className = "", ...rest }: { label: string; v: string; on: (e: React.ChangeEvent<HTMLInputElement>) => void; err?: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={className}>
      <span className="text-muted mb-1.5 block text-xs">{label}</span>
      <input value={v} onChange={on} {...rest} className={`w-full rounded-xl border bg-transparent px-4 py-3.5 outline-none transition-colors focus:border-ink ${err ? "border-clay" : "border-line"}`} />
      {err && <span className="text-clay mt-1 block text-xs">{err}</span>}
    </label>
  );
}

function PayOpt({ on, onClick, icon, title, sub }: { on: boolean; onClick: () => void; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition-all duration-300 ${on ? "border-ink bg-cream" : "border-line hover:border-ink/40"}`}>
      <span className={`grid h-10 w-10 place-items-center rounded-full ${on ? "bg-ink text-paper" : "bg-cream"}`}>{icon}</span>
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="text-muted block text-xs">{sub}</span>
      </span>
    </button>
  );
}
