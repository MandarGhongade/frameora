"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Loader2, LogOut } from "lucide-react";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { site } from "@/lib/site";

type State = { status: "loading" } | { status: "signed-out" } | { status: "not-admin"; email: string } | { status: "admin"; email: string };

/**
 * Admin login. When Supabase isn't configured yet, the admin stays open in demo mode.
 * This screen is for convenience only; the real protection is the database's
 * row-level security, which only lets accounts in public.admins change products.
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(supabaseConfigured ? { status: "loading" } : { status: "admin", email: "" });

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    const check = async (session: Session | null) => {
      if (!session) return setState({ status: "signed-out" });
      const email = session.user.email ?? "";
      const { data } = await sb.from("admins").select("user_id").eq("user_id", session.user.id).maybeSingle();
      setState(data ? { status: "admin", email } : { status: "not-admin", email });
    };
    sb.auth.getSession().then(({ data }) => check(data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      // Defer so we don't query inside the auth callback.
      setTimeout(() => check(session), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (state.status === "loading")
    return (
      <div className="bg-cream/60 grid min-h-screen place-items-center">
        <Loader2 className="text-muted animate-spin" />
      </div>
    );

  if (state.status === "signed-out") return <Login />;

  if (state.status === "not-admin")
    return (
      <Shell>
        <p className="text-sm">
          <b>{state.email}</b> is signed in but isn&apos;t an admin yet.
        </p>
        <p className="text-muted mt-2 text-xs">Add this account to the admins list (step 5 in supabase/setup.sql), then reload.</p>
        <SignOut className="mt-6 w-full justify-center" />
      </Shell>
    );

  return (
    <>
      {state.email && (
        <div className="fixed right-4 top-4 z-50 hidden md:block">
          <SignOut label={state.email} />
        </div>
      )}
      {children}
    </>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const { error } = await getSupabase()!.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) setErr(error.message === "Invalid login credentials" ? "Wrong email or password." : error.message);
  };

  return (
    <Shell>
      <form onSubmit={submit} className="space-y-3">
        <input type="email" required autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border-line focus:border-ink w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none" />
        <input type="password" required autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border-line focus:border-ink w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none" />
        {err && <p className="text-clay text-sm">{err}</p>}
        <button disabled={busy} className="bg-ink text-paper flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold disabled:opacity-60">
          {busy && <Loader2 size={16} className="animate-spin" />} Sign in
        </button>
      </form>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-cream/60 grid min-h-screen place-items-center px-5">
      <div className="border-line w-full max-w-sm rounded-3xl border bg-white p-8">
        <div className="display mb-6 text-3xl">
          {site.name}
          <span className="text-clay">.</span>
          <span className="text-muted ml-2 font-sans text-xs uppercase tracking-[0.2em]">Admin</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function SignOut({ label, className = "" }: { label?: string; className?: string }) {
  return (
    <button
      onClick={() => getSupabase()?.auth.signOut()}
      title="Sign out"
      className={`border-line text-muted hover:text-ink flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-xs ${className}`}
    >
      {label && <span className="max-w-[16rem] truncate">{label}</span>}
      <LogOut size={14} /> Sign out
    </button>
  );
}
