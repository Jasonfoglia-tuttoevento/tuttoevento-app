"use client";
import VerifiedBadge from "@/components/VerifiedBadge";

import { useState, useEffect } from "react";

function ProLock({ feature = "questa funzionalità", children, plan }) {
  const isPro = plan === "pro";
  if (isPro) return children ?? null;
  return (
    <div style={{ background:"rgba(255,90,0,.04)", border:"1px dashed rgba(255,90,0,.25)", borderRadius:18, padding:"20px", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:12 }}>
      <div style={{ width:36, height:36, borderRadius:10, background:"#0a0a0b", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="7" width="12" height="9" rx="2" fill="white"/>
          <path d="M3.5 7V5C3.5 2.79 5.07 1 7 1C8.93 1 10.5 2.79 10.5 5V7" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>
      <div>
        <p style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:14, color:"#0a0a0b", margin:"0 0 4px", letterSpacing:"-.02em" }}>Funzione Piano Pro</p>
        <p style={{ fontFamily:"Manrope,system-ui,sans-serif", fontSize:12, color:"#6b6b73", margin:0, lineHeight:1.5 }}>{feature} è disponibile nel piano Pro.</p>
      </div>
      <div style={{ background:"rgba(255,90,0,.08)", border:"1px solid rgba(255,90,0,.2)", borderRadius:100, padding:"7px 16px", fontSize:11, color:"#ff5a00", fontWeight:700, fontFamily:"Manrope,system-ui,sans-serif" }}>
        Disponibile a breve · €19,90/mese
      </div>
    </div>
  );
}

function ProBadge() {
  return <span style={{ display:"inline-flex", alignItems:"center", background:"rgba(255,90,0,.12)", border:"1px solid rgba(255,90,0,.25)", borderRadius:100, padding:"1px 8px", fontSize:10, fontWeight:800, color:"#ff5a00", verticalAlign:"middle", marginLeft:6 }}>PRO</span>;
}


const ORANGE = "#ff5a00";
const INK = "#0a0a0b";
const MUTED = "#6b6b73";

function Card({ children, style = {} }) {
  return (
    <div style={{ background: "white", border: "1px solid rgba(0,0,0,.06)", borderRadius: 24, padding: "20px 22px", ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: "-.02em", color: INK, marginBottom: 14, marginTop: 0 }}>{children}</h3>;
}

function Inp({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: ".1em", fontFamily: "'Manrope',system-ui,sans-serif" }}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ background: "#fbfaf8", border: "1px solid rgba(0,0,0,.1)", borderRadius: 12, padding: "10px 13px", fontSize: 13, fontFamily: "'Manrope',system-ui,sans-serif", outline: "none", width: "100%" }} />
    </div>
  );
}

// ── Tab: Overview ──────────────────────────────────────────────
function TabOverview({ currentUser, bookings, plan }) {
  const pending   = bookings.filter(b => ["pending","in_attesa"].includes((b.status||"").toLowerCase())).length;
  const confirmed = bookings.filter(b => ["confirmed","accettato","accepted"].includes((b.status||"").toLowerCase())).length;
  const fmt = n => new Intl.NumberFormat("it-IT", { style:"currency", currency:"EUR", maximumFractionDigits:0 }).format(n);
  const spent = bookings.filter(b => ["confirmed","accettato","accepted"].includes((b.status||"").toLowerCase()))
    .reduce((s, b) => s + (Number(b.publicPrice) || Number(b.cachet) || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12 }}>
        {[["Richieste inviate", bookings.length, false],["Booking confermati", confirmed, false],["Budget speso", fmt(spent), true]].map(([label, val, accent]) => (
          <div key={label} style={{ background: accent ? INK : "white", border: `1px solid ${accent ? "transparent" : "rgba(0,0,0,.06)"}`, borderRadius: 20, padding: "16px 18px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: accent ? "rgba(255,255,255,.5)" : MUTED, margin: "0 0 6px" }}>{label}</p>
            <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: "-.03em", color: accent ? "white" : INK, margin: 0 }}>{val}</p>
          </div>
        ))}
      </div>

      {bookings.length > 0 && (
        <Card>
          <SectionTitle>Ultime richieste</SectionTitle>
          {bookings.slice(0, 5).map((b, i) => (
            <div key={b.id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,.05)", gap: 10 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>{b.artistName || "—"}</p>
                <p style={{ fontSize: 11, color: MUTED, margin: "2px 0 0" }}>{b.eventDate || b.date || "—"}</p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100,
                background: ["confirmed","accettato","accepted"].includes((b.status||"").toLowerCase()) ? "rgba(22,163,74,.1)" : "rgba(217,119,6,.1)",
                color: ["confirmed","accettato","accepted"].includes((b.status||"").toLowerCase()) ? "#16a34a" : "#d97706" }}>
                {b.status || "—"}
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ── Tab: Marketplace ───────────────────────────────────────────
function TabMarketplace({ artists, plan, onContact }) {
  const [search, setSearch]     = useState("");
  const [genreFilter, setGenre] = useState("");

  const filtered = artists.filter(a => {
    const name = (a.stageName || a.name || "").toLowerCase();
    const genre = (a.musicGenres || a.genres || "").toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase());
    const matchGenre  = !genreFilter || genre.includes(genreFilter.toLowerCase());
    return matchSearch && matchGenre;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Filtri base */}
      <Card>
        <SectionTitle>Cerca artisti</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Inp label="Nome / stile" value={search} onChange={e => setSearch(e.target.value)} placeholder="Es. DJ, cantante..." />
          <Inp label="Genere" value={genreFilter} onChange={e => setGenre(e.target.value)} placeholder="Es. House, Jazz..." />
        </div>
      </Card>

      {/* Filtri avanzati + AI matching — solo PRO */}
      <ProLock feature="I filtri avanzati e l'AI matching" plan={plan}>
        <Card>
          <SectionTitle>Filtri avanzati + AI matching <ProBadge /></SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10 }}>
            <Inp label="Budget max (€)" placeholder="Es. 500" />
            <Inp label="Distanza (km)" placeholder="Es. 50" />
            <Inp label="Disponibilità" type="date" placeholder="" />
          </div>
          <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(255,90,0,.06)", borderRadius: 12, fontSize: 13, color: ORANGE, fontWeight: 700 }}>
            🤖 AI matching: suggerisce i 3 artisti più adatti in base a storico, budget e tipo evento
          </div>
        </Card>
      </ProLock>

      {/* Grid artisti */}
      {filtered.length === 0 ? (
        <Card><p style={{ fontSize: 13, color: "rgba(0,0,0,.3)" }}>Nessun artista trovato.</p></Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
          {filtered.map(a => (
            <div key={a.id} style={{ background: "white", border: "1px solid rgba(0,0,0,.07)", borderRadius: 22, overflow: "hidden", transition: "box-shadow .2s" }}>
              {a.photo && <img src={a.photo} alt={a.stageName || a.name} style={{ width: "100%", height: 140, objectFit: "cover" }} />}
              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, margin: 0 }}>{a.stageName || a.name}</p>
                {a.verified && <VerifiedBadge size={15} />}
              </div>
                </div>
                <p style={{ fontSize: 12, color: ORANGE, fontWeight: 700, margin: "0 0 4px" }}>{a.musicGenres || a.genres || "—"}</p>
                <p style={{ fontSize: 12, color: MUTED, margin: "0 0 12px" }}>📍 {a.city || "Italia"}</p>
                <button type="button" onClick={() => onContact && onContact(a)}
                  style={{ width: "100%", background: INK, color: "white", border: "none", borderRadius: 12, padding: "10px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Manrope',system-ui,sans-serif" }}>
                  Richiedi contatto
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab: CRM ───────────────────────────────────────────────────
function TabCRM({ bookings, plan }) {
  const [notes, setNotes] = useState({});

  const STATI = ["pending","reviewed","confirmed","rejected"];
  const STATUS_LABEL = { pending:"In attesa", reviewed:"In revisione", confirmed:"Confermato", rejected:"Rifiutato" };
  const STATUS_COLOR = { pending:"#d97706", reviewed:"#2563eb", confirmed:"#16a34a", rejected:"#dc2626" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Pipeline base */}
      <Card>
        <SectionTitle>Pipeline richieste</SectionTitle>
        {bookings.length === 0 ? (
          <p style={{ fontSize: 13, color: "rgba(0,0,0,.3)" }}>Nessuna richiesta inviata ancora.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {bookings.slice(0, 8).map((b, i) => (
              <div key={b.id || i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fbfaf8", borderRadius: 16, padding: "12px 16px", gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.artistName || "Artista"}</p>
                  <p style={{ fontSize: 11, color: MUTED, margin: "2px 0 0" }}>{b.eventDate || "—"} {b.eventTitle ? `· ${b.eventTitle}` : ""}</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, flexShrink: 0,
                  background: (STATUS_COLOR[b.status] || "#6b7280") + "18",
                  color: STATUS_COLOR[b.status] || "#6b7280" }}>
                  {STATUS_LABEL[b.status] || b.status || "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* CRM avanzato — solo PRO */}
      <ProLock feature="Il CRM completo con note, rating e storico" plan={plan}>
        <Card>
          <SectionTitle>CRM avanzato — Note & Rating <ProBadge /></SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(bookings.slice(0, 3)).map((b, i) => (
              <div key={b.id || i} style={{ background: "#fbfaf8", borderRadius: 16, padding: "14px 16px", border: "1px solid rgba(0,0,0,.07)" }}>
                <p style={{ fontWeight: 700, fontSize: 13, margin: "0 0 8px" }}>{b.artistName || "Artista"}</p>
                <textarea placeholder="Aggiungi note private su questo artista..." rows={2}
                  style={{ width: "100%", background: "white", border: "1px solid rgba(0,0,0,.1)", borderRadius: 10, padding: "8px 10px", fontSize: 12, fontFamily: "'Manrope',system-ui,sans-serif", outline: "none", resize: "none" }} />
                <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#fbbf24" }}>★</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </ProLock>

      {/* Export CSV — solo PRO */}
      <ProLock feature="L'export CSV dei dati" plan={plan}>
        <Card>
          <SectionTitle>Export dati <ProBadge /></SectionTitle>
          <p style={{ fontSize: 13, color: MUTED, marginBottom: 12 }}>Esporta tutto lo storico booking e contatti in formato CSV.</p>
          <button disabled style={{ background: INK, color: "white", border: "none", borderRadius: 100, padding: "10px 24px", fontWeight: 700, fontSize: 13, cursor: "not-allowed", fontFamily: "'Manrope',system-ui,sans-serif", opacity: .5 }}>
            Esporta CSV
          </button>
        </Card>
      </ProLock>
    </div>
  );
}

// ── Tab: Analitiche ────────────────────────────────────────────
function TabAnalitiche({ bookings, plan }) {
  const fmt = n => new Intl.NumberFormat("it-IT", { style:"currency", currency:"EUR", maximumFractionDigits:0 }).format(n);
  const confirmed = bookings.filter(b => ["confirmed","accettato","accepted"].includes((b.status||"").toLowerCase()));
  const spent = confirmed.reduce((s, b) => s + (Number(b.publicPrice) || Number(b.cachet) || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12 }}>
        {[["Booking totali", bookings.length],["Confermati", confirmed.length],["Budget totale", fmt(spent)]].map(([label, val]) => (
          <div key={label} style={{ background: "white", border: "1px solid rgba(0,0,0,.06)", borderRadius: 20, padding: "16px 18px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: MUTED, margin: "0 0 6px" }}>{label}</p>
            <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 24, color: INK, margin: 0 }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Analitiche avanzate — solo PRO */}
      <ProLock feature="Le analitiche avanzate e il benchmark di zona" plan={plan}>
        <Card>
          <SectionTitle>Analitiche avanzate + benchmark zona <ProBadge /></SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12, marginBottom: 14 }}>
            {["Trend serate","Generi più prenotati","Benchmark budget zona"].map(label => (
              <div key={label} style={{ background: "#fbfaf8", borderRadius: 14, padding: "12px 14px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, margin: "0 0 4px" }}>{label}</p>
                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: INK, margin: 0 }}>—</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: MUTED }}>Confronta le tue performance con altri locali nella tua zona.</p>
        </Card>
      </ProLock>

      {/* Multi-utente staff — solo PRO */}
      <ProLock feature="La gestione multi-utente dello staff" plan={plan}>
        <Card>
          <SectionTitle>Multi-utente staff <ProBadge /></SectionTitle>
          <p style={{ fontSize: 13, color: MUTED }}>Aggiungi fino a 5 membri del tuo staff con accesso alla dashboard. Ognuno ha le proprie credenziali e permessi.</p>
          <button disabled style={{ background: INK, color: "white", border: "none", borderRadius: 100, padding: "10px 24px", fontWeight: 700, fontSize: 13, cursor: "not-allowed", fontFamily: "'Manrope',system-ui,sans-serif", opacity: .5, marginTop: 12 }}>
            + Aggiungi membro staff
          </button>
        </Card>
      </ProLock>
    </div>
  );
}

// ── Tab: Estratto conto ────────────────────────────────────────
function TabEstratto({ bookings }) {
  const fmt = n => new Intl.NumberFormat("it-IT", { style:"currency", currency:"EUR", maximumFractionDigits:0 }).format(n);
  const confirmed = bookings.filter(b => ["confirmed","accettato","accepted"].includes((b.status||"").toLowerCase()));
  const total = confirmed.reduce((s, b) => s + (Number(b.publicPrice) || Number(b.cachet) || 0), 0);

  return (
    <Card>
      <SectionTitle>Estratto conto</SectionTitle>
      {confirmed.length === 0 ? (
        <p style={{ fontSize: 13, color: "rgba(0,0,0,.3)" }}>Nessun booking confermato ancora.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid rgba(0,0,0,.07)" }}>
                {["Artista","Evento","Data","Importo"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, color: MUTED }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {confirmed.map((b, i) => (
                <tr key={b.id || i} style={{ borderBottom: "1px solid rgba(0,0,0,.05)" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 700 }}>{b.artistName || "—"}</td>
                  <td style={{ padding: "10px 12px", color: MUTED }}>{b.eventTitle || "—"}</td>
                  <td style={{ padding: "10px 12px", color: MUTED }}>{b.eventDate || "—"}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 700, color: ORANGE }}>{fmt(Number(b.publicPrice) || Number(b.cachet) || 0)}</td>
                </tr>
              ))}
              <tr style={{ borderTop: "2px solid rgba(0,0,0,.1)", background: "#fbfaf8" }}>
                <td colSpan={3} style={{ padding: "12px", fontWeight: 800 }}>TOTALE SPESO</td>
                <td style={{ padding: "12px", fontWeight: 800, color: ORANGE, fontSize: 15 }}>{fmt(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

// ── Main ───────────────────────────────────────────────────────
export default function OrganizerArea({ currentUser, events = [], artists = [], bookings = [], title, setTitle, date, setDate, artist, setArtist, promoter, setPromoter, tab: initialTab }) {
  const plan = currentUser?.plan || "free";
  const tabMap = { bookings:"crm", analytics:"analitiche", earnings:"estratto" };
  const [tab, setTab] = useState(tabMap[initialTab] || initialTab || "overview");

  const [venueName, setVenueName]   = useState("");
  const [venueCity, setVenueCity]   = useState("");
  const [venueType, setVenueType]   = useState("");
  const [venuePhoto, setVenuePhoto] = useState("");
  const [saveMsg, setSaveMsg]       = useState("");

  useEffect(() => {
    fetch("/api/venue-profile")
      .then(r => r.json())
      .then(d => {
        if (!d) return;
        setVenueName(d.name || "");
        setVenueCity(d.city || "");
        setVenueType(d.type || "");
        setVenuePhoto(d.photo || "");
      }).catch(() => {});
  }, []);

  async function saveVenueProfile(e) {
    e.preventDefault();
    setSaveMsg("Salvataggio...");
    const res = await fetch("/api/venue-profile", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: venueName, city: venueCity, type: venueType, photo: venuePhoto }),
    });
    setSaveMsg(res.ok ? "✓ Salvato" : "Errore salvataggio");
  }

  const s = {
  };

  return (
    <div id="organizer-area" style={{ fontFamily: "'Manrope',system-ui,sans-serif", color: INK, display: "flex", flexDirection: "column", gap: 16 }}>

        

      {/* Profilo locale — badge verificato PRO */}
      {tab === "overview" && (
        <>
          <TabOverview currentUser={currentUser} bookings={bookings} plan={plan} />

          <Card>
            <SectionTitle>Profilo locale</SectionTitle>
            <form onSubmit={saveVenueProfile} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
              <Inp label="Nome locale" value={venueName} onChange={e => setVenueName(e.target.value)} placeholder="Es. Club Aurora" />
              <Inp label="Città" value={venueCity} onChange={e => setVenueCity(e.target.value)} placeholder="Es. Napoli" />
              <Inp label="Tipo locale" value={venueType} onChange={e => setVenueType(e.target.value)} placeholder="Es. Disco, Bar, Ristorante" />
              <Inp label="Foto principale (URL)" value={venuePhoto} onChange={e => setVenuePhoto(e.target.value)} placeholder="https://..." />
              {saveMsg && <p style={{ gridColumn: "1/-1", fontSize: 13, fontWeight: 700, color: saveMsg.includes("✓") ? "#16a34a" : "#dc2626" }}>{saveMsg}</p>}
              <button type="submit" style={{ gridColumn: "1/-1", alignSelf: "flex-start", background: INK, color: "white", border: "none", borderRadius: 100, padding: "11px 28px", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "'Manrope',system-ui,sans-serif", width: "fit-content" }}>
                Salva profilo
              </button>
            </form>

            {/* Badge verificato — PRO */}
            {plan === "free" && (
              <div style={{ marginTop: 16, background: "rgba(255,90,0,.04)", border: "1px solid rgba(255,90,0,.15)", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 22 }}>✅</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>Badge verificato <ProBadge /></p>
                  <p style={{ fontSize: 12, color: MUTED, margin: "3px 0 0" }}>Il badge aumenta la fiducia degli artisti e la tua posizione nel marketplace.</p>
                </div>
              </div>
            )}
          </Card>
        </>
      )}

      {tab === "marketplace" && <TabMarketplace artists={artists} plan={plan} />}
      {tab === "crm"         && <TabCRM bookings={bookings} plan={plan} />}
      {tab === "analitiche"  && <TabAnalitiche bookings={bookings} plan={plan} />}
      {tab === "estratto"    && <TabEstratto bookings={bookings} />}
    </div>
  );
}