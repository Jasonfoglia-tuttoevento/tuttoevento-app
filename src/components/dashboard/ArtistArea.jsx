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
        Disponibile a breve · Piano Pro
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

const MUSIC_GENRES = ["House","Tech House","Techno","Trance","Drum & Bass","Hip Hop","Rap","R&B","Soul","Jazz","Blues","Rock","Indie","Pop","Reggae","Funk","Electronic","Ambient","Classica","Folk","Latino","Afrobeat","Altro"];
const EVENT_TYPES = ["Serata in club","Festival","Evento privato","Concerto","Opening","Matrimonio","Evento aziendale","Altro"];
const ARTIST_TYPES = ["DJ","Band","Cantante","Duo","Trio","Musicista solista","Performer","Altro"];

function Tag({ label, active, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: "5px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700,
      cursor: "pointer", border: `1px solid ${active ? ORANGE : "rgba(0,0,0,.12)"}`,
      background: active ? `${ORANGE}15` : "white", color: active ? ORANGE : MUTED,
      fontFamily: "'Manrope',system-ui,sans-serif", transition: "all .15s",
    }}>{label}</button>
  );
}

function Inp({ label, value, onChange, placeholder, type = "text", disabled, hint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: ".1em", fontFamily: "'Manrope',system-ui,sans-serif" }}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
        style={{ background: "#fbfaf8", border: "1px solid rgba(0,0,0,.1)", borderRadius: 12, padding: "10px 13px", fontSize: 13, fontFamily: "'Manrope',system-ui,sans-serif", outline: "none", opacity: disabled ? .5 : 1, width: "100%" }} />
      {hint && <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>{hint}</p>}
    </div>
  );
}

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

// ── Tab: Media Kit ─────────────────────────────────────────────
function TabMediaKit({ props }) {
  const {
    plan, stageName, setStageName, artistType, setArtistType,
    bio, setBio, city, setCity, cachet, setCachet,
    musicGenres, setMusicGenres, eventTypes, setEventTypes,
    photo, setPhoto, instagram, setInstagram, spotify, setSpotify,
    youtube, setYoutube, soundcloud, setSoundcloud, tiktok, setTiktok,
    rider, setRider, pricing, setPricing,
    saveArtistProfile, artistMessage,
  } = props;

  const isPro = plan === "pro";

  function toggleGenre(g) {
    if (!isPro && musicGenres.length >= 1 && !musicGenres.includes(g)) return;
    setMusicGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  }

  function toggleEvent(e) {
    setEventTypes(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);
  }

  return (
    <form onSubmit={saveArtistProfile} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Dati base */}
      <Card>
        <SectionTitle>Profilo artista</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
          <Inp label="Nome d'arte *" value={stageName} onChange={e => setStageName(e.target.value)} placeholder="Es. Marco DJ" />
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: ".1em", fontFamily: "'Manrope',system-ui,sans-serif" }}>Tipo artista</label>
            <select value={artistType} onChange={e => setArtistType(e.target.value)}
              style={{ background: "#fbfaf8", border: "1px solid rgba(0,0,0,.1)", borderRadius: 12, padding: "10px 13px", fontSize: 13, fontFamily: "'Manrope',system-ui,sans-serif", outline: "none" }}>
              <option value="">Seleziona...</option>
              {ARTIST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <Inp label="Città" value={city} onChange={e => setCity(e.target.value)} placeholder="Es. Milano" />
          <Inp label="Cachet netto (€)" type="number" value={cachet} onChange={e => setCachet(e.target.value)} placeholder="Es. 150" hint="Non visibile ai locali" />
        </div>
      </Card>

      {/* Bio */}
      <Card>
        <SectionTitle>
          Bio{!isPro && <ProBadge />}
        </SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <textarea value={bio} onChange={e => setBio(e.target.value)}
            maxLength={isPro ? undefined : 150}
            rows={isPro ? 5 : 3}
            placeholder={isPro ? "Racconta la tua storia..." : "Max 150 caratteri (illimitata con PRO)"}
            style={{ background: "#fbfaf8", border: "1px solid rgba(0,0,0,.1)", borderRadius: 12, padding: "10px 13px", fontSize: 13, fontFamily: "'Manrope',system-ui,sans-serif", outline: "none", resize: "vertical" }} />
          {!isPro && (
            <p style={{ fontSize: 11, color: MUTED }}>
              {bio.length}/150 caratteri · <span style={{ color: ORANGE, fontWeight: 700 }}>PRO: bio illimitata + multilingua</span>
            </p>
          )}
        </div>
      </Card>

      {/* Generi musicali */}
      <Card>
        <SectionTitle>
          Generi musicali
          {!isPro && <span style={{ fontSize: 11, color: MUTED, fontWeight: 400, marginLeft: 8 }}>Max 1 (illimitati con <span style={{ color: ORANGE }}>PRO</span>)</span>}
        </SectionTitle>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {MUSIC_GENRES.map(g => (
            <Tag key={g} label={g} active={musicGenres.includes(g)}
              onClick={() => toggleGenre(g)} />
          ))}
        </div>
        {!isPro && musicGenres.length >= 1 && (
          <div style={{ marginTop: 10, background: "rgba(255,90,0,.06)", border: "1px solid rgba(255,90,0,.2)", borderRadius: 12, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
            <span>🔒</span>
            <p style={{ fontSize: 12, color: ORANGE, fontWeight: 700, margin: 0, fontFamily: "'Manrope',system-ui,sans-serif" }}>Con il piano Pro puoi selezionare generi multipli e sottogeneri.</p>
          </div>
        )}
      </Card>

      {/* Tipi evento */}
      <Card>
        <SectionTitle>Tipi di evento</SectionTitle>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {EVENT_TYPES.map(e => (
            <Tag key={e} label={e} active={eventTypes.includes(e)} onClick={() => toggleEvent(e)} />
          ))}
        </div>
      </Card>

      {/* Foto — PRO per galleria */}
      <Card>
        <SectionTitle>Foto profilo{!isPro && <ProBadge />}</SectionTitle>
        <Inp label="URL foto principale" value={photo} onChange={e => setPhoto(e.target.value)} placeholder="https://..." />
        {photo && (
          <img src={photo} alt="Preview" style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover", marginTop: 10, border: "1px solid rgba(0,0,0,.08)" }} />
        )}
        {!isPro ? (
          <div style={{ marginTop: 12 }}>
            <ProLock feature="La galleria foto multipla" plan={plan} inline={false}>
              <div style={{ padding: "30px 20px", textAlign: "center", color: MUTED, fontSize: 13 }}>Galleria foto</div>
            </ProLock>
          </div>
        ) : (
          <p style={{ fontSize: 12, color: MUTED, marginTop: 8 }}>Con PRO puoi caricare fino a 20 foto nella galleria.</p>
        )}
      </Card>

      {/* Video showcase — solo PRO */}
      <ProLock feature="Il video showcase" plan={plan}>
        <Card>
          <SectionTitle>Video showcase <ProBadge /></SectionTitle>
          <p style={{ fontSize: 13, color: MUTED }}>Carica fino a 5 video per mostrare le tue performance.</p>
        </Card>
      </ProLock>

      {/* Social links */}
      <Card>
        <SectionTitle>
          Link social
          {!isPro && <span style={{ fontSize: 11, color: MUTED, fontWeight: 400, marginLeft: 8 }}>Max 1 attivo (<span style={{ color: ORANGE }}>PRO</span>: illimitati)</span>}
        </SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Inp label="Instagram" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@username" />
          <Inp label="Spotify" value={spotify} onChange={e => setSpotify(e.target.value)} placeholder="URL profilo" disabled={!isPro && !!instagram} />
          <Inp label="YouTube" value={youtube} onChange={e => setYoutube(e.target.value)} placeholder="URL canale" disabled={!isPro && (!!instagram || !!spotify)} />
          <Inp label="SoundCloud" value={soundcloud} onChange={e => setSoundcloud(e.target.value)} placeholder="URL profilo" disabled={!isPro && (!!instagram || !!spotify || !!youtube)} />
          <Inp label="TikTok" value={tiktok} onChange={e => setTiktok(e.target.value)} placeholder="@username" disabled={!isPro} />
        </div>
        {!isPro && (
          <div style={{ marginTop: 10, fontSize: 12, color: MUTED }}>🔒 Con <span style={{ color: ORANGE, fontWeight: 700 }}>PRO</span> tutti i social sono attivi contemporaneamente.</div>
        )}
      </Card>

      {/* Rider tecnico — solo PRO */}
      <ProLock feature="Il rider tecnico e press kit PDF" plan={plan}>
        <Card>
          <SectionTitle>Rider tecnico & Press Kit PDF <ProBadge /></SectionTitle>
          <textarea value={rider} onChange={e => setRider(e.target.value)} rows={4}
            placeholder="Es. 2 casse frontali, mixer 4 canali, monitor..."
            style={{ width: "100%", background: "#fbfaf8", border: "1px solid rgba(0,0,0,.1)", borderRadius: 12, padding: "10px 13px", fontSize: 13, fontFamily: "'Manrope',system-ui,sans-serif", outline: "none", resize: "vertical" }} />
          <p style={{ fontSize: 12, color: MUTED, marginTop: 8 }}>Il PDF viene generato automaticamente e condiviso con i locali.</p>
        </Card>
      </ProLock>

      {/* Badge verificato — solo PRO */}
      {!isPro && (
        <div style={{ background: "rgba(255,90,0,.04)", border: "1px solid rgba(255,90,0,.15)", borderRadius: 18, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 28 }}>✅</span>
          <div>
            <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, color: INK, margin: 0 }}>Badge verificato <ProBadge /></p>
            <p style={{ fontSize: 12, color: MUTED, margin: "4px 0 0", fontFamily: "'Manrope',system-ui,sans-serif" }}>Con il piano Pro ottieni il badge di artista verificato. Appari in cima ai risultati e i locali si fidano di più di te.</p>
          </div>
        </div>
      )}

      {/* Salva */}
      {artistMessage && (
        <p style={{ fontSize: 13, fontWeight: 700, color: artistMessage.includes("Errore") ? "#dc2626" : "#16a34a", fontFamily: "'Manrope',system-ui,sans-serif" }}>{artistMessage}</p>
      )}
      <button type="submit" style={{ background: INK, color: "white", border: "none", borderRadius: 100, padding: "13px 32px", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "'Manrope',system-ui,sans-serif", alignSelf: "flex-start" }}>
        Salva profilo
      </button>
    </form>
  );
}

// ── Tab: Calendario ────────────────────────────────────────────
function TabCalendario({ availableDates, setAvailableDates, bookedSlots, plan }) {
  const [newDate, setNewDate] = useState("");

  function addDate() {
    if (!newDate || availableDates.includes(newDate)) return;
    setAvailableDates(prev => [...prev, newDate].sort());
    setNewDate("");
  }

  function removeDate(d) {
    setAvailableDates(prev => prev.filter(x => x !== d));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <SectionTitle>Disponibilità</SectionTitle>
        <p style={{ fontSize: 13, color: MUTED, marginBottom: 14 }}>Aggiungi le date in cui sei disponibile per eventi.</p>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
            style={{ background: "#fbfaf8", border: "1px solid rgba(0,0,0,.1)", borderRadius: 12, padding: "10px 13px", fontSize: 13, fontFamily: "'Manrope',system-ui,sans-serif", outline: "none" }} />
          <button type="button" onClick={addDate}
            style={{ background: ORANGE, color: "white", border: "none", borderRadius: 12, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Manrope',system-ui,sans-serif" }}>
            Aggiungi
          </button>
        </div>
        {availableDates.length === 0 ? (
          <p style={{ fontSize: 13, color: "rgba(0,0,0,.3)" }}>Nessuna data aggiunta.</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {availableDates.map(d => (
              <div key={d} style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "6px 12px" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#16a34a" }}>{d}</span>
                <button type="button" onClick={() => removeDate(d)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontWeight: 700, fontSize: 14, lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Sync Google Calendar — PRO */}
      <ProLock feature="La sincronizzazione con Google Calendar" plan={plan}>
        <Card>
          <SectionTitle>Sync Google Calendar <ProBadge /></SectionTitle>
          <p style={{ fontSize: 13, color: MUTED }}>Sincronizza automaticamente le date disponibili con il tuo Google Calendar.</p>
          <button disabled style={{ background: "#0a0a0b", color: "white", border: "none", borderRadius: 100, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "not-allowed", fontFamily: "'Manrope',system-ui,sans-serif", opacity: .5 }}>
            Connetti Google Calendar
          </button>
        </Card>
      </ProLock>

      {bookedSlots?.length > 0 && (
        <Card>
          <SectionTitle>Date occupate</SectionTitle>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {bookedSlots.map((d, i) => (
              <div key={i} style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "6px 12px", fontSize: 13, fontWeight: 600, color: "#c2410c" }}>{d}</div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Tab: Analitiche ────────────────────────────────────────────
function TabAnalitiche({ bookings, plan }) {
  const totalBookings = bookings.length;
  const confirmed = bookings.filter(b => ["confirmed","accettato","accepted"].includes((b.status||"").toLowerCase())).length;
  const revenue = bookings.filter(b => ["confirmed","accettato","accepted"].includes((b.status||"").toLowerCase()))
    .reduce((s, b) => s + (Number(b.cachet) || Number(b.artistCachet) || 0), 0);

  const fmt = n => new Intl.NumberFormat("it-IT", { style:"currency", currency:"EUR", maximumFractionDigits:0 }).format(n);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* KPI base — disponibili a tutti */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12 }}>
        {[["Booking totali", totalBookings, false],["Confermati", confirmed, false],["Cachet incassato", fmt(revenue), true]].map(([label, val, accent]) => (
          <div key={label} style={{ background: accent ? INK : "white", border: `1px solid ${accent ? "transparent" : "rgba(0,0,0,.06)"}`, borderRadius: 20, padding: "16px 18px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: accent ? "rgba(255,255,255,.5)" : MUTED, margin: "0 0 6px", fontFamily: "'Manrope',system-ui,sans-serif" }}>{label}</p>
            <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: "-.03em", color: accent ? "white" : INK, margin: 0 }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Analitiche avanzate — solo PRO */}
      <ProLock feature="Le analitiche avanzate del profilo" plan={plan}>
        <Card>
          <SectionTitle>Analitiche avanzate <ProBadge /></SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12, marginBottom: 16 }}>
            {[["Visite profilo","—"],["Chi ha guardato","—"],["Da dove","—"]].map(([label, val]) => (
              <div key={label} style={{ background: "#fbfaf8", borderRadius: 16, padding: "14px 16px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: MUTED, margin: "0 0 4px" }}>{label}</p>
                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: INK, margin: 0 }}>{val}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: MUTED }}>Dati aggiornati in tempo reale. Scopri quali locali guardano il tuo profilo e da dove arriva il traffico.</p>
        </Card>
      </ProLock>

      {/* Recensioni — solo PRO */}
      <ProLock feature="Le recensioni dai locali" plan={plan}>
        <Card>
          <SectionTitle>Recensioni dai locali <ProBadge /></SectionTitle>
          <p style={{ fontSize: 13, color: MUTED }}>I locali possono lasciare recensioni verificate dopo ogni evento. Le recensioni aumentano la credibilità e la posizione nei risultati.</p>
        </Card>
      </ProLock>

    </div>
  );
}

// ── Tab: Estratto conto ────────────────────────────────────────
function TabEstratto({ bookings }) {
  const confirmed = bookings.filter(b => ["confirmed","accettato","accepted"].includes((b.status||"").toLowerCase()));
  const fmt = n => new Intl.NumberFormat("it-IT", { style:"currency", currency:"EUR", maximumFractionDigits:0 }).format(n);
  const total = confirmed.reduce((s, b) => s + (Number(b.cachet) || Number(b.artistCachet) || 0), 0);

  return (
    <Card>
      <SectionTitle>Estratto conto</SectionTitle>
      {confirmed.length === 0 ? (
        <p style={{ fontSize: 13, color: "rgba(0,0,0,.3)" }}>Nessun booking confermato ancora.</p>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid rgba(0,0,0,.07)" }}>
                  {["Evento","Data","Locale","Cachet netto"].map(h => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, color: MUTED, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {confirmed.map((b, i) => (
                  <tr key={b.id || i} style={{ borderBottom: "1px solid rgba(0,0,0,.05)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>{b.eventTitle || "—"}</td>
                    <td style={{ padding: "10px 12px", color: MUTED }}>{b.eventDate || "—"}</td>
                    <td style={{ padding: "10px 12px", color: MUTED }}>{b.organizerName || "—"}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700, color: ORANGE }}>{fmt(Number(b.cachet) || Number(b.artistCachet) || 0)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: "2px solid rgba(0,0,0,.1)", background: "#fbfaf8" }}>
                  <td colSpan={3} style={{ padding: "12px", fontWeight: 800 }}>TOTALE INCASSATO</td>
                  <td style={{ padding: "12px", fontWeight: 800, color: ORANGE, fontSize: 15 }}>{fmt(total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  );
}

// ── Main component ─────────────────────────────────────────────
export default function ArtistArea(props) {
  const tabMapA = { profile:"mediakit", calendar:"calendario", analytics:"analitiche", earnings:"estratto" };
  const initialTab = tabMapA[props.tab] || props.tab || "mediakit";
  const { currentUser } = props;
  const plan = currentUser?.plan || "free";
  const [tab, setTab] = useState(initialTab);

  const s = {
  };

  return (
    <div id="artist-area" style={{ fontFamily: "'Manrope',system-ui,sans-serif", color: INK, display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Tab content */}
      {tab === "mediakit"   && <TabMediaKit props={{ ...props, plan }} />}
      {tab === "calendario" && <TabCalendario availableDates={props.availableDates} setAvailableDates={props.setAvailableDates} bookedSlots={props.bookedSlots} plan={plan} />}
      {tab === "analitiche" && <TabAnalitiche bookings={props.bookings || []} plan={plan} />}
      {tab === "estratto"   && <TabEstratto bookings={props.bookings || []} />}
    </div>
  );
}