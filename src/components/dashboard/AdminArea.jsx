"use client";

import { useMemo, useState, useEffect } from "react";
import {
  aggregate, commissionOf, cachetOf, isConfirmed, formatEuro,
  financials, formatPct, monthlySeries, topBy,
} from "./commissions";

/* AdminArea — pannello di controllo aziendale completo.
   Props: users[], events[], bookings[]
   Carica/salva i dati finanziari e i contatti via /api/finance e /api/contacts.
*/

export default function AdminArea({ users = [], events = [], bookings = [] }) {
  const [tab, setTab] = useState("overview");
  const [finance, setFinance] = useState({});
  const [contacts, setContacts] = useState([]);
  const [savingFin, setSavingFin] = useState(false);
  const [finMsg, setFinMsg] = useState("");

  // form finanza
  const [form, setForm] = useState({
    fixedCostsMonthly: "", variableCosts: "", depreciation: "",
    interest: "", taxes: "", investedCapital: "", commissionRate: "0.08", notes: "",
  });

  // form contatto
  const [contact, setContact] = useState({ name: "", role: "", email: "", phone: "", notes: "" });

  useEffect(() => {
    fetch("/api/finance").then(r => r.json()).then((d) => {
      setFinance(d || {});
      setForm({
        fixedCostsMonthly: d?.fixed_costs_monthly ?? "",
        variableCosts: d?.variable_costs ?? "",
        depreciation: d?.depreciation ?? "",
        interest: d?.interest ?? "",
        taxes: d?.taxes ?? "",
        investedCapital: d?.invested_capital ?? "",
        commissionRate: d?.commission_rate ?? "0.08",
        notes: d?.notes ?? "",
      });
    }).catch(() => {});
    fetch("/api/contacts").then(r => r.json()).then((d) => setContacts(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const rate = Number(finance.commission_rate) || 0.08;
  const stats = useMemo(() => aggregate(bookings, rate), [bookings, rate]);
  const fin = useMemo(() => financials(finance, stats), [finance, stats]);
  const series = useMemo(() => monthlySeries(bookings, rate), [bookings, rate]);
  const topArtists = useMemo(() => topBy(bookings, "artistName", 5), [bookings]);
  const topVenues = useMemo(() => topBy(bookings, "organizerName", 5), [bookings]);

  const byRole = useMemo(() => {
    const r = { organizer: [], artist: [], promoter: [], referent: [], admin: [], other: [] };
    users.forEach((u) => (r[u.role] ? r[u.role] : r.other).push(u));
    return r;
  }, [users]);

  // crescita utenti per mese
  const userGrowth = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      const k = String(u.created_at || "").slice(0, 7);
      if (k) map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [users]);

  // eventi managed vs autonomi
  const eventModes = useMemo(() => {
    let managed = 0, self = 0;
    events.forEach((e) => {
      if ((e.eventMode || e.event_mode) === "managed") managed++;
      else self++;
    });
    return { managed, self };
  }, [events]);

  async function saveFinance(e) {
    e.preventDefault();
    setSavingFin(true);
    setFinMsg("");
    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) { setFinMsg(d.error || "Errore"); return; }
      setFinance(d);
      setFinMsg("Salvato ✓");
    } catch { setFinMsg("Errore tecnico"); }
    finally { setSavingFin(false); }
  }

  async function addContact(e) {
    e.preventDefault();
    if (!contact.name) return;
    const res = await fetch("/api/contacts", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(contact),
    });
    const d = await res.json();
    if (res.ok) { setContacts([d, ...contacts]); setContact({ name: "", role: "", email: "", phone: "", notes: "" }); }
  }

  async function deleteContact(id) {
    const res = await fetch(`/api/contacts?id=${id}`, { method: "DELETE" });
    if (res.ok) setContacts(contacts.filter((c) => c.id !== id));
  }

  const kpis = [
    { label: "Ricavi (commissioni)", value: formatEuro(fin.revenue), hint: `${stats.confirmedCount} booking conf.`, accent: true },
    { label: "EBITDA", value: formatEuro(fin.ebitda), hint: `margine ${formatPct(fin.ebitdaMargin)}` },
    { label: "EBIT", value: formatEuro(fin.ebit), hint: "reddito operativo" },
    { label: "Utile netto", value: formatEuro(fin.netProfit), hint: "dopo imposte" },
    { label: "ROS", value: formatPct(fin.ros), hint: "return on sales" },
    { label: "ROI", value: formatPct(fin.roi), hint: "return on investment" },
    { label: "Costi operativi", value: formatEuro(fin.totalOpCosts), hint: "fissi + variabili" },
    { label: "Volume transato", value: formatEuro(stats.volume), hint: "cachet totali" },
  ];

  const tabs = [
    { id: "overview", label: "Panoramica" },
    { id: "artists", label: "Artisti" },
    { id: "requests", label: "Richieste contatto" },
    { id: "finance", label: "Finanza" },
    { id: "growth", label: "Crescita" },
    { id: "contacts", label: "Contatti" },
    { id: "users", label: "Utenti" },
    { id: "bookings", label: "Booking" },
  ];

  const maxSeries = Math.max(1, ...series.map((s) => s.value));

  return (
    <div className="te-area w-full max-w-full overflow-hidden space-y-6 sm:space-y-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');
        .te-area { --orange:#ff5a00; --ink:#0a0a0b; --paper:#fbfaf8; --muted:#6b6b73; font-family:'Manrope',system-ui,sans-serif; color:var(--ink); }
        .te-area .te-display { font-family:'Sora',sans-serif; letter-spacing:-0.03em; }
        .te-area input, .te-area textarea { font-family:inherit; }
        .te-area input:focus, .te-area textarea:focus { border-color:var(--orange); box-shadow:0 0 0 3px rgba(255,90,0,.12); outline:none; }
      `}</style>

      <section className="bg-white border border-black/5 rounded-3xl sm:rounded-[28px] p-5 md:p-7 shadow-sm overflow-hidden">
        <div className="mb-6">
          <p className="uppercase tracking-[0.2em] text-[var(--orange)] text-[11px] font-extrabold mb-2">Admin</p>
          <h2 className="te-display text-2xl sm:text-3xl font-extrabold leading-tight">Pannello di controllo aziendale</h2>
          <p className="text-[var(--muted)] mt-2">KPI finanziari in tempo reale, crescita, contatti e gestione completa.</p>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {kpis.map((k) => (
            <div key={k.label} className={`rounded-3xl border p-4 sm:p-5 ${k.accent ? "bg-[var(--ink)] text-white border-transparent" : "bg-[var(--paper)] border-black/5"}`}>
              <p className={`text-xs sm:text-sm font-bold ${k.accent ? "text-white/60" : "text-[var(--muted)]"}`}>{k.label}</p>
              <p className="te-display text-lg sm:text-2xl font-extrabold mt-1.5">{k.value}</p>
              <p className={`text-[11px] sm:text-xs font-bold mt-1 ${k.accent ? "text-[var(--orange)]" : "text-[var(--orange)]"}`}>{k.hint}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mt-6">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`text-sm font-bold px-4 py-2 rounded-full transition ${tab === t.id ? "bg-[var(--ink)] text-white" : "bg-[var(--paper)] border border-black/10 text-[var(--muted)] hover:border-[var(--orange)]/40"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          <section className="bg-white border border-black/5 rounded-3xl sm:rounded-[28px] p-5 md:p-7 shadow-sm">
            <h3 className="te-display text-lg sm:text-xl font-extrabold mb-4">Conto economico sintetico</h3>
            {[
              ["Ricavi (commissioni)", formatEuro(fin.revenue)],
              ["− Costi operativi", formatEuro(fin.totalOpCosts)],
              ["= EBITDA", formatEuro(fin.ebitda)],
              ["− Ammortamenti", formatEuro(fin.depreciation)],
              ["= EBIT", formatEuro(fin.ebit)],
              ["− Oneri finanziari", formatEuro(fin.interest)],
              ["− Imposte", formatEuro(fin.taxes)],
              ["= Utile netto", formatEuro(fin.netProfit)],
            ].map(([k, v], i) => (
              <div key={i} className={`flex items-center justify-between py-2 text-sm ${k.startsWith("=") ? "font-bold border-t border-black/10 mt-1 pt-2" : "text-[var(--muted)]"}`}>
                <span>{k}</span><span className={k.includes("EBITDA") || k.includes("EBIT") || k.includes("Utile") ? "text-[var(--orange)] font-bold" : ""}>{v}</span>
              </div>
            ))}
          </section>

          <section className="bg-white border border-black/5 rounded-3xl sm:rounded-[28px] p-5 md:p-7 shadow-sm">
            <h3 className="te-display text-lg sm:text-xl font-extrabold mb-4">Distribuzione utenti</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              {[["Locali", byRole.organizer.length], ["Artisti", byRole.artist.length], ["Promoter", byRole.promoter.length], ["Referenti", byRole.referent.length], ["Admin", byRole.admin.length]].map(([k, v]) => (
                <div key={k} className="rounded-2xl bg-[var(--paper)] border border-black/5 p-4 text-center">
                  <p className="te-display text-2xl font-extrabold">{v}</p>
                  <p className="text-xs text-[var(--muted)] font-bold mt-1">{k}</p>
                </div>
              ))}
            </div>
            <h3 className="te-display text-base font-extrabold mb-3">Eventi: managed vs autonomi</h3>
            <div className="flex gap-3">
              <div className="flex-1 rounded-2xl bg-[var(--orange)]/10 border border-[var(--orange)]/20 p-4 text-center">
                <p className="te-display text-2xl font-extrabold text-[var(--orange)]">{eventModes.managed}</p>
                <p className="text-xs font-bold text-[var(--muted)] mt-1">Managed</p>
              </div>
              <div className="flex-1 rounded-2xl bg-[var(--paper)] border border-black/5 p-4 text-center">
                <p className="te-display text-2xl font-extrabold">{eventModes.self}</p>
                <p className="text-xs font-bold text-[var(--muted)] mt-1">Autonomi</p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* FINANCE */}
      {tab === "finance" && (
        <section className="bg-white border border-black/5 rounded-3xl sm:rounded-[28px] p-5 md:p-7 shadow-sm">
          <h3 className="te-display text-lg sm:text-xl font-extrabold mb-1">Dati finanziari</h3>
          <p className="text-[var(--muted)] text-sm mb-5">Inserisci i costi: i KPI (EBITDA, EBIT, ROS, ROI) si aggiornano in automatico.</p>
          <form onSubmit={saveFinance} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ["fixedCostsMonthly", "Costi fissi mensili (€)"],
              ["variableCosts", "Costi variabili (€)"],
              ["depreciation", "Ammortamenti (€)"],
              ["interest", "Oneri finanziari (€)"],
              ["taxes", "Imposte (€)"],
              ["investedCapital", "Capitale investito (€)"],
              ["commissionRate", "Commissione (es. 0.08 = 8%)"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm font-bold mb-1.5">{label}</label>
                <input type="number" step="any" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-3 transition" />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold mb-1.5">Note</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-3 min-h-[80px] transition" />
            </div>
            <div className="sm:col-span-2 flex items-center gap-4">
              <button disabled={savingFin} className="bg-[var(--orange)] text-white rounded-2xl px-6 py-3 font-bold hover:bg-[#e85100] transition disabled:opacity-50">
                {savingFin ? "Salvataggio..." : "Salva dati finanziari"}
              </button>
              {finMsg && <span className="font-bold text-[var(--orange)]">{finMsg}</span>}
            </div>
          </form>
        </section>
      )}

      {/* GROWTH */}
      {tab === "growth" && (
        <div className="space-y-6 sm:space-y-8">
          <section className="bg-white border border-black/5 rounded-3xl sm:rounded-[28px] p-5 md:p-7 shadow-sm">
            <h3 className="te-display text-lg sm:text-xl font-extrabold mb-4">Ricavi commissioni nel tempo</h3>
            {series.length === 0 ? <p className="text-black/45">Nessun dato.</p> : (
              <div className="flex items-end gap-2 h-48">
                {series.map((s) => (
                  <div key={s.month} className="flex-1 flex flex-col items-center justify-end gap-2">
                    <div className="w-full rounded-t-lg" style={{ height: `${(s.value / maxSeries) * 100}%`, minHeight: 4, background: "linear-gradient(180deg,var(--orange),#ffb98a)" }} />
                    <span className="text-[10px] text-[var(--muted)] font-bold rotate-0">{s.month.slice(5)}/{s.month.slice(2,4)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
            <section className="bg-white border border-black/5 rounded-3xl sm:rounded-[28px] p-5 md:p-7 shadow-sm">
              <h3 className="te-display text-lg sm:text-xl font-extrabold mb-4">Top artisti per volume</h3>
              {topArtists.length === 0 ? <p className="text-black/45">Nessun dato.</p> : topArtists.map((a, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-black/5 last:border-0">
                  <span className="font-medium break-words">{i + 1}. {a.name}</span>
                  <span className="font-bold text-[var(--orange)]">{formatEuro(a.volume)}</span>
                </div>
              ))}
            </section>
            <section className="bg-white border border-black/5 rounded-3xl sm:rounded-[28px] p-5 md:p-7 shadow-sm">
              <h3 className="te-display text-lg sm:text-xl font-extrabold mb-4">Top locali per volume</h3>
              {topVenues.length === 0 ? <p className="text-black/45">Nessun dato.</p> : topVenues.map((v, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-black/5 last:border-0">
                  <span className="font-medium break-words">{i + 1}. {v.name}</span>
                  <span className="font-bold text-[var(--orange)]">{formatEuro(v.volume)}</span>
                </div>
              ))}
            </section>
          </div>

          <section className="bg-white border border-black/5 rounded-3xl sm:rounded-[28px] p-5 md:p-7 shadow-sm">
            <h3 className="te-display text-lg sm:text-xl font-extrabold mb-4">Nuovi iscritti per mese</h3>
            {userGrowth.length === 0 ? <p className="text-black/45">Nessun dato (manca created_at sugli utenti).</p> : (
              <div className="space-y-2">
                {userGrowth.map(([m, n]) => (
                  <div key={m} className="flex items-center gap-3">
                    <span className="text-xs text-[var(--muted)] font-bold w-16">{m}</span>
                    <div className="flex-1 bg-[var(--paper)] rounded-full h-4 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, n * 10)}%`, background: "var(--orange)" }} />
                    </div>
                    <span className="text-sm font-bold w-8 text-right">{n}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* CONTACTS */}
      {tab === "contacts" && (
        <section className="bg-white border border-black/5 rounded-3xl sm:rounded-[28px] p-5 md:p-7 shadow-sm">
          <h3 className="te-display text-lg sm:text-xl font-extrabold mb-4">Rubrica contatti aziendali</h3>
          <form onSubmit={addContact} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <input placeholder="Nome" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} className="bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-3 transition" />
            <input placeholder="Ruolo (es. commercialista)" value={contact.role} onChange={(e) => setContact({ ...contact, role: e.target.value })} className="bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-3 transition" />
            <input placeholder="Email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} className="bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-3 transition" />
            <input placeholder="Telefono" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className="bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-3 transition" />
            <input placeholder="Note" value={contact.notes} onChange={(e) => setContact({ ...contact, notes: e.target.value })} className="sm:col-span-2 bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-3 transition" />
            <button className="sm:col-span-2 bg-[var(--ink)] text-white rounded-2xl px-6 py-3 font-bold hover:scale-[1.01] transition">Aggiungi contatto</button>
          </form>
          {contacts.length === 0 ? <p className="text-black/45">Nessun contatto.</p> : (
            <div className="space-y-3">
              {contacts.map((c) => (
                <div key={c.id} className="border border-black/10 rounded-2xl p-4 bg-[var(--paper)] flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold break-words">{c.name} {c.role && <span className="text-[var(--muted)] font-medium">· {c.role}</span>}</p>
                    <p className="text-sm text-[var(--muted)] break-words">{c.email} {c.phone && `· ${c.phone}`}</p>
                    {c.notes && <p className="text-sm text-[var(--muted)] mt-1 break-words">{c.notes}</p>}
                  </div>
                  <button onClick={() => deleteContact(c.id)} className="shrink-0 text-sm font-bold text-red-500 hover:text-red-700">Elimina</button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* USERS */}
      {tab === "users" && (
        <section className="bg-white border border-black/5 rounded-3xl sm:rounded-[28px] p-5 md:p-7 shadow-sm overflow-hidden">
          <h3 className="te-display text-lg sm:text-xl font-extrabold mb-4">Tutti gli utenti</h3>
          {users.length === 0 ? <p className="text-black/45">Nessun utente.</p> : (
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full text-sm border-collapse min-w-[520px]">
                <thead><tr className="text-left text-[var(--muted)]"><th className="py-2 font-bold">Nome</th><th className="py-2 font-bold">Email</th><th className="py-2 font-bold">Ruolo</th></tr></thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id || i} className="border-t border-black/5">
                      <td className="py-3 pr-3 font-medium break-words">{u.name || "—"}</td>
                      <td className="py-3 pr-3 break-words text-[var(--muted)]">{u.email || "—"}</td>
                      <td className="py-3"><span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--paper)] border border-black/10 capitalize">{u.role || "—"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ARTISTI — approvazione e prezzi */}
      {tab === "artists" && (
        <AdminArtistApproval users={users} />
      )}

      {/* RICHIESTE CONTATTO */}
      {tab === "requests" && (
        <AdminContactRequests />
      )}

      {/* BOOKINGS */}
      {tab === "bookings" && (
        <section className="bg-white border border-black/5 rounded-3xl sm:rounded-[28px] p-5 md:p-7 shadow-sm overflow-hidden">
          <h3 className="te-display text-lg sm:text-xl font-extrabold mb-4">Tutti i booking</h3>
          {bookings.length === 0 ? <p className="text-black/45">Nessun booking.</p> : (
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full text-sm border-collapse min-w-[640px]">
                <thead><tr className="text-left text-[var(--muted)]"><th className="py-2 font-bold">Evento</th><th className="py-2 font-bold">Locale</th><th className="py-2 font-bold">Artista</th><th className="py-2 font-bold">Cachet</th><th className="py-2 font-bold">Comm.</th><th className="py-2 font-bold">Stato</th></tr></thead>
                <tbody>
                  {bookings.map((b, i) => (
                    <tr key={b.id || i} className="border-t border-black/5">
                      <td className="py-3 pr-3 font-medium break-words">{b.eventTitle || "—"}</td>
                      <td className="py-3 pr-3 break-words">{b.organizerName || "—"}</td>
                      <td className="py-3 pr-3 break-words">{b.artistName || "—"}</td>
                      <td className="py-3 pr-3">{formatEuro(cachetOf(b))}</td>
                      <td className="py-3 pr-3 font-bold text-[var(--orange)]">{formatEuro(commissionOf(b, rate))}</td>
                      <td className="py-3"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isConfirmed(b) ? "bg-green-50 text-green-600" : "bg-black/5 text-[var(--muted)]"}`}>{isConfirmed(b) ? "Confermato" : "In attesa"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

/* ── Approvazione artisti ── */
const EVENT_TYPES = ["Serata in club", "Festival", "Evento privato", "Concerto", "Opening", "Altro"];

function AdminArtistApproval({ users }) {
  const artists = users.filter(u => u.role === "artist");
  const [selected, setSelected] = useState(null);
  const [pricing, setPricing] = useState([]);
  const [basePubPrice, setBasePubPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function loadPricing(artistId) {
    const res = await fetch(`/api/artist-pricing?artistId=${artistId}`);
    const data = await res.json();
    // Pre-popola tutti i tipi evento
    const map = {};
    (Array.isArray(data) ? data : []).forEach(p => { map[p.event_type] = p.public_price; });
    setPricing(EVENT_TYPES.map(t => ({ eventType: t, publicPrice: map[t] || "" })));
  }

  function selectArtist(artist) {
    setSelected(artist);
    setMsg("");
    setBasePubPrice("");
    loadPricing(artist.id);
  }

  function updatePrice(idx, val) {
    setPricing(prev => prev.map((p, i) => i === idx ? { ...p, publicPrice: val } : p));
  }

  async function save(approve) {
    if (!selected) return;
    setSaving(true); setMsg("");
    try {
      const res = await fetch("/api/artist-pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId: selected.id,
          pricing: pricing.filter(p => p.publicPrice),
          approve,
          basePubPrice: basePubPrice || (pricing.find(p => p.publicPrice)?.publicPrice) || null,
        }),
      });
      if (res.ok) {
        setMsg(approve ? "Artista approvato e pubblicato nel marketplace ✓" : "Artista rimosso dal marketplace ✓");
      } else setMsg("Errore salvataggio");
    } catch { setMsg("Errore tecnico"); }
    finally { setSaving(false); }
  }

  return (
    <div className="grid xl:grid-cols-[320px_1fr] gap-6">
      {/* Lista artisti */}
      <section className="bg-white border border-black/5 rounded-3xl p-5 shadow-sm">
        <h3 className="te-display text-lg font-extrabold mb-4">Artisti registrati</h3>
        {artists.length === 0 ? <p className="text-sm text-black/45">Nessun artista.</p> : (
          <div className="space-y-2">
            {artists.map(a => (
              <button key={a.id} onClick={() => selectArtist(a)}
                className={`w-full text-left rounded-2xl p-3 border transition text-sm ${selected?.id === a.id ? "bg-[var(--ink)] text-white border-[var(--ink)]" : "bg-[var(--paper)] border-black/5 hover:border-[var(--orange)]/40"}`}>
                <p className="font-bold">{a.name}</p>
                <p className={`text-xs mt-0.5 ${selected?.id === a.id ? "text-white/60" : "text-[var(--muted)]"}`}>{a.email}</p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Form prezzi e approvazione */}
      <section className="bg-white border border-black/5 rounded-3xl p-5 shadow-sm">
        {!selected ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-black/45">Seleziona un artista per impostare i prezzi.</p>
          </div>
        ) : (
          <>
            <h3 className="te-display text-lg font-extrabold mb-1">{selected.name}</h3>
            <p className="text-xs text-[var(--muted)] mb-5">Imposta il prezzo pubblico per tipo evento. Il cachet netto dell'artista non è visibile ai locali.</p>

            <div className="space-y-3 mb-5">
              {pricing.map((p, i) => (
                <div key={p.eventType} className="flex items-center gap-3">
                  <span className="text-sm font-bold w-40 shrink-0">{p.eventType}</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)] font-bold">€</span>
                    <input type="number" min="0" value={p.publicPrice} onChange={e => updatePrice(i, e.target.value)}
                      placeholder="Prezzo pubblico"
                      className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl pl-8 pr-4 py-2.5 text-sm focus:border-[var(--orange)] focus:outline-none transition" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold mb-1.5">Prezzo base (per filtro range marketplace) €</label>
              <input type="number" min="0" value={basePubPrice} onChange={e => setBasePubPrice(e.target.value)}
                placeholder="es. 150 — appare nel range €100–200"
                className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-2.5 text-sm focus:border-[var(--orange)] focus:outline-none transition" />
              <p className="text-[10px] text-[var(--muted)] mt-1">Determina in quale fascia budget appare l'artista nel marketplace.</p>
            </div>

            {msg && <p className="text-xs font-bold text-green-600 mb-3">{msg}</p>}

            <div className="flex gap-3 flex-wrap">
              <button disabled={saving} onClick={() => save(true)}
                className="bg-[var(--orange)] text-white rounded-2xl px-5 py-3 font-bold text-sm hover:bg-[#e85100] transition disabled:opacity-50">
                {saving ? "Salvo..." : "Salva e pubblica nel marketplace"}
              </button>
              <button disabled={saving} onClick={() => save(false)}
                className="bg-[var(--paper)] border border-black/10 text-[var(--ink)] rounded-2xl px-5 py-3 font-bold text-sm hover:border-red-300 hover:text-red-500 transition disabled:opacity-50">
                Rimuovi dal marketplace
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

/* ── Richieste contatto ── */
function AdminContactRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetch("/api/contact-request")
      .then(r => r.json())
      .then(d => { setRequests(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function updateStatus(id, status) {
    setUpdating(id);
    await fetch("/api/contact-request", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    setUpdating(null);
  }

  const statusColors = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    reviewed: "bg-blue-50 text-blue-700 border-blue-200",
    connected: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-500 border-red-200",
  };

  const statusLabels = { pending: "In attesa", reviewed: "In revisione", connected: "Connessi", rejected: "Rifiutata" };

  return (
    <section className="bg-white border border-black/5 rounded-3xl p-5 shadow-sm">
      <h3 className="te-display text-lg font-extrabold mb-4">Richieste di contatto</h3>
      {loading ? <p className="text-sm text-black/45">Caricamento...</p> :
       requests.length === 0 ? <p className="text-sm text-black/45">Nessuna richiesta.</p> : (
        <div className="space-y-3">
          {requests.map(r => (
            <div key={r.id} className="border border-black/5 rounded-2xl p-4 bg-[var(--paper)]">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="font-bold text-sm">{r.organizer_name} <span className="text-[var(--muted)] font-normal">cerca</span> {r.artist_name}</p>
                  <div className="flex flex-wrap gap-2 mt-1 text-xs text-[var(--muted)]">
                    {r.event_date && <span>📅 {r.event_date}</span>}
                    {r.event_type && <span>🎪 {r.event_type}</span>}
                    {r.budget && <span>💶 Budget: €{r.budget}</span>}
                  </div>
                  {r.notes && <p className="text-xs text-[var(--muted)] mt-1 italic">"{r.notes}"</p>}
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${statusColors[r.status] || statusColors.pending}`}>
                  {statusLabels[r.status] || r.status}
                </span>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {r.status === "pending" && (
                  <button disabled={updating === r.id} onClick={() => updateStatus(r.id, "reviewed")}
                    className="text-xs font-bold bg-[var(--ink)] text-white px-3 py-1.5 rounded-full disabled:opacity-50">
                    Prendi in carico
                  </button>
                )}
                {(r.status === "pending" || r.status === "reviewed") && (
                  <>
                    <button disabled={updating === r.id} onClick={() => updateStatus(r.id, "connected")}
                      className="text-xs font-bold bg-green-500 text-white px-3 py-1.5 rounded-full disabled:opacity-50">
                      Connetti le parti
                    </button>
                    <button disabled={updating === r.id} onClick={() => updateStatus(r.id, "rejected")}
                      className="text-xs font-bold bg-[var(--paper)] border border-red-200 text-red-500 px-3 py-1.5 rounded-full disabled:opacity-50">
                      Rifiuta
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}