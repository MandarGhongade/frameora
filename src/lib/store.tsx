"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AddonId, ArtId, FinishId } from "./data";
import { site } from "./site";

// NOTE: This demo keeps cart & orders in the browser (localStorage).
// In Phase 1 build-out these move to Supabase (database + photo storage) and Razorpay.

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  finish: FinishId;
  size: string;
  unitPrice: number;
  qty: number;
  addons: AddonId[];
  /** true = white border (mat) around the photo, false = full photo edge to edge */
  mat?: boolean;
  photo?: string | null; // small preview data-URL (customer's upload)
  // Snapshot of how the product looked, so thumbnails work even if the product is later edited or removed.
  image?: string;
  art?: ArtId;
  orientation?: "portrait" | "landscape" | "square";
  message?: string;
};

export const STATUSES = ["Placed", "Printing", "Framing", "Shipped", "Delivered"] as const;
export type Status = (typeof STATUSES)[number] | "Cancelled";

export type Address = {
  name: string;
  phone: string;
  email: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pin: string;
};

export type Order = {
  id: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  payment: "Prepaid" | "COD";
  address: Address;
  status: Status;
  history: { status: Status; at: string }[];
  awb?: string;
  demo?: boolean;
};

type Ctx = {
  cart: CartItem[];
  orders: Order[];
  ready: boolean;
  addToCart: (i: Omit<CartItem, "id">) => void;
  updateQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  placeOrder: (address: Address, payment: Order["payment"]) => Order;
  setStatus: (orderId: string, s: Status) => void;
  totals: { subtotal: number; shipping: number; total: number; count: number };
};

const StoreCtx = createContext<Ctx | null>(null);

export const itemTotal = (i: CartItem) => i.unitPrice * i.qty;

export function calcShipping(subtotal: number) {
  return subtotal === 0 || subtotal >= site.freeShippingAbove ? 0 : site.shippingFee;
}

const uid = () => Math.random().toString(36).slice(2, 10);

function seedOrders(): Order[] {
  const mk = (n: number, name: string, city: string, state: string, frame: string, finish: FinishId, size: string, price: number, status: Status, daysAgo: number, payment: Order["payment"]): Order => {
    const at = new Date(Date.now() - daysAgo * 86400000).toISOString();
    const idx = STATUSES.indexOf(status as (typeof STATUSES)[number]);
    return {
      id: `FR${(10240 + n).toString()}`,
      createdAt: at,
      items: [{ id: uid(), slug: frame, name: frame.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), finish, size, unitPrice: price, qty: 1, addons: ["photofix"] }],
      subtotal: price,
      shipping: calcShipping(price),
      total: price + calcShipping(price),
      payment,
      address: { name, phone: "98xxxxxx" + n, email: "customer@example.com", line1: "Sample address", city, state, pin: "4110" + n.toString().padStart(2, "0") },
      status,
      history: STATUSES.slice(0, idx + 1).map((s, i) => ({ status: s, at: new Date(Date.parse(at) + i * 20 * 3600000).toISOString() })),
      awb: idx >= 3 ? "SR" + (8800000 + n * 137) : undefined,
      demo: true,
    };
  };
  return [
    mk(1, "Priya S.", "Pune", "Maharashtra", "heirloom-gold", "gold", "12×16", 1299, "Placed", 0, "Prepaid"),
    mk(2, "Rohit K.", "Jaipur", "Rajasthan", "classic-gallery", "oak", "16×20", 1899, "Printing", 1, "Prepaid"),
    mk(3, "Ananya R.", "Chennai", "Tamil Nadu", "crystal-acrylic", "acrylic", "12×16", 1299, "Framing", 2, "COD"),
    mk(4, "Vikram P.", "Lucknow", "Uttar Pradesh", "saat-phere", "walnut", "20×30", 2799, "Shipped", 4, "Prepaid"),
    mk(5, "Sneha M.", "Kolkata", "West Bengal", "desk-mini", "white", "6×8", 549, "Delivered", 8, "Prepaid"),
  ];
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const c = localStorage.getItem("fs_cart");
      const o = localStorage.getItem("fs_orders");
      setCart(c ? JSON.parse(c) : []);
      setOrders(o ? JSON.parse(o) : seedOrders());
    } catch {
      setOrders(seedOrders());
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem("fs_cart", JSON.stringify(cart));
    } catch {}
  }, [cart, ready]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem("fs_orders", JSON.stringify(orders));
    } catch {}
  }, [orders, ready]);

  const totals = useMemo(() => {
    const subtotal = cart.reduce((s, i) => s + itemTotal(i), 0);
    const shipping = calcShipping(subtotal);
    return { subtotal, shipping, total: subtotal + shipping, count: cart.reduce((s, i) => s + i.qty, 0) };
  }, [cart]);

  const value: Ctx = {
    cart,
    orders,
    ready,
    totals,
    addToCart: (i) => setCart((c) => [...c, { ...i, id: uid() }]),
    updateQty: (id, qty) => setCart((c) => c.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))),
    removeFromCart: (id) => setCart((c) => c.filter((i) => i.id !== id)),
    placeOrder: (address, payment) => {
      const now = new Date().toISOString();
      const extra = payment === "COD" ? site.codFee : 0;
      const order: Order = {
        id: "FR" + Math.floor(10300 + Math.random() * 89000),
        createdAt: now,
        items: cart,
        subtotal: totals.subtotal,
        shipping: totals.shipping + extra,
        total: totals.total + extra,
        payment,
        address,
        status: "Placed",
        history: [{ status: "Placed", at: now }],
      };
      setOrders((o) => [order, ...o]);
      setCart([]);
      return order;
    },
    setStatus: (orderId, s) =>
      setOrders((os) =>
        os.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: s,
                awb: s === "Shipped" && !o.awb ? "SR" + Math.floor(8000000 + Math.random() * 999999) : o.awb,
                history: [...o.history, { status: s, at: new Date().toISOString() }],
              }
            : o,
        ),
      ),
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore must be used inside StoreProvider");
  return c;
}
