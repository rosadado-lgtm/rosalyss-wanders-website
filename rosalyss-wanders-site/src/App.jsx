import React, { useState, useMemo, useEffect } from "react";
import {
  Plane, MapPin, Users, Compass, Phone, MessageCircle, Menu, X,
  Check, ShieldCheck, Sparkles, Sunset, Anchor, Copy, Loader2, AlertCircle,
  Facebook, Instagram
} from "lucide-react";

/* ---------------------------------------------------------
   SOCIAL LINKS
--------------------------------------------------------- */
const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/share/1Fdgj2EH1G/",
  instagram: "https://www.instagram.com/rosalysswanders?stkn=MWJpcXNubWpmMGtxbQ==",
};

/* ---------------------------------------------------------
   SUPABASE — live project for Rosalyss Wanders
   REST calls only (no SDK import needed in this sandbox)
--------------------------------------------------------- */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://rdxziaotuzsvibbwlmnw.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_JA9Ncqvhx0omEOlORGyTXw_m7KlAzbJ";

async function sb(path, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.message || data?.msg || data?.hint || res.statusText;
    throw new Error(msg);
  }
  return data;
}

/* ---------------------------------------------------------
   DATA — sourced from uploaded hotel list & program docs
--------------------------------------------------------- */
const HOTELS = {
  Boracay: {
    flat: [
      "Diamond Water Edge", "Estacio Uno", "Henann Prime", "Fairways",
      "Four Points by Sheraton", "Canyon Hotel", "Discovery Shores", "The Lind",
      "Ambassador", "Two Seasons", "Pinnacle", "Savoy", "Belmont", "Movenpick",
      "Alta Vista", "Grand Vista", "Hannah Hotel", "Shore Time Station 1",
      "Seawind", "Microtel by Wyndham",
    ],
  },
  Coron: {
    tiers: {
      Budget: ["The Ridge Coron", "Acacia Garden Inn", "Mountain View Garden Inn w/ Pool", "The Bay Area", "Island Wanderers Inn", "Casa Montemar Bed & Breakfast", "Macky's Hidden Inn", "Islands View Inn", "Sun Valley Tourist Inn", "Jazmine's Place", "Divine Castle Travelers Inn", "Luis Bay Traveller's Lodge", "Balaibinda Lodge", "R2R Bayview Inn"],
      "Standard A": ["Sunz En Coron", "Bluewave Coron", "Vienna Hotel", "Vela Terraces", "Coron Underwater Garden Resort", "Kokosnuss Garden Resort", "Venus Royale Hotel", "Coron Getaway Hotel & Suites", "Sky Garden Hotel", "One Averee"],
      "Standard B / 4-Star": ["MO2 Lagoon Coron", "Coron Soleil Express Hotel", "Sunlight Hotel Coron", "Coron Westown Resort", "Charms Hotel", "Corto Del Mar Hotel", "Coron Soleil Garden Resort", "Asia Grand View Hotel", "TAG Resort"],
      "Higher-end": ["Zuri Resort", "Two Seasons Coron", "Bayside Hotel", "The Funny Lion Coron", "El Rio Y Mar", "Bacau Bay Resort Coron", "Discovery Coron", "Two Seasons Coron Island Resort"],
    },
  },
  "El Nido": {
    tiers: {
      "Budget / Standard": ["Sea Cocoon Hotel", "Cuna Hotel", "El Nido Garden Resort", "El Nido Beach Resort", "El Nido Beach Hotel", "Bill Tourist Inn", "El Nido Bayview Resort", "Isla Amara Boutique Resort", "Orange Pearl Beach Resort", "La Soledad Guest House", "Mananquil Travel Lodge", "Nay Aster Pension", "Silverise Pension El Nido", "La Casa Teresa El Nido", "Jurias Garden Hotel", "Lolo Oyong Bed & Breakfast", "Rovics Tourist Hotel", "Stunning Republic Beach Resort", "Amakan El Nido"],
      "Higher-tier": ["Marianne Suites", "Cauayan Island Resort", "Ora Beach Resort", "Lio Villas Resort", "Suites by Eco Hotels", "Charlies El Nido", "Lagùn Hotel El Nido", "Lime Resort", "El Nido Coco Resort", "The Funny Lion El Nido"],
    },
  },
  Siargao: {
    tiers: {
      Budget: ["Tropic Hostel", "Point F Siargao", "Malayah Siargao", "HaiDo Ville"],
      "Standard A": ["Tres Islas", "Sunflower Suites"],
      "Standard B": ["Lisuga Siargao Island", "Payag Suites", "Suyog Space Suites", "Langojon Jianjoy Resort", "Casavia Siargao Hostel"],
      "High-end": ["Jonas & Twins Resort", "Ocean 101 Beach Resort", "Cherinicole Beach Resort", "Patricks on the Beach", "Point 303 Cloud 9 Resort"],
      "4–5 Star": ["Apsaras Tribe", "Happiness Beach Resort", "Kalipay Resort Siargao", "Siargao Bleu Resort & Spa"],
    },
  },
  Cebu: {
    tiers: {
      Budget: ["EON Centennial Soho Hotel", "Well Hotel", "Felicity Island Hotel", "Cebu R Hotel Capitol", "Kiwi Hotel", "Andy Hotel", "Metropark Hotel"],
      "Standard A": ["Griffin Hotel & Suites", "Main Hotel & Suites", "Royal J Hotel", "Uncle Tom's Cabin Hotel", "Palm Grass The Cebu Heritage", "City Pod Hotel Cebu", "Mabolo Royal Hotel", "S Hotel & Residences"],
      "Standard B": ["Citi Park Hotel", "Goldberry Suites and Hotel", "Sarrosa International Hotel", "MJ Hotel & Suites", "Golden Prince Hotel & Suites", "Mezzo Hotel", "Bayfront Hotel Cebu", "Yello Hotel", "Quest Hotel Conference Center", "Cebu Parklane", "Kojo Hotel", "Vivien's Hotel", "BE Resort Mactan"],
      "4-Star": ["Crown Regency Hotel & Towers", "Maayo Hotel", "The Noble Cebu", "Savoy Hotel"],
      "High-end": ["Seda Central Bloc Cebu", "Seda Ayala Center Cebu", "Waterfront Cebu", "Bluewater Maribago", "Costabella Tropical Beach Hotel", "JPark Island Resort & Waterpark", "Crimson Resort & Spa"],
    },
  },
};

const DESTINATIONS = [
  { name: "Boracay", tag: "White-sand icon", blurb: "Powder-soft shoreline, island hopping, and sunset sailing on Station 1's famous stretch.", price: "4,999" },
  { name: "Coron", tag: "Lagoons & wrecks", blurb: "Limestone cliffs, hidden lagoons, and some of the clearest wreck-diving water in the world.", price: "5,499" },
  { name: "El Nido", tag: "Island paradise", blurb: "Turquoise lagoons, towering karsts, and island-hopping tours across the Bacuit archipelago.", price: "5,999" },
  { name: "Siargao", tag: "Surf capital", blurb: "Cloud 9's famous break, lagoon hopping, and a laid-back island rhythm.", price: "5,499" },
  { name: "Cebu", tag: "City meets sea", blurb: "Heritage, food, waterfalls, and island escapes — all from one gateway city.", price: "4,999" },
];

const NAV = ["Home", "Domestic Tours", "Flight Booking", "Destinations", "How It Works", "Travel Partner Program", "About Us", "Terms & Conditions", "Contact Us"];

/* ---------------------------------------------------------
   SMALL UI PRIMITIVES
--------------------------------------------------------- */
function Stamp({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.08em] uppercase ${className}`}>
      {children}
    </span>
  );
}

function Field({ label, required, children, hint, error }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-1 text-sm font-semibold text-[#0F2A43]">
        {label}
        {required && <span className="text-[#E8734A]">*</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-[#5B6B7A]">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-[#C1462F]">{error}</span>}
    </label>
  );
}

const inputCls = "w-full rounded-lg border border-[#D9CFBE] bg-white px-3.5 py-2.5 text-[15px] text-[#0F2A43] placeholder:text-[#9AA6B0] outline-none transition focus:border-[#1C7C8C] focus:ring-2 focus:ring-[#1C7C8C]/20 disabled:opacity-60";

/* ---------------------------------------------------------
   MAIN APP
--------------------------------------------------------- */
export default function RosalyssWandersSite() {
  const [navOpen, setNavOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [referralPartnerName, setReferralPartnerName] = useState("");

  const [form, setForm] = useState({
    fullName: "", email: "", mobile: "", destination: "", airport: "",
    startDate: "", endDate: "", adults: "2", children: "0", childAges: "",
    flexible: "", airfare: "", hotel: "", referral: "", notes: "",
  });

  // Funnel tracking — carried from a ?dest=...&utm_source=... link through to
  // the inquiry submission so the admin dashboard can see visits vs. inquiries
  // generated by each destination's social post.
  const [funnelMeta, setFunnelMeta] = useState(null);

  // Section 24 — capture ?ref=CODE, ?dest=NAME, and utm_* params from the URL
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      const dest = params.get("dest");
      const utmSource = params.get("utm_source");
      const utmMedium = params.get("utm_medium");
      const utmCampaign = params.get("utm_campaign");

      if (ref) {
        setForm((f) => ({ ...f, referral: ref.toUpperCase() }));
        sb(`rpc/lookup_referral_code`, { method: "POST", body: JSON.stringify({ p_code: ref.toUpperCase() }) })
          .then((rows) => { if (rows && rows[0]) setReferralPartnerName(rows[0].display_name); })
          .catch(() => {});
      }

      if (dest) {
        const matched = DESTINATIONS.find((d) => d.name.toLowerCase() === dest.toLowerCase());
        const destinationName = matched ? matched.name : dest;
        setForm((f) => ({ ...f, destination: destinationName }));
        setFunnelMeta({ destination: destinationName, utmSource, utmMedium, utmCampaign });

        // Log the visit once per page load (guarded so React StrictMode's
        // double-invoke in dev doesn't double-count it).
        const guardKey = `rw_funnel_visit_logged_${destinationName}_${utmSource || ""}`;
        if (!window.sessionStorage.getItem(guardKey)) {
          window.sessionStorage.setItem(guardKey, "1");
          sb("funnel_events", {
            method: "POST",
            headers: { Prefer: "return=minimal" },
            body: JSON.stringify({
              destination_name: destinationName,
              event_type: "visit",
              utm_source: utmSource,
              utm_medium: utmMedium,
              utm_campaign: utmCampaign,
              referral_code: ref ? ref.toUpperCase() : null,
            }),
          }).catch(() => {});
        }

        setTimeout(() => {
          document.getElementById("inquiry")?.scrollIntoView({ behavior: "smooth" });
        }, 400);
      }
    } catch (_) {}
  }, []);

  const hotelOptions = useMemo(() => {
    const d = HOTELS[form.destination];
    if (!d) return null;
    if (d.flat) return { flat: d.flat };
    return { tiers: d.tiers };
  }, [form.destination]);

  function update(key, value) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "destination") next.hotel = "";
      return next;
    });
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Please tell us your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Please enter a valid email address.";
    if (!/^(\+?63|0)?9\d{9}$/.test(form.mobile.replace(/\s|-/g, ""))) e.mobile = "Please enter a valid PH mobile number.";
    if (!form.destination) e.destination = "Please choose a destination.";
    if (!form.startDate || !form.endDate) e.dates = "Almost there! Please complete your travel dates so we can prepare an accurate quotation.";
    if (Number(form.adults) < 1) e.adults = "At least one adult traveler is required.";
    if (Number(form.children) > 0 && !form.childAges.trim()) e.childAges = "Please share the age of each child traveling.";
    if (!form.airfare) e.airfare = "Let us know if you need airfare included.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      // Fold the extra trip details (airport, dates, flexibility, airfare,
      // hotel, child ages) into notes, since the live inquiries table only
      // has a single free-text notes column for this level of detail.
      const detailLines = [
        form.airport && `Preferred origin airport: ${form.airport}`,
        form.flexible && `Flexible on promo dates: ${form.flexible}`,
        form.airfare && `Airfare required: ${form.airfare}`,
        form.hotel && `Preferred hotel: ${form.hotel}`,
        Number(form.children) > 0 && form.childAges && `Child ages: ${form.childAges}`,
        form.notes && `Additional notes: ${form.notes}`,
      ].filter(Boolean);

      const travelDates = form.startDate && form.endDate ? `${form.startDate} to ${form.endDate}` : null;

      await sb("rpc/create_public_inquiry", {
        method: "POST",
        body: JSON.stringify({
          p_full_name: form.fullName,
          p_email: form.email,
          p_mobile: form.mobile,
          p_destination_name: form.destination,
          p_travel_dates: travelDates,
          p_pax_adults: Number(form.adults) || 1,
          p_pax_children: Number(form.children) || 0,
          p_notes: detailLines.join(" · ") || null,
          p_referral_code: form.referral.trim() || null,
          p_utm_source: funnelMeta?.utmSource || null,
          p_utm_medium: funnelMeta?.utmMedium || null,
          p_utm_campaign: funnelMeta?.utmCampaign || null,
        }),
      });

      // If this inquiry came in through a destination funnel link, log the
      // conversion so the admin dashboard can show visits vs. inquiries.
      if (funnelMeta?.destination) {
        sb("funnel_events", {
          method: "POST",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({
            destination_name: funnelMeta.destination,
            event_type: "inquiry",
            utm_source: funnelMeta.utmSource,
            utm_medium: funnelMeta.utmMedium,
            utm_campaign: funnelMeta.utmCampaign,
            referral_code: form.referral.trim() || null,
          }),
        }).catch(() => {});
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || "Something went wrong submitting your inquiry. Please try again or contact us directly.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FBF7EF] text-[#0F2A43] antialiased" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui" }}>
      <GoogleFonts />

      {/* ---------------- NAV ---------------- */}
      <header className="sticky top-0 z-40 border-b border-[#0F2A43]/8 bg-[#FBF7EF]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div className="leading-tight">
              <div className="font-display text-[17px] font-semibold tracking-tight text-[#0F2A43]">Rosalyss Wanders</div>
              <div className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-[#1C7C8C]">Travel &amp; Tours Services</div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 xl:flex">
            {NAV.slice(0, 7).map((item) => (
              <a key={item} href="#" className="text-[13.5px] font-medium text-[#3C4A57] transition hover:text-[#0F2A43]">
                {item}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <a href="#partner" className="text-[13.5px] font-semibold text-[#1C7C8C] hover:text-[#155f6b]">Become a Travel Partner</a>
            <a href="#inquiry" className="rounded-full bg-[#0F2A43] px-4.5 py-2.5 text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-[#153b5c]">
              Get a Free Quotation
            </a>
          </div>

          <button className="lg:hidden" onClick={() => setNavOpen((v) => !v)} aria-label="Menu">
            {navOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {navOpen && (
          <div className="border-t border-[#0F2A43]/8 bg-[#FBF7EF] px-5 py-4 lg:hidden">
            <div className="flex flex-col gap-3.5">
              {NAV.map((item) => (
                <a key={item} href="#" className="text-[14px] font-medium text-[#3C4A57]">{item}</a>
              ))}
              <a href="#inquiry" className="mt-1 rounded-full bg-[#0F2A43] px-4 py-2.5 text-center text-[14px] font-semibold text-white">
                Get a Free Quotation
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#E8A33D22,transparent_55%),radial-gradient(ellipse_at_bottom_left,#1C7C8C22,transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-12 lg:px-8 lg:pb-24 lg:pt-16">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <Stamp className="border-[#E8A33D]/40 bg-[#E8A33D]/10 text-[#9C6A1B]">
                <Sunset size={13} /> Domestic Tours from ₱4,999 per person
              </Stamp>
              <h1 className="font-display mt-5 text-[38px] font-semibold leading-[1.08] tracking-tight text-[#0F2A43] sm:text-[48px] lg:text-[54px]">
                Explore the Philippines.
                <br />
                We&rsquo;ll handle the details.
              </h1>
              <p className="mt-5 max-w-xl text-[16.5px] leading-relaxed text-[#3C4A57]">
                Affordable domestic tour packages, flight bookings, and land arrangements designed for couples, families, solo travelers, and groups.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <a href="#inquiry" className="rounded-full bg-[#0F2A43] px-6 py-3.5 text-[14.5px] font-semibold text-white shadow-md transition hover:bg-[#153b5c]">
                  Get a Free Quotation
                </a>
                <a href="#destinations" className="rounded-full border border-[#0F2A43]/15 bg-white px-6 py-3.5 text-[14.5px] font-semibold text-[#0F2A43] transition hover:border-[#0F2A43]/30">
                  Explore Destinations
                </a>
              </div>
              <p className="mt-5 text-[12.5px] text-[#5B6B7A]">
                Free &amp; Easy Land Arrangement — starting from ₱4,999/pax. Subject to availability, travel dates, hotel selection, number of travelers, and applicable terms.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {[
                { icon: Anchor, label: "Island Hopping", sub: "Coron · El Nido" },
                { icon: Compass, label: "Surf & Lagoons", sub: "Siargao" },
                { icon: Sunset, label: "Sunset Sails", sub: "Boracay" },
                { icon: MapPin, label: "City & Sea", sub: "Cebu" },
              ].map(({ icon: Icon, label, sub }, i) => (
                <div
                  key={label}
                  className={`rounded-2xl border border-[#0F2A43]/8 bg-white p-5 shadow-sm ${i % 2 === 1 ? "translate-y-5" : ""}`}
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#1C7C8C]/10 text-[#1C7C8C]">
                    <Icon size={17} />
                  </div>
                  <div className="text-[14px] font-semibold text-[#0F2A43]">{label}</div>
                  <div className="text-[12px] text-[#5B6B7A]">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- TRUST ---------------- */}
      <section className="border-y border-[#0F2A43]/8 bg-white py-14">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1C7C8C]">Why travel with Rosalyss Wanders</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { icon: Users, title: "Personalized Assistance", body: "We help you find a travel arrangement suited to your needs." },
              { icon: Compass, title: "Hassle-Free Planning", body: "Let us handle the details while you focus on enjoying your trip." },
              { icon: MapPin, title: "Domestic Expertise", body: "Specializing in Boracay, Coron, El Nido, Siargao, and Cebu." },
              { icon: Plane, title: "Private & Group Options", body: "Arrangements for couples, families, friends, and groups." },
              { icon: ShieldCheck, title: "Transparent Quotations", body: "Know what's included and excluded before confirming your trip." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-xl p-1">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#0F2A43]/5 text-[#0F2A43]">
                  <Icon size={18} />
                </div>
                <div className="text-[14.5px] font-semibold text-[#0F2A43]">{title}</div>
                <div className="mt-1 text-[13px] leading-relaxed text-[#5B6B7A]">{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- DESTINATIONS ---------------- */}
      <section id="destinations" className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1C7C8C]">Featured Destinations</p>
              <h2 className="font-display mt-2 text-[28px] font-semibold text-[#0F2A43] sm:text-[32px]">Five islands, endless ways to go.</h2>
            </div>
            <p className="max-w-sm text-[13.5px] text-[#5B6B7A]">Each destination is available as a Private Tour, Group Tour, or Free &amp; Easy land arrangement.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {DESTINATIONS.map((d) => (
              <div key={d.name} className="group overflow-hidden rounded-2xl border border-[#0F2A43]/8 bg-white shadow-sm transition hover:shadow-lg">
                <div className="relative h-40 bg-gradient-to-br from-[#1C7C8C] via-[#155f6b] to-[#0F2A43]">
                  <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,white,transparent_35%),radial-gradient(circle_at_80%_60%,white,transparent_30%)]" />
                  <Stamp className="absolute left-4 top-4 border-white/30 bg-white/15 text-white backdrop-blur-sm">{d.tag}</Stamp>
                  <div className="font-display absolute bottom-4 left-4 text-[22px] font-semibold text-white">{d.name}</div>
                </div>
                <div className="p-5">
                  <p className="text-[13.5px] leading-relaxed text-[#3C4A57]">{d.blurb}</p>
                  <p className="mt-3 text-[13px] font-semibold text-[#0F2A43]">From ₱{d.price}<span className="font-normal text-[#5B6B7A]">/pax</span></p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {["Private", "Group", "Free & Easy"].map((t) => (
                      <span key={t} className="rounded-full bg-[#0F2A43]/5 px-2.5 py-1 text-[11px] font-medium text-[#3C4A57]">{t}</span>
                    ))}
                  </div>
                  <button
                    onClick={() => { update("destination", d.name); document.getElementById("inquiry")?.scrollIntoView({ behavior: "smooth" }); }}
                    className="mt-4 w-full rounded-lg border border-[#0F2A43]/15 py-2.5 text-[13px] font-semibold text-[#0F2A43] transition group-hover:border-[#0F2A43] group-hover:bg-[#0F2A43] group-hover:text-white"
                  >
                    Get a Quotation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- TOUR TYPES ---------------- */}
      <section className="bg-[#0F2A43] py-16 text-white lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E8A33D]">Three ways to travel</p>
          <h2 className="font-display mt-2 max-w-lg text-[28px] font-semibold sm:text-[32px]">Choose the arrangement that fits your trip.</h2>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {[
              { icon: Users, title: "Private Tours", body: "For couples, families, friends, and customized groups who want their own itinerary and pace.", cta: "Request Private Tour Quote" },
              { icon: Plane, title: "Group Tours", body: "For larger groups, barkadas, organizations, and special occasions traveling together.", cta: "Request Group Quote" },
              { icon: Compass, title: "Free & Easy", body: "Accommodation and land arrangements handled, with the flexibility to explore on your own.", cta: "Check Package", badge: "From ₱4,999/pax" },
            ].map(({ icon: Icon, title, body, cta, badge }) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#E8A33D]/15 text-[#E8A33D]">
                  <Icon size={18} />
                </div>
                <div className="font-display text-[19px] font-semibold">{title}</div>
                {badge && <div className="mt-1 text-[12.5px] font-medium text-[#E8A33D]">{badge}</div>}
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-white/70">{body}</p>
                <a href="#inquiry" className="mt-5 inline-block rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold text-[#0F2A43] transition hover:bg-[#E8A33D] hover:text-[#0F2A43]">
                  {cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- INQUIRY FORM ---------------- */}
      <section id="inquiry" className="py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          <div className="mb-9 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1C7C8C]">Request a Quotation</p>
            <h2 className="font-display mt-2 text-[28px] font-semibold text-[#0F2A43] sm:text-[32px]">Tell us about your trip.</h2>
            <p className="mx-auto mt-2.5 max-w-md text-[13.5px] text-[#5B6B7A]">
              Submitting this form is an inquiry only. We&rsquo;ll confirm availability and send your official quotation by email.
            </p>
          </div>

          {submitted ? (
            <ConfirmationCard form={form} onReset={() => { setSubmitted(false); }} />
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl border border-[#0F2A43]/8 bg-white p-6 shadow-sm sm:p-8">
              {/* boarding-pass style header strip */}
              <div className="mb-7 flex items-center justify-between rounded-xl bg-[#0F2A43] px-5 py-3.5 text-white">
                <div className="flex items-center gap-2 text-[12.5px] font-semibold tracking-wide">
                  <Plane size={15} className="text-[#E8A33D]" /> TRAVEL INQUIRY
                </div>
                <div className="text-[11px] text-white/60">Rosalyss Wanders</div>
              </div>

              {form.referral && (
                <div className="mb-6 flex items-center gap-2 rounded-lg bg-[#1C7C8C]/10 px-4 py-2.5 text-[13px] font-medium text-[#155f6b]">
                  <Sparkles size={14} />
                  Referral Partner: {form.referral}{referralPartnerName ? ` (${referralPartnerName})` : ""}
                </div>
              )}

              <div className="mb-6">
                <h3 className="mb-3.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-[#1C7C8C]">Customer Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full Name" required error={errors.fullName}>
                    <input className={inputCls} value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Juan Dela Cruz" />
                  </Field>
                  <Field label="Mobile Number" required error={errors.mobile}>
                    <input className={inputCls} value={form.mobile} onChange={(e) => update("mobile", e.target.value)} placeholder="09XX XXX XXXX" />
                  </Field>
                  <Field label="Email Address" required error={errors.email}>
                    <input className={inputCls} type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@email.com" />
                  </Field>
                </div>
              </div>

              <div className="mb-6 border-t border-dashed border-[#0F2A43]/12 pt-6">
                <h3 className="mb-3.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-[#1C7C8C]">Travel Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Destination" required error={errors.destination}>
                    <select className={inputCls} value={form.destination} onChange={(e) => update("destination", e.target.value)}>
                      <option value="">Select destination</option>
                      {Object.keys(HOTELS).map((d) => <option key={d} value={d}>{d}</option>)}
                      <option value="Other">Other Domestic Destination</option>
                    </select>
                  </Field>
                  <Field label="Airport of Origin">
                    <input className={inputCls} value={form.airport} onChange={(e) => update("airport", e.target.value)} placeholder="e.g., Manila (MNL)" />
                  </Field>
                  <Field label="Travel Start Date" required error={errors.dates}>
                    <input className={inputCls} type="date" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} />
                  </Field>
                  <Field label="Travel End Date" required>
                    <input className={inputCls} type="date" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} />
                  </Field>
                  <Field label="Number of Adults" required error={errors.adults}>
                    <input className={inputCls} type="number" min="1" value={form.adults} onChange={(e) => update("adults", e.target.value)} />
                  </Field>
                  <Field label="Number of Children">
                    <input className={inputCls} type="number" min="0" value={form.children} onChange={(e) => update("children", e.target.value)} />
                  </Field>
                  {Number(form.children) > 0 && (
                    <Field label="Child Age/s" required error={errors.childAges} hint="Separate ages with a comma">
                      <input className={inputCls} value={form.childAges} onChange={(e) => update("childAges", e.target.value)} placeholder="e.g., 4, 9" />
                    </Field>
                  )}
                  <Field label="Flexible on Promo Dates?">
                    <div className="flex gap-2">
                      {["Yes", "No"].map((v) => (
                        <button type="button" key={v} onClick={() => update("flexible", v)}
                          className={`flex-1 rounded-lg border py-2.5 text-[13.5px] font-semibold transition ${form.flexible === v ? "border-[#1C7C8C] bg-[#1C7C8C]/10 text-[#155f6b]" : "border-[#D9CFBE] text-[#5B6B7A]"}`}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="With Airfare?" required error={errors.airfare}>
                    <div className="flex gap-2">
                      {["Yes", "No"].map((v) => (
                        <button type="button" key={v} onClick={() => update("airfare", v)}
                          className={`flex-1 rounded-lg border py-2.5 text-[13.5px] font-semibold transition ${form.airfare === v ? "border-[#1C7C8C] bg-[#1C7C8C]/10 text-[#155f6b]" : "border-[#D9CFBE] text-[#5B6B7A]"}`}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>

                <div className="mt-4">
                  <Field label="Preferred Hotel / Accommodation" hint={!form.destination ? "Select a destination first to see available hotels" : undefined}>
                    <select className={inputCls} value={form.hotel} disabled={!hotelOptions} onChange={(e) => update("hotel", e.target.value)}>
                      <option value="">{hotelOptions ? "Select a hotel (optional)" : "Choose a destination first"}</option>
                      {hotelOptions?.flat && hotelOptions.flat.map((h) => <option key={h} value={h}>{h}</option>)}
                      {hotelOptions?.tiers && Object.entries(hotelOptions.tiers).map(([tier, list]) => (
                        <optgroup key={tier} label={tier}>
                          {list.map((h) => <option key={h} value={h}>{h}</option>)}
                        </optgroup>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>

              <div className="mb-6 border-t border-dashed border-[#0F2A43]/12 pt-6">
                <h3 className="mb-3.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-[#1C7C8C]">Referral</h3>
                <Field label="Referral Code" hint="Have a Travel Partner's code? Enter it here.">
                  <input className={inputCls} value={form.referral} onChange={(e) => update("referral", e.target.value)} placeholder="e.g., RW-ROS1A2B" />
                </Field>
              </div>

              <div className="mb-7 border-t border-dashed border-[#0F2A43]/12 pt-6">
                <Field label="Special Requests / Notes">
                  <textarea className={inputCls} rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Anything else we should know?" />
                </Field>
              </div>

              {submitError && (
                <div className="mb-5 flex items-start gap-2 rounded-lg bg-[#C1462F]/10 px-4 py-3 text-[13px] text-[#C1462F]">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" /> {submitError}
                </div>
              )}

              <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0F2A43] py-3.5 text-[14.5px] font-semibold text-white shadow-md transition hover:bg-[#153b5c] disabled:opacity-70">
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? "Submitting..." : "Submit Travel Inquiry"}
              </button>
              <p className="mt-3 text-center text-[12px] text-[#5B6B7A]">
                Submitting an inquiry does not automatically confirm a booking. Availability and rates must be confirmed by Rosalyss Wanders Travel and Tours Services.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ---------------- TRAVEL PARTNER ---------------- */}
      <PartnerSection />

      {/* ---------------- CONTACT ---------------- */}
      <section className="border-t border-[#0F2A43]/8 bg-white py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1C7C8C]">Contact Us</p>
              <h2 className="font-display mt-2 text-[26px] font-semibold text-[#0F2A43]">Prefer to talk it through?</h2>
              <p className="mt-2.5 text-[13.5px] text-[#5B6B7A]">
                Crystal East, Brgy. Bombongan, Morong, Rizal, Philippines
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="tel:+63287311021" className="flex items-center gap-2 rounded-full bg-[#0F2A43] px-5 py-3 text-[13.5px] font-semibold text-white">
                  <Phone size={15} /> Call Us
                </a>
                <a href="https://wa.me/639204387243" className="flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-[13.5px] font-semibold text-white">
                  <MessageCircle size={15} /> WhatsApp Us
                </a>
                <a href="#inquiry" className="flex items-center gap-2 rounded-full border border-[#0F2A43]/15 px-5 py-3 text-[13.5px] font-semibold text-[#0F2A43]">
                  Request a Quotation
                </a>
              </div>
            </div>
            <div className="rounded-2xl border border-[#0F2A43]/8 bg-[#FBF7EF] p-6 text-[13.5px] text-[#3C4A57]">
              <div className="mb-2 font-semibold text-[#0F2A43]">Telephone</div>
              <div className="mb-4">+63 2 8731 1021</div>
              <div className="mb-2 font-semibold text-[#0F2A43]">WhatsApp / Call &amp; Text</div>
              <div>+63 920 438 7243</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="bg-[#0F2A43] py-12 text-white/70">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2.5">
                <LogoMark dark />
                <span className="font-display text-[15px] font-semibold text-white">Rosalyss Wanders</span>
              </div>
              <p className="mt-3 text-[12.5px] leading-relaxed">Domestic Tours · Flight Booking · Private Tours · Group Tours · Travel Partner Program</p>
              <div className="mt-4 flex items-center gap-3">
                <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Rosalyss Wanders on Facebook" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
                  <Facebook size={16} />
                </a>
                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Rosalyss Wanders on Instagram" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
                  <Instagram size={16} />
                </a>
              </div>
            </div>
            <div>
              <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-white/90">Quick Links</div>
              <ul className="space-y-2 text-[12.5px]">
                <li><a href="#">Terms &amp; Conditions</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#partner">Travel Partner Program</a></li>
                <li><a href="#inquiry">Get a Free Quotation</a></li>
              </ul>
            </div>
            <div>
              <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-white/90">Contact</div>
              <ul className="space-y-2 text-[12.5px]">
                <li>Crystal East, Brgy. Bombongan</li>
                <li>Morong, Rizal, Philippines</li>
                <li>+63 2 8731 1021</li>
                <li>+63 920 438 7243</li>
              </ul>
            </div>
            <div>
              <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-white/90">Destinations</div>
              <ul className="space-y-2 text-[12.5px]">
                {DESTINATIONS.map((d) => <li key={d.name}>{d.name}</li>)}
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-[11.5px] text-white/50">
            <span>© 2026 Rosalyss Wanders Travel and Tours Services. All Rights Reserved.</span>
            <a href="/admin" className="text-white/30 transition hover:text-white/60">Staff / Admin Login</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------------------------------------------------------
   CONFIRMATION CARD (post-submission)
--------------------------------------------------------- */
function ConfirmationCard({ form, onReset }) {
  return (
    <div className="rounded-2xl border border-[#0F2A43]/8 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#1C7C8C]/10 text-[#1C7C8C]">
        <Check size={26} />
      </div>
      <h3 className="font-display text-[22px] font-semibold text-[#0F2A43]">Thank You! We Received Your Travel Inquiry.</h3>
      <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-[#5B6B7A]">
        Your travel profile and inquiry have been successfully received. Our team will review your requested destination, travel dates, accommodation preference, and airfare requirements, then prepare your quotation proposal and send it to <span className="font-semibold text-[#0F2A43]">{form.email || "your registered email"}</span>.
      </p>

      <div className="mx-auto mt-6 max-w-sm rounded-xl border border-[#0F2A43]/8 bg-[#FBF7EF] p-4 text-left text-[13px]">
        <Row k="Destination" v={form.destination || "—"} />
        <Row k="Travel Dates" v={form.startDate && form.endDate ? `${form.startDate} to ${form.endDate}` : "—"} />
        <Row k="Travelers" v={`${form.adults} adult(s)${Number(form.children) > 0 ? `, ${form.children} child(ren)` : ""}`} />
        <Row k="Airfare" v={form.airfare || "—"} />
        <Row k="Hotel" v={form.hotel || "Not yet selected"} last />
      </div>

      <div className="mt-7 text-left">
        <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#1C7C8C]">Next Steps</div>
        <ol className="space-y-2 text-[13px] text-[#3C4A57]">
          {["We review your inquiry.", "We check availability and applicable rates.", "We prepare your quotation proposal.", "We email the quotation and next instructions.", "You review and approve the quotation.", "Your booking is processed after payment/confirmation requirements are completed."].map((s, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0F2A43]/8 text-[10.5px] font-semibold text-[#0F2A43]">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-6 rounded-lg bg-[#E8A33D]/10 px-4 py-3 text-[12px] leading-relaxed text-[#9C6A1B]">
        Please note: submission of an inquiry does not automatically confirm a booking. Availability and rates must be confirmed by Rosalyss Wanders Travel and Tours Services.
      </p>

      <button onClick={onReset} className="mt-6 text-[13px] font-semibold text-[#1C7C8C]">Submit another inquiry</button>
    </div>
  );
}

function Row({ k, v, last }) {
  return (
    <div className={`flex items-center justify-between py-2 ${!last ? "border-b border-[#0F2A43]/6" : ""}`}>
      <span className="text-[#5B6B7A]">{k}</span>
      <span className="font-medium text-[#0F2A43]">{v}</span>
    </div>
  );
}

/* ---------------------------------------------------------
   TRAVEL PARTNER SECTION — live registration + dashboard lookup
--------------------------------------------------------- */
function PartnerSection() {
  const [mode, setMode] = useState("intro"); // intro | register | dashboard
  const [regForm, setRegForm] = useState({ fullName: "", email: "", gcash: "", signature: "" });
  const [regBusy, setRegBusy] = useState(false);
  const [regError, setRegError] = useState("");
  const [regResult, setRegResult] = useState(null); // { code, name, already_registered }
  const [copied, setCopied] = useState("");

  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [dashboard, setDashboard] = useState(null);

  async function submitRegistration(e) {
    e.preventDefault();
    setRegError("");
    if (!regForm.fullName.trim() || !regForm.email.trim() || !regForm.gcash.trim()) {
      setRegError("Please complete your name, email, and GCash number.");
      return;
    }
    if (regForm.signature.trim().toLowerCase() !== regForm.fullName.trim().toLowerCase()) {
      setRegError("Please type your full name exactly as entered above to sign the agreement.");
      return;
    }
    setRegBusy(true);
    try {
      const result = await sb("rpc/register_partner", {
        method: "POST",
        body: JSON.stringify({
          p_name: regForm.fullName.trim(),
          p_email: regForm.email.trim(),
          p_gcash: regForm.gcash.trim(),
          p_signature: regForm.signature.trim(),
        }),
      });
      setRegResult(result);
      setMode("registered");
    } catch (err) {
      setRegError(err.message || "We couldn't complete your registration. Please try again.");
    } finally {
      setRegBusy(false);
    }
  }

  async function runLookup(e) {
    e.preventDefault();
    setLookupError("");
    setDashboard(null);
    if (!lookupQuery.trim()) return;
    setLookupBusy(true);
    try {
      const result = await sb("rpc/get_partner_dashboard", {
        method: "POST",
        body: JSON.stringify({ p_query: lookupQuery.trim() }),
      });
      if (!result) setLookupError("We couldn't find a partner account matching that code or email.");
      else setDashboard(result);
    } catch (err) {
      setLookupError(err.message || "Something went wrong looking up your account.");
    } finally {
      setLookupBusy(false);
    }
  }

  function copy(text, key) {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  }

  return (
    <section id="partner" className="py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-10 rounded-3xl bg-gradient-to-br from-[#E8A33D]/12 via-white to-[#1C7C8C]/8 p-8 ring-1 ring-[#0F2A43]/8 lg:grid-cols-2 lg:p-12">
          <div>
            <Stamp className="border-[#E8A33D]/40 bg-[#E8A33D]/15 text-[#9C6A1B]"><Sparkles size={13} /> Travel Partner Program</Stamp>
            <h2 className="font-display mt-4 text-[28px] font-semibold text-[#0F2A43] sm:text-[32px]">Earn while you refer travelers.</h2>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-[#3C4A57]">
              Join our Travel Partner Program and earn incentives by referring customers to Rosalyss Wanders Travel and Tours Services. Every partner gets a unique referral code and can check their referrals and earnings any time.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => setMode("register")} className="rounded-full bg-[#0F2A43] px-6 py-3.5 text-[14px] font-semibold text-white shadow-md transition hover:bg-[#153b5c]">
                Become a Travel Partner
              </button>
              <button onClick={() => setMode("dashboard")} className="rounded-full border border-[#0F2A43]/15 bg-white px-6 py-3.5 text-[14px] font-semibold text-[#0F2A43] transition hover:border-[#0F2A43]/30">
                Check My Referrals
              </button>
            </div>
            <p className="mt-4 text-[11.5px] leading-relaxed text-[#5B6B7A]">
              Commission is earned only on eligible, fully paid, confirmed bookings — see the Travel Partner Program Terms &amp; Conditions.
            </p>
          </div>

          <div className="rounded-2xl border border-[#0F2A43]/8 bg-white p-6 shadow-sm">
            {mode === "intro" && (
              <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                <Sparkles className="text-[#E8A33D]" size={26} />
                <p className="mt-3 text-[13.5px] text-[#5B6B7A]">Register as a partner or look up an existing referral code to see your dashboard.</p>
              </div>
            )}

            {mode === "register" && (
              <form onSubmit={submitRegistration}>
                <div className="mb-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#1C7C8C]">Partner Registration</div>
                <div className="space-y-3.5">
                  <Field label="Full Name" required>
                    <input className={inputCls} value={regForm.fullName} onChange={(e) => setRegForm((f) => ({ ...f, fullName: e.target.value }))} placeholder="Maria Santos" />
                  </Field>
                  <Field label="Email Address" required>
                    <input className={inputCls} type="email" value={regForm.email} onChange={(e) => setRegForm((f) => ({ ...f, email: e.target.value }))} placeholder="you@email.com" />
                  </Field>
                  <Field label="GCash Number" required hint="Used for incentive payouts. Never displayed publicly.">
                    <input className={inputCls} value={regForm.gcash} onChange={(e) => setRegForm((f) => ({ ...f, gcash: e.target.value }))} placeholder="09XX XXX XXXX" />
                  </Field>
                  <Field label="Signature (type your full name)" required hint="By typing your name you agree to the Travel Partner Program Terms & Conditions.">
                    <input className={inputCls} value={regForm.signature} onChange={(e) => setRegForm((f) => ({ ...f, signature: e.target.value }))} placeholder="Maria Santos" />
                  </Field>
                </div>
                {regError && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg bg-[#C1462F]/10 px-3.5 py-2.5 text-[12.5px] text-[#C1462F]">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" /> {regError}
                  </div>
                )}
                <button type="submit" disabled={regBusy} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#0F2A43] py-3 text-[13.5px] font-semibold text-white disabled:opacity-70">
                  {regBusy && <Loader2 size={15} className="animate-spin" />}
                  {regBusy ? "Registering..." : "Register as Travel Partner"}
                </button>
              </form>
            )}

            {mode === "registered" && regResult && (
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#1C7C8C]/10 text-[#1C7C8C]">
                  <Check size={22} />
                </div>
                <div className="text-[15px] font-semibold text-[#0F2A43]">
                  {regResult.already_registered ? "Welcome back!" : "Congratulations! Your Travel Partner account has been created."}
                </div>
                <p className="mt-1 text-[13px] text-[#5B6B7A]">
                  {regResult.already_registered ? "This email is already registered. Here's your existing referral code:" : `Your unique referral code is:`}
                </p>
                <div className="mt-4 flex items-center justify-between rounded-lg border border-dashed border-[#0F2A43]/20 bg-[#FBF7EF] px-4 py-3">
                  <span className="font-mono text-[15px] font-semibold text-[#0F2A43]">{regResult.code}</span>
                  <button onClick={() => copy(regResult.code, "code")} className="text-[#5B6B7A] hover:text-[#0F2A43]"><Copy size={15} /></button>
                </div>
                <div className="mt-2 flex items-center justify-between rounded-lg border border-dashed border-[#0F2A43]/20 bg-[#FBF7EF] px-4 py-3">
                  <span className="truncate font-mono text-[12px] text-[#0F2A43]">?ref={regResult.code}</span>
                  <button onClick={() => copy(`${window.location.origin}${window.location.pathname}?ref=${regResult.code}`, "link")} className="shrink-0 text-[#5B6B7A] hover:text-[#0F2A43]"><Copy size={15} /></button>
                </div>
                {copied && <div className="mt-2 text-[11.5px] text-[#1C7C8C]">Copied!</div>}
                <button onClick={() => { setMode("dashboard"); setLookupQuery(regResult.code); }} className="mt-5 text-[13px] font-semibold text-[#1C7C8C]">View my dashboard →</button>
              </div>
            )}

            {mode === "dashboard" && (
              <div>
                <div className="mb-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#1C7C8C]">Partner Dashboard</div>
                <form onSubmit={runLookup} className="flex gap-2">
                  <input className={inputCls} value={lookupQuery} onChange={(e) => setLookupQuery(e.target.value)} placeholder="Referral code or email" />
                  <button type="submit" disabled={lookupBusy} className="shrink-0 rounded-lg bg-[#0F2A43] px-4 text-[13px] font-semibold text-white disabled:opacity-70">
                    {lookupBusy ? <Loader2 size={15} className="animate-spin" /> : "Look up"}
                  </button>
                </form>
                {lookupError && <div className="mt-3 text-[12.5px] text-[#C1462F]">{lookupError}</div>}

                {dashboard && (
                  <div className="mt-5">
                    <div className="text-[14px] font-semibold text-[#0F2A43]">{dashboard.name} · <span className="font-mono">{dashboard.code}</span></div>
                    <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-xl bg-[#0F2A43]/[0.03] py-3">
                        <div className="text-[15px] font-semibold text-[#0F2A43]">₱{Number(dashboard.earned).toLocaleString()}</div>
                        <div className="text-[10.5px] text-[#5B6B7A]">Total Earned</div>
                      </div>
                      <div className="rounded-xl bg-[#0F2A43]/[0.03] py-3">
                        <div className="text-[15px] font-semibold text-[#0F2A43]">₱{Number(dashboard.paid_out).toLocaleString()}</div>
                        <div className="text-[10.5px] text-[#5B6B7A]">Paid Out</div>
                      </div>
                      <div className="rounded-xl bg-[#0F2A43]/[0.03] py-3">
                        <div className="text-[15px] font-semibold text-[#0F2A43]">₱{Number(dashboard.balance).toLocaleString()}</div>
                        <div className="text-[10.5px] text-[#5B6B7A]">Balance</div>
                      </div>
                    </div>
                    <div className="mt-4 max-h-52 space-y-2 overflow-y-auto pr-1">
                      {dashboard.bookings.length === 0 && <div className="py-4 text-center text-[12.5px] text-[#5B6B7A]">No referrals recorded yet.</div>}
                      {dashboard.bookings.map((b, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg bg-[#FBF7EF] px-3.5 py-2.5 text-[12.5px]">
                          <div>
                            <div className="font-medium text-[#0F2A43]">{b.customer_name}</div>
                            <div className="text-[#5B6B7A]">{b.product}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-[#0F2A43]">₱{Number(b.commission).toLocaleString()}</div>
                            <div className="text-[#5B6B7A] capitalize">{b.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   LOGO MARK — official Rosalyss Wanders seal
--------------------------------------------------------- */
function LogoMark({ dark }) {
  return (
    <img
      src="/logo.png"
      alt="Rosalyss Wanders Travel and Tours Services logo"
      width={38}
      height={38}
      className="h-[38px] w-[38px] shrink-0 object-contain"
    />
  );
}

function GoogleFonts() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');
      .font-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
    `}</style>
  );
}
