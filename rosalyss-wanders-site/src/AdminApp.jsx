import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck, LogOut, Loader2, AlertCircle, Check, Copy,
  Facebook, Instagram, Link2, Users, MapPinned, Trash2, Ban, RotateCcw, Receipt,
} from "lucide-react";

/* ---------------------------------------------------------
   SUPABASE — same live project as the public site
--------------------------------------------------------- */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://rdxziaotuzsvibbwlmnw.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_JA9Ncqvhx0omEOlORGyTXw_m7KlAzbJ";
const SESSION_KEY = "rw_admin_session";

async function authFetch(path, token, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...opts,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: opts.headers?.Prefer || "return=representation",
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = data?.error_description || data?.message || data?.msg || res.statusText;
    throw new Error(msg);
  }
  return data;
}

function loadSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveSession(session) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}
function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

/* ---------------------------------------------------------
   ROOT ADMIN APP
--------------------------------------------------------- */
export default function AdminApp() {
  const [session, setSession] = useState(() => loadSession());
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!session?.access_token) {
        setChecking(false);
        return;
      }
      try {
        const result = await authFetch("/rest/v1/rpc/is_admin", session.access_token, { method: "POST", body: JSON.stringify({}) });
        if (!cancelled) setIsAdmin(result === true);
      } catch {
        if (!cancelled) { clearSession(); setSession(null); }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, [session]);

  function handleLogin(newSession) {
    saveSession(newSession);
    setSession(newSession);
    setChecking(true);
  }

  function handleLogout() {
    clearSession();
    setSession(null);
    setIsAdmin(false);
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBF7EF]">
        <Loader2 className="animate-spin text-[#1C7C8C]" size={28} />
      </div>
    );
  }

  if (!session || !isAdmin) {
    return <LoginScreen onLogin={handleLogin} deniedNotice={session && !isAdmin} />;
  }

  return <Dashboard token={session.access_token} onLogout={handleLogout} />;
}

/* ---------------------------------------------------------
   LOGIN SCREEN
--------------------------------------------------------- */
function LoginScreen({ onLogin, deniedNotice }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(ev) {
    ev.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error_description || data?.msg || "Sign-in failed.");
      onLogin({ access_token: data.access_token, refresh_token: data.refresh_token });
    } catch (err) {
      setError(err.message || "Sign-in failed. Please check your email and password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FBF7EF] px-5" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui" }}>
      <div className="w-full max-w-sm rounded-2xl border border-[#0F2A43]/8 bg-white p-8 shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#0F2A43] text-white">
          <ShieldCheck size={22} />
        </div>
        <h1 className="text-center text-[19px] font-semibold text-[#0F2A43]">Admin Sign In</h1>
        <p className="mt-1 text-center text-[12.5px] text-[#5B6B7A]">Rosalyss Wanders Travel and Tours Services</p>

        {deniedNotice && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-[#E8A33D]/10 p-3 text-[12.5px] text-[#9C6A1B]">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>That account doesn't have admin access on this site.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#3C4A57]">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#0F2A43]/15 px-3.5 py-2.5 text-[13.5px] outline-none focus:border-[#1C7C8C]"
              placeholder="you@rosalysswanders.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#3C4A57]">Password</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[#0F2A43]/15 px-3.5 py-2.5 text-[13.5px] outline-none focus:border-[#1C7C8C]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-[12.5px] text-red-700">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit" disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0F2A43] py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-[#153b5c] disabled:opacity-60"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : null}
            {busy ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <a href="/" className="mt-6 block text-center text-[12.5px] font-medium text-[#1C7C8C]">← Back to website</a>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   DASHBOARD
--------------------------------------------------------- */
function Dashboard({ token, onLogout }) {
  const [tab, setTab] = useState("partners");

  return (
    <div className="min-h-screen bg-[#FBF7EF] text-[#0F2A43] antialiased" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui" }}>
      <header className="sticky top-0 z-20 border-b border-[#0F2A43]/8 bg-[#FBF7EF]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Rosalyss Wanders" className="h-8 w-8 object-contain" />
            <span className="text-[14.5px] font-semibold">Admin Dashboard</span>
          </div>
          <button onClick={onLogout} className="flex items-center gap-1.5 rounded-full border border-[#0F2A43]/15 px-3.5 py-2 text-[12.5px] font-medium text-[#3C4A57] transition hover:border-[#0F2A43]/30">
            <LogOut size={14} /> Log Out
          </button>
        </div>
        <div className="mx-auto flex max-w-6xl gap-1 px-5 pb-2">
          <TabButton active={tab === "partners"} onClick={() => setTab("partners")} icon={<Users size={14} />}>Referral Partners</TabButton>
          <TabButton active={tab === "funnels"} onClick={() => setTab("funnels")} icon={<MapPinned size={14} />}>Destination Funnels</TabButton>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        {tab === "partners" ? <PartnersTab token={token} /> : <FunnelsTab token={token} />}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-semibold transition ${
        active ? "bg-[#0F2A43] text-white" : "text-[#5B6B7A] hover:bg-[#0F2A43]/5"
      }`}
    >
      {icon} {children}
    </button>
  );
}

/* ---------------------------------------------------------
   PARTNERS TAB — deactivate / reactivate / permanently remove
--------------------------------------------------------- */
function PartnersTab({ token }) {
  const [partners, setPartners] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [bookingFormId, setBookingFormId] = useState(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const rows = await authFetch("/rest/v1/referrers?select=*&order=created_at.desc", token, { method: "GET" });
      setPartners(rows);
    } catch (err) {
      setError(err.message || "Couldn't load travel partners.");
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function setStatus(id, status) {
    setBusyId(id);
    try {
      await authFetch(`/rest/v1/referrers?id=eq.${id}`, token, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (err) {
      setError(err.message || "Couldn't update that partner.");
    } finally {
      setBusyId(null);
    }
  }

  async function removePartner(id) {
    setBusyId(id);
    try {
      await authFetch(`/rest/v1/payouts?referrer_id=eq.${id}`, token, { method: "DELETE", headers: { Prefer: "return=minimal" } });
      await authFetch(`/rest/v1/agreements?referrer_id=eq.${id}`, token, { method: "DELETE", headers: { Prefer: "return=minimal" } });
      await authFetch(`/rest/v1/referrers?id=eq.${id}`, token, { method: "DELETE", headers: { Prefer: "return=minimal" } });
      setConfirmDeleteId(null);
      await load();
    } catch (err) {
      setError(err.message || "Couldn't remove that partner.");
    } finally {
      setBusyId(null);
    }
  }

  if (partners === null && !error) {
    return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#1C7C8C]" size={22} /></div>;
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[19px] font-semibold">Travel Referral Partners</h2>
        <p className="mt-1 text-[13px] text-[#5B6B7A]">Deactivate to suspend a partner's referral code, or permanently remove their record.</p>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-[12.5px] text-red-700">
          <AlertCircle size={15} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {partners && partners.length === 0 && (
        <div className="rounded-xl border border-[#0F2A43]/8 bg-white p-8 text-center text-[13.5px] text-[#5B6B7A]">
          No travel partners registered yet.
        </div>
      )}

      <div className="space-y-3">
        {partners?.map((p) => (
          <div key={p.id} className="rounded-xl border border-[#0F2A43]/8 bg-white p-4">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[14px]">{p.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide ${
                  p.status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-[#0F2A43]/8 text-[#5B6B7A]"
                }`}>
                  {p.status === "approved" ? "Active" : "Deactivated"}
                </span>
              </div>
              <div className="mt-1 text-[12.5px] text-[#5B6B7A]">
                Code: <span className="font-mono font-medium text-[#0F2A43]">{p.code}</span> · {p.email}
              </div>
              <div className="mt-0.5 text-[11.5px] text-[#8592a0]">Paid out: ₱{Number(p.paid_out || 0).toLocaleString()}</div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 sm:mt-0 sm:shrink-0">
              {p.status === "approved" ? (
                <ActionButton onClick={() => setStatus(p.id, "suspended")} busy={busyId === p.id} icon={<Ban size={13} />} tone="warn">
                  Deactivate
                </ActionButton>
              ) : (
                <ActionButton onClick={() => setStatus(p.id, "approved")} busy={busyId === p.id} icon={<RotateCcw size={13} />} tone="neutral">
                  Reactivate
                </ActionButton>
              )}

              {confirmDeleteId === p.id ? (
                <>
                  <ActionButton onClick={() => removePartner(p.id)} busy={busyId === p.id} icon={<Trash2 size={13} />} tone="danger">
                    Confirm Remove
                  </ActionButton>
                  <ActionButton onClick={() => setConfirmDeleteId(null)} tone="neutral">Cancel</ActionButton>
                </>
              ) : (
                <ActionButton onClick={() => setConfirmDeleteId(p.id)} icon={<Trash2 size={13} />} tone="danger-outline">
                  Remove
                </ActionButton>
              )}

              <ActionButton
                onClick={() => setBookingFormId(bookingFormId === p.id ? null : p.id)}
                icon={<Receipt size={13} />}
                tone="neutral"
                disabled={p.status !== "approved"}
              >
                Record Booking
              </ActionButton>
            </div>
            </div>

            {bookingFormId === p.id && (
              <RecordBookingForm
                token={token}
                partner={p}
                onDone={() => setBookingFormId(null)}
                onRecorded={load}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionButton({ onClick, busy, disabled, icon, tone = "neutral", children }) {
  const toneCls = {
    neutral: "border border-[#0F2A43]/15 text-[#3C4A57] hover:border-[#0F2A43]/30",
    warn: "border border-[#E8A33D]/40 bg-[#E8A33D]/10 text-[#9C6A1B] hover:bg-[#E8A33D]/20",
    danger: "bg-red-600 text-white hover:bg-red-700",
    "danger-outline": "border border-red-200 text-red-600 hover:bg-red-50",
  }[tone];
  return (
    <button
      onClick={onClick} disabled={busy || disabled}
      className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition disabled:opacity-60 ${toneCls}`}
    >
      {busy ? <Loader2 size={12} className="animate-spin" /> : icon} {children}
    </button>
  );
}

/* ---------------------------------------------------------
   RECORD BOOKING — logs a paid/confirmed booking against a partner so
   their commission and earnings dashboard reflect real numbers.
--------------------------------------------------------- */
function RecordBookingForm({ token, partner, onDone, onRecorded }) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [product, setProduct] = useState("");
  const [amount, setAmount] = useState("");
  const [pax, setPax] = useState("1");
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function handleSubmit(ev) {
    ev.preventDefault();
    setError("");
    setResult(null);
    setBusy(true);
    try {
      const res = await authFetch("/rest/v1/rpc/record_booking", token, {
        method: "POST",
        body: JSON.stringify({
          p_code: partner.code,
          p_customer_name: customerName,
          p_customer_email: customerEmail || null,
          p_product: product,
          p_amount: Number(amount),
          p_pax: Number(pax) || 1,
          p_payment_status: paymentStatus,
        }),
      });
      setResult(res);
      onRecorded?.();
    } catch (err) {
      setError(err.message || "Couldn't record this booking.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-[#0F2A43]/10 bg-[#FBF7EF] p-4">
      <div className="mb-3 text-[12.5px] font-semibold text-[#0F2A43]">Record a booking for {partner.name} ({partner.code})</div>

      {result ? (
        <div className="rounded-lg bg-emerald-50 p-3 text-[12.5px] text-emerald-800">
          <div>Booking {result.booking_reference} recorded — commission ₱{Number(result.commission || 0).toLocaleString()}.</div>
          {result.flag_reason && (
            <div className="mt-1.5 flex items-start gap-1.5 text-[#9C6A1B]">
              <AlertCircle size={13} className="mt-0.5 shrink-0" /> {result.flag_reason}
            </div>
          )}
          <button onClick={onDone} className="mt-2 text-[12px] font-semibold text-emerald-700 underline">Close</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
          <FormField label="Customer name" required>
            <input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full rounded-lg border border-[#0F2A43]/15 px-3 py-2 text-[13px] outline-none focus:border-[#1C7C8C]" />
          </FormField>
          <FormField label="Customer email (optional)">
            <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full rounded-lg border border-[#0F2A43]/15 px-3 py-2 text-[13px] outline-none focus:border-[#1C7C8C]" />
          </FormField>
          <FormField label="Product / package" required>
            <input required value={product} onChange={(e) => setProduct(e.target.value)} placeholder="e.g. Boracay 3D2N Package" className="w-full rounded-lg border border-[#0F2A43]/15 px-3 py-2 text-[13px] outline-none focus:border-[#1C7C8C]" />
          </FormField>
          <FormField label="Total amount (₱)" required>
            <input required type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-lg border border-[#0F2A43]/15 px-3 py-2 text-[13px] outline-none focus:border-[#1C7C8C]" />
          </FormField>
          <FormField label="Pax">
            <input type="number" min="1" value={pax} onChange={(e) => setPax(e.target.value)} className="w-full rounded-lg border border-[#0F2A43]/15 px-3 py-2 text-[13px] outline-none focus:border-[#1C7C8C]" />
          </FormField>
          <FormField label="Payment status">
            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="w-full rounded-lg border border-[#0F2A43]/15 px-3 py-2 text-[13px] outline-none focus:border-[#1C7C8C]">
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </FormField>

          {error && (
            <div className="sm:col-span-2 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-[12.5px] text-red-700">
              <AlertCircle size={15} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}

          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" disabled={busy} className="flex items-center gap-1.5 rounded-full bg-[#0F2A43] px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-[#153b5c] disabled:opacity-60">
              {busy ? <Loader2 size={13} className="animate-spin" /> : null} Record Booking
            </button>
            <button type="button" onClick={onDone} className="rounded-full border border-[#0F2A43]/15 px-4 py-2 text-[12.5px] font-semibold text-[#3C4A57]">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11.5px] font-medium text-[#3C4A57]">{label}{required ? " *" : ""}</span>
      {children}
    </label>
  );
}

/* ---------------------------------------------------------
   FUNNELS TAB — per-destination social links + click/conversion tracking
--------------------------------------------------------- */
function FunnelsTab({ token }) {
  const [destinations, setDestinations] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [dests, evts] = await Promise.all([
          authFetch("/rest/v1/destinations?select=id,name&order=name.asc", token, { method: "GET" }),
          authFetch("/rest/v1/funnel_events?select=destination_name,event_type,utm_source", token, { method: "GET" }),
        ]);
        setDestinations(dests);
        setEvents(evts);
      } catch (err) {
        setError(err.message || "Couldn't load destination funnel data.");
      }
    })();
  }, [token]);

  const origin = window.location.origin;

  function statsFor(name) {
    const rows = events.filter((e) => e.destination_name === name);
    const visits = rows.filter((e) => e.event_type === "visit").length;
    const inquiries = rows.filter((e) => e.event_type === "inquiry").length;
    const bySource = (source) => ({
      visits: rows.filter((e) => e.event_type === "visit" && e.utm_source === source).length,
      inquiries: rows.filter((e) => e.event_type === "inquiry" && e.utm_source === source).length,
    });
    const rate = visits > 0 ? Math.round((inquiries / visits) * 100) : 0;
    return { visits, inquiries, rate, facebook: bySource("facebook"), instagram: bySource("instagram") };
  }

  function copy(key, url) {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1500);
    });
  }

  if (destinations === null && !error) {
    return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#1C7C8C]" size={22} /></div>;
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[19px] font-semibold">Destination Funnel Links</h2>
        <p className="mt-1 text-[13px] text-[#5B6B7A]">
          Share these on Facebook and Instagram — each link prefills the inquiry form for that destination and is tracked below.
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-[12.5px] text-red-700">
          <AlertCircle size={15} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      <div className="space-y-4">
        {destinations?.map((d) => {
          const base = `${origin}/?dest=${encodeURIComponent(d.name)}`;
          const fb = `${base}&utm_source=facebook&utm_medium=social&utm_campaign=destination_funnel`;
          const ig = `${base}&utm_source=instagram&utm_medium=social&utm_campaign=destination_funnel`;
          const stats = statsFor(d.name);

          return (
            <div key={d.id} className="rounded-xl border border-[#0F2A43]/8 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display text-[16px] font-semibold text-[#0F2A43]">{d.name}</h3>
                <div className="flex gap-4 text-[12px] text-[#5B6B7A]">
                  <span><strong className="text-[#0F2A43]">{stats.visits}</strong> visits</span>
                  <span><strong className="text-[#0F2A43]">{stats.inquiries}</strong> inquiries</span>
                  <span><strong className="text-[#0F2A43]">{stats.rate}%</strong> conversion</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <FunnelLinkRow icon={<Link2 size={14} />} label="Generic link" url={base} copied={copiedKey === `${d.id}-base`} onCopy={() => copy(`${d.id}-base`, base)} />
                <FunnelLinkRow icon={<Facebook size={14} />} label={`Facebook (${stats.facebook.visits} visits · ${stats.facebook.inquiries} inquiries)`} url={fb} copied={copiedKey === `${d.id}-fb`} onCopy={() => copy(`${d.id}-fb`, fb)} />
                <FunnelLinkRow icon={<Instagram size={14} />} label={`Instagram (${stats.instagram.visits} visits · ${stats.instagram.inquiries} inquiries)`} url={ig} copied={copiedKey === `${d.id}-ig`} onCopy={() => copy(`${d.id}-ig`, ig)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FunnelLinkRow({ icon, label, url, copied, onCopy }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg bg-[#FBF7EF] p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[#3C4A57]">{icon} {label}</div>
        <div className="mt-0.5 truncate text-[11.5px] text-[#8592a0]">{url}</div>
      </div>
      <button
        onClick={onCopy}
        className="flex shrink-0 items-center gap-1.5 self-start rounded-full border border-[#0F2A43]/15 px-3 py-1.5 text-[11.5px] font-semibold text-[#3C4A57] transition hover:border-[#0F2A43]/30 sm:self-auto"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
