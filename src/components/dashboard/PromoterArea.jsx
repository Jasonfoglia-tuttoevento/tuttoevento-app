"use client";

import { useMemo, useState, useEffect } from "react";
import { aggregate, commissionOf, cachetOf, isConfirmed, formatEuro } from "./commissions";

const ORANGE = "#ff5a00";
const INK = "#0a0a0b";
const MUTED = "#6b6b73";

const TABS = [
  { id: "overview", label: "Panoramica", icon: "📊" },
  { id: "portfolio", label: "Portfolio", icon: "🎯" },
  { id: "bookings", label: "Booking", icon: "📋" },
  { id: "richieste", label: "Richieste", icon: "📬" },
  { id: "commissioni", label: "Commissioni", icon: "💰" },
];

function KpiCard({ label, value, hint, accent }) {
  return (
    <div style={{ background: accent ? INK : "white", border: `1px solid ${accent ? "transparent" : "rgba(0,0,0,.06)"}`, borderRadius: 24, padding: "18px 20px" }}>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: accent ? "rgba(255,255,255,.5)" : MUTED, marginBottom: 6 }}>{label}</p>
      <p style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.03em", color: accent ? "white" : INK }}>{value}</p>
      {hint && <p style={{ fontSize: 11, fontWeight: 700, color: ORANGE, marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

export default function PromoterArea({ currentUser, events = [], bookings = [], users = [] }) {
  const [tab, setTab] = useState("overview");
  const [portfolio, setPortfolio] = useState([]);
  const [contactRequests, setContactRequests] = useState([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [newEntry, setNewEntry] = useState({ entityType: "artist", entityId: "" });
  const [addingEntry, setAddingEntry] = useState(false);
  const [addMsg, setAddMsg] = useState("");

  const stats = useMemo(() => aggregate(bookings), [bookings]);

  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return [...events]
      .filter(e => (e.date || e.eventDate || "") >= today)
      .sort((a, b) => (a.date || a.eventDate || "").localeCompare(b.date || b.eventDate || ""))
      .slice(0, 8);
  }, [events]);

  // Artisti e locali disponibili per il portfolio
  const availableArtists = useMemo(() => users.filter(u => u.role === "artist"), [users]);
  const availableVenues = useMemo(() => users.filter(u => u.role === "organizer"), [users]);

  useEffect(() => {
    fetch("/api/promoter-portfolio")
      .then(r => r.json())
      .then(d => { setPortfolio(Array.isArray(d) ? d : []); setLoadingPortfolio(false); })
      .catch(() => setLoadingPortfolio(false));

    fetch("/api/contact-request")
      .then(r => r.json())
      .then(d => setContactRequests(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  async function addToPortfolio(e) {
    e.preventDefault();
    if (!newEntry.entityId) { setAddMsg("Seleziona un artista o locale"); return; }
    setAddingEntry(true); setAddMsg("");
    try {
      const res = await fetch("/api/promoter-portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType: newEntry.entityType, entityId: Number(newEntry.entityId) }),
      });
      const d = await res.json();
      if (res.ok) {
        setPortfolio(prev => [d, ...prev]);
        setNewEntry({ entityType: "artist", entityId: "" });
        setAddMsg("Aggiunto al portfolio ✓");
      } else {
        setAddMsg(d.error || "Errore");
      }
    } catch { setAddMsg("Errore tecnico"); }
    setAddingEntry(false);
  }

  async function removeFromPortfolio(id) {
    await fetch(`/api/promoter-portfolio?id=${id}`, { method: "DELETE" });
    setPortfolio(prev => prev.filter(p => p.id !== id));
  }

  const portfolioArtists = portfolio.filter(p => p.entity_type === "artist");
  const portfolioVenues = portfolio.filter(p => p.entity_type === "venue");

  const confirmedBookings = bookings.filter(isConfirmed);
  const pendingBookings = bookings.filter(b => !isConfirmed(b));

  // Richieste che coinvolgono artisti/locali nel portfolio
  const myPortfolioIds = portfolio.map(p => Number(p.entity_id));
  const myRequests = contactRequests.filter(r =>
    myPortfolioIds.includes(Number(r.artist_id)) ||
    myPortfolioIds.includes(Number(r.organizer_id))
  );

  const s = {
    card: { background: "white", border: "1px solid rgba(0,0,0,.06)", borderRadius: 24, padding: "20px 22px" },
    tabBtn: (active) => ({ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 100, fontWeight: 700, fontSize: 13, cursor: "pointer", border: active ? "none" : "1px solid rgba(0,0,0,.1)", background: active ? INK : "white", color: active ? "white" : MUTED, fontFamily: "inherit", whiteSpace: "nowrap" }),
    input: { background: "#fbfaf8", border: "1px solid rgba(0,0,0,.1)", borderRadius: 14, padding: "9px 13px", fontSize: 13, fontFamily: "inherit", outline: "none" },
    badge: (color) => ({ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: color + "18", color }),
  };

  return (
    <div style={{ fontFamily: "'Manrope',system-ui,sans-serif", color: INK, display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Manrope:wght@400;600;700&display=swap');`}</style>

      {/* Header + KPI */}
      <div style={s.card}>
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: ORANGE, marginBottom: 4 }}>Promoter</p>
          <h2 style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.03em" }}>
            Ciao{currentUser?.name ? ` ${currentUser.name}` : ""}, ecco la tua area
          </h2>
          <p style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>Portfolio, booking, richieste e commissioni in un colpo d'occhio.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 16 }}>
          <KpiCard label="Artisti in portfolio" value={portfolioArtists.length} hint="nel tuo roster" />
          <KpiCard label="Locali in portfolio" value={portfolioVenues.length} hint="partner attivi" />
          <KpiCard label="Booking confermati" value={confirmedBookings.length} hint={`${pendingBookings.length} in attesa`} />
          <KpiCard label="Volume gestito" value={formatEuro(stats.volume)} hint="cachet totali" accent />
          <KpiCard label="Commissioni stimate" value={formatEuro(stats.commission)} hint="8% sul confermato" />
          <KpiCard label="Richieste portfolio" value={myRequests.length} hint="che ti coinvolgono" />
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={s.tabBtn(tab === t.id)}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Prossimi eventi */}
          <div style={s.card}>
            <h3 style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 16, marginBottom: 14 }}>Prossimi eventi</h3>
            {upcoming.length === 0 ? <p style={{ fontSize: 13, color: "rgba(0,0,0,.3)" }}>Nessun evento in programma.</p> :
              upcoming.map((e, i) => (
                <div key={e.id || i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,.05)", gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title || e.eventTitle || "Evento"}</p>
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{e.date || e.eventDate || "—"}{e.artistName ? ` · ${e.artistName}` : ""}</p>
                  </div>
                  <span style={s.badge("#6b7280")}>{e.organizer || e.organizerName || "Locale"}</span>
                </div>
              ))
            }
          </div>

          {/* Ultimi booking */}
          <div style={s.card}>
            <h3 style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 16, marginBottom: 14 }}>Ultimi booking</h3>
            {bookings.length === 0 ? <p style={{ fontSize: 13, color: "rgba(0,0,0,.3)" }}>Nessun booking.</p> :
              bookings.slice(0, 6).map((b, i) => (
                <div key={b.id || i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(0,0,0,.05)", gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.eventTitle || "—"}</p>
                    <p style={{ fontSize: 11, color: MUTED }}>{b.artistName || "—"}</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 12, color: ORANGE }}>{formatEuro(cachetOf(b))}</p>
                    <span style={s.badge(isConfirmed(b) ? "#16a34a" : "#d97706")}>{isConfirmed(b) ? "✓" : "..."}</span>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* PORTFOLIO */}
      {tab === "portfolio" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Form aggiungi */}
          <div style={s.card}>
            <h3 style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 16, marginBottom: 12 }}>Aggiungi al portfolio</h3>
            <form onSubmit={addToPortfolio} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: MUTED, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Tipologia</label>
                <select value={newEntry.entityType} onChange={e => setNewEntry(p => ({ ...p, entityType: e.target.value, entityId: "" }))} style={{ ...s.input, minWidth: 140 }}>
                  <option value="artist">Artista</option>
                  <option value="venue">Locale</option>
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: MUTED, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {newEntry.entityType === "artist" ? "Artista" : "Locale"}
                </label>
                <select value={newEntry.entityId} onChange={e => setNewEntry(p => ({ ...p, entityId: e.target.value }))} style={{ ...s.input, width: "100%" }}>
                  <option value="">Seleziona...</option>
                  {(newEntry.entityType === "artist" ? availableArtists : availableVenues).map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <button disabled={addingEntry} style={{ background: ORANGE, color: "white", border: "none", borderRadius: 100, padding: "10px 22px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                {addingEntry ? "..." : "+ Aggiungi"}
              </button>
            </form>
            {addMsg && <p style={{ fontSize: 12, fontWeight: 700, color: "#16a34a", marginTop: 8 }}>{addMsg}</p>}
          </div>

          {/* Lista portfolio */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={s.card}>
              <h3 style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 16, marginBottom: 12 }}>🎤 Artisti ({portfolioArtists.length})</h3>
              {loadingPortfolio ? <p style={{ fontSize: 13, color: "rgba(0,0,0,.3)" }}>Caricamento...</p> :
                portfolioArtists.length === 0 ? <p style={{ fontSize: 13, color: "rgba(0,0,0,.3)" }}>Nessun artista nel portfolio.</p> :
                portfolioArtists.map(p => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,.05)" }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 13 }}>{p.entity_name || "—"}</p>
                      {p.notes && <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{p.notes}</p>}
                    </div>
                    <button onClick={() => removeFromPortfolio(p.id)} style={{ background: "transparent", border: "none", color: "#dc2626", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>×</button>
                  </div>
                ))
              }
            </div>
            <div style={s.card}>
              <h3 style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 16, marginBottom: 12 }}>🏛️ Locali ({portfolioVenues.length})</h3>
              {loadingPortfolio ? <p style={{ fontSize: 13, color: "rgba(0,0,0,.3)" }}>Caricamento...</p> :
                portfolioVenues.length === 0 ? <p style={{ fontSize: 13, color: "rgba(0,0,0,.3)" }}>Nessun locale nel portfolio.</p> :
                portfolioVenues.map(p => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,.05)" }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 13 }}>{p.entity_name || "—"}</p>
                      {p.notes && <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{p.notes}</p>}
                    </div>
                    <button onClick={() => removeFromPortfolio(p.id)} style={{ background: "transparent", border: "none", color: "#dc2626", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>×</button>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* BOOKING */}
      {tab === "bookings" && (
        <div style={s.card}>
          <h3 style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 18, marginBottom: 16 }}>Tutti i booking</h3>
          {bookings.length === 0 ? <p style={{ fontSize: 13, color: "rgba(0,0,0,.3)" }}>Nessun booking.</p> : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid rgba(0,0,0,.07)" }}>
                    {["Evento", "Artista", "Locale", "Data", "Cachet", "Commissione", "Stato"].map(h => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, color: MUTED, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, i) => (
                    <tr key={b.id || i} style={{ borderBottom: "1px solid rgba(0,0,0,.05)" }}>
                      <td style={{ padding: "10px 12px", fontWeight: 700 }}>{b.eventTitle || "—"}</td>
                      <td style={{ padding: "10px 12px", color: MUTED }}>{b.artistName || "—"}</td>
                      <td style={{ padding: "10px 12px", color: MUTED }}>{b.organizerName || "—"}</td>
                      <td style={{ padding: "10px 12px" }}>{b.eventDate || "—"}</td>
                      <td style={{ padding: "10px 12px", fontWeight: 700 }}>{formatEuro(cachetOf(b))}</td>
                      <td style={{ padding: "10px 12px", fontWeight: 700, color: ORANGE }}>{formatEuro(commissionOf(b))}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={s.badge(isConfirmed(b) ? "#16a34a" : "#d97706")}>
                          {isConfirmed(b) ? "Confermato" : "In attesa"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* RICHIESTE */}
      {tab === "richieste" && (
        <div style={s.card}>
          <h3 style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Richieste che coinvolgono il tuo portfolio</h3>
          <p style={{ fontSize: 13, color: MUTED, marginBottom: 16 }}>Vedi solo le richieste dove un tuo artista o un tuo locale è coinvolto.</p>
          {myRequests.length === 0 ? <p style={{ fontSize: 13, color: "rgba(0,0,0,.3)" }}>Nessuna richiesta per il tuo portfolio.</p> :
            myRequests.map(r => (
              <div key={r.id} style={{ border: "1px solid rgba(0,0,0,.07)", borderRadius: 18, padding: "14px 16px", background: "#fbfaf8", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>{r.organizer_name} <span style={{ color: MUTED, fontWeight: 400 }}>cerca</span> {r.artist_name}</p>
                    <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
                      {r.event_date && <span style={{ fontSize: 12, color: MUTED }}>📅 {r.event_date}</span>}
                      {r.event_type && <span style={{ fontSize: 12, color: MUTED }}>🎪 {r.event_type}</span>}
                    </div>
                    {r.notes && <p style={{ fontSize: 12, color: MUTED, marginTop: 6, fontStyle: "italic" }}>"{r.notes}"</p>}
                  </div>
                  <span style={{ ...s.badge(r.status === "connected" ? "#16a34a" : r.status === "rejected" ? "#dc2626" : "#d97706"), flexShrink: 0 }}>
                    {r.status === "pending" ? "In attesa" : r.status === "reviewed" ? "In revisione" : r.status === "connected" ? "Connessi" : "Rifiutata"}
                  </span>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* COMMISSIONI */}
      {tab === "commissioni" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Riepilogo */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
            {[
              ["Volume totale", formatEuro(stats.volume)],
              ["Booking confermati", stats.confirmedCount],
              ["Commissioni stimate (8%)", formatEuro(stats.commission)],
              ["Netto agli artisti", formatEuro(stats.netToArtists)],
            ].map(([label, val]) => (
              <div key={label} style={{ background: "white", border: "1px solid rgba(0,0,0,.06)", borderRadius: 20, padding: "16px 18px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: MUTED, marginBottom: 6 }}>{label}</p>
                <p style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.03em" }}>{val}</p>
              </div>
            ))}
          </div>

          {/* Estratto dettagliato */}
          <div style={s.card}>
            <h3 style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 16, marginBottom: 14 }}>Estratto dettagliato commissioni</h3>
            {bookings.filter(isConfirmed).length === 0 ? <p style={{ fontSize: 13, color: "rgba(0,0,0,.3)" }}>Nessuna commissione confermata.</p> : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid rgba(0,0,0,.07)" }}>
                      {["Evento", "Data", "Artista", "Cachet", "Commissione 8%"].map(h => (
                        <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, color: MUTED }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.filter(isConfirmed).map((b, i) => (
                      <tr key={b.id || i} style={{ borderBottom: "1px solid rgba(0,0,0,.05)" }}>
                        <td style={{ padding: "10px 12px", fontWeight: 700 }}>{b.eventTitle || "—"}</td>
                        <td style={{ padding: "10px 12px", color: MUTED }}>{b.eventDate || "—"}</td>
                        <td style={{ padding: "10px 12px", color: MUTED }}>{b.artistName || "—"}</td>
                        <td style={{ padding: "10px 12px", fontWeight: 700 }}>{formatEuro(cachetOf(b))}</td>
                        <td style={{ padding: "10px 12px", fontWeight: 800, color: ORANGE }}>{formatEuro(commissionOf(b))}</td>
                      </tr>
                    ))}
                    {/* Totale */}
                    <tr style={{ borderTop: "2px solid rgba(0,0,0,.1)", background: "#fbfaf8" }}>
                      <td colSpan={3} style={{ padding: "12px", fontWeight: 800 }}>TOTALE</td>
                      <td style={{ padding: "12px", fontWeight: 800 }}>{formatEuro(stats.volume)}</td>
                      <td style={{ padding: "12px", fontWeight: 800, color: ORANGE }}>{formatEuro(stats.commission)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}