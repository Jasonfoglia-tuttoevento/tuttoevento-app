"use client";
import VerifiedBadge from "@/components/VerifiedBadge";
import { useState, useEffect } from "react";

/* ─── Design tokens ──────────────────────────────────────────── */
const O  = "#ff5a00";   // orange
const BG = "#0a0a0b";   // ink black
const W  = "#ffffff";
const CARD = "#111114";
const BORDER = "rgba(255,255,255,.08)";
const MUTED = "rgba(255,255,255,.38)";
const MUTED2 = "rgba(255,255,255,.12)";

/* ─── Dati ───────────────────────────────────────────────────── */
const MUSIC_GENRES = ["House","Tech House","Techno","Trance","Drum & Bass","Hip Hop","Rap","R&B","Soul","Jazz","Blues","Rock","Indie","Pop","Reggae","Funk","Electronic","Ambient","Classica","Folk","Latino","Afrobeat","Altro"];
const EVENT_TYPES  = ["Serata in club","Festival","Evento privato","Concerto","Opening","Matrimonio","Evento aziendale","Altro"];
const ARTIST_TYPES = ["DJ","Band","Cantante","Duo","Trio","Musicista solista","Performer","Altro"];
const DURATIONS    = [
  { key:"1h",       label:"1 ora"      },
  { key:"2h",       label:"2 ore"      },
  { key:"3h",       label:"3 ore"      },
  { key:"fullday",  label:"Full day"   },
];

/* ─── Micro-components ───────────────────────────────────────── */
function ProLock({ feature="questa funzionalità", plan }) {
  if (plan==="pro") return null;
  return (
    <div style={{ background:"rgba(255,90,0,.06)", border:"1px dashed rgba(255,90,0,.3)", borderRadius:14, padding:"14px 16px", display:"flex", alignItems:"center", gap:12, marginTop:8 }}>
      <svg width="16" height="18" viewBox="0 0 14 16" fill="none"><rect x="1" y="7" width="12" height="9" rx="2" fill={O}/><path d="M3.5 7V5C3.5 2.79 5.07 1 7 1C8.93 1 10.5 2.79 10.5 5V7" stroke={O} strokeWidth="1.8" strokeLinecap="round"/></svg>
      <p style={{ fontSize:12, color:O, fontWeight:700, margin:0, fontFamily:"'Manrope',system-ui,sans-serif" }}>
        {feature} · <a href="/pricing" style={{ color:W, textDecoration:"none", fontWeight:800 }}>Upgrade a Pro →</a>
      </p>
    </div>
  );
}

function ProBadge() {
  return <span style={{ display:"inline-flex", alignItems:"center", background:`${O}22`, border:`1px solid ${O}55`, borderRadius:100, padding:"1px 8px", fontSize:10, fontWeight:800, color:O, verticalAlign:"middle", marginLeft:6 }}>PRO</span>;
}

function Label({ children }) {
  return <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".12em", fontFamily:"'Manrope',system-ui,sans-serif", display:"block", marginBottom:6 }}>{children}</label>;
}

function Field({ label, children, hint }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      {label && <Label>{label}</Label>}
      {children}
      {hint && <p style={{ fontSize:11, color:MUTED, margin:0, fontFamily:"'Manrope',system-ui,sans-serif" }}>{hint}</p>}
    </div>
  );
}

const inp = {
  background:"rgba(255,255,255,.06)", border:`1px solid ${BORDER}`,
  borderRadius:12, padding:"10px 14px", fontSize:13, color:W,
  fontFamily:"'Manrope',system-ui,sans-serif", outline:"none", width:"100%",
  transition:"border-color .15s",
};
const sel = { ...inp, cursor:"pointer", appearance:"none", WebkitAppearance:"none" };

function Inp({ label, value, onChange, placeholder, type="text", disabled, hint }) {
  return (
    <Field label={label} hint={hint}>
      <input type={type} value={value||""} onChange={onChange} placeholder={placeholder} disabled={disabled}
        style={{ ...inp, opacity:disabled?.4:1 }} />
    </Field>
  );
}

function Select({ label, value, onChange, options=[], placeholder="" }) {
  return (
    <Field label={label}>
      <div style={{ position:"relative" }}>
        <select value={value||""} onChange={onChange} style={sel}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => typeof o==="string"
            ? <option key={o} value={o}>{o}</option>
            : <option key={o.value} value={o.value}>{o.label}</option>
          )}
        </select>
        <svg style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="12" height="12" viewBox="0 0 12 12"><path d="M2 4l4 4 4-4" stroke={MUTED} strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
      </div>
    </Field>
  );
}

/* Tag chip selezionabile */
function Chip({ label, active, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding:"5px 13px", borderRadius:100, fontSize:12, fontWeight:700, cursor:"pointer",
      border:`1px solid ${active?O:BORDER}`,
      background: active?`${O}20`:"transparent",
      color: active?O:MUTED,
      fontFamily:"'Manrope',system-ui,sans-serif", transition:"all .15s",
    }}>
      {label}
    </button>
  );
}

/* Card scura */
function DCard({ children, style={} }) {
  return (
    <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:20, padding:"20px 22px", ...style }}>
      {children}
    </div>
  );
}

function STitle({ children, sub }) {
  return (
    <div style={{ marginBottom:16 }}>
      <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:15, letterSpacing:"-.02em", color:W, margin:0 }}>{children}</h3>
      {sub && <p style={{ fontSize:12, color:MUTED, margin:"4px 0 0", fontFamily:"'Manrope',system-ui,sans-serif" }}>{sub}</p>}
    </div>
  );
}

/* ─── Tab: Profilo ───────────────────────────────────────────── */
function TabProfilo({
  plan, stageName, setStageName, artistType, setArtistType,
  bio, setBio, city, setCity,
  musicGenres, setMusicGenres, eventTypes, setEventTypes,
  photo, setPhoto, instagram, setInstagram, spotify, setSpotify,
  youtube, setYoutube, soundcloud, setSoundcloud, tiktok, setTiktok,
  rider, setRider, saveArtistProfile, artistMessage,
}) {
  const isPro = plan === "pro";
  const safeGenres = Array.isArray(musicGenres) ? musicGenres : [];
  const safeEvents = Array.isArray(eventTypes)  ? eventTypes  : [];

  function toggleGenre(g) {
    if (!isPro && safeGenres.length >= 3 && !safeGenres.includes(g)) return;
    setMusicGenres(prev => {
      const s = Array.isArray(prev) ? prev : [];
      return s.includes(g) ? s.filter(x=>x!==g) : [...s, g];
    });
  }
  function toggleEvent(e) {
    setEventTypes(prev => {
      const s = Array.isArray(prev) ? prev : [];
      return s.includes(e) ? s.filter(x=>x!==e) : [...s, e];
    });
  }

  return (
    <form onSubmit={saveArtistProfile} style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* Dati base */}
      <DCard>
        <STitle sub="Le informazioni principali del tuo profilo">Identità artistica</STitle>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:12 }}>
          <Inp label="Nome d'arte *" value={stageName} onChange={e=>setStageName(e.target.value)} placeholder="Es. Marco DJ" />
          <Select label="Tipo artista" value={artistType} onChange={e=>setArtistType(e.target.value)} options={ARTIST_TYPES} placeholder="Seleziona..." />
          <Inp label="Città" value={city} onChange={e=>setCity(e.target.value)} placeholder="Es. Milano" />
        </div>
      </DCard>

      {/* Bio */}
      <DCard>
        <STitle sub={isPro ? "Racconta la tua storia senza limiti" : "Max 150 caratteri · illimitata con PRO"}>
          Bio {!isPro && <ProBadge />}
        </STitle>
        <textarea value={bio||""} onChange={e=>setBio(e.target.value)} maxLength={isPro?undefined:150} rows={4}
          placeholder="Descrivi il tuo stile, la tua esperienza e cosa ti rende unico..."
          style={{ ...inp, resize:"vertical", lineHeight:1.6 }} />
        {!isPro && (
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
            <p style={{ fontSize:11, color:MUTED, margin:0 }}>{(bio||"").length}/150</p>
            <a href="/pricing" style={{ fontSize:11, color:O, fontWeight:700, textDecoration:"none" }}>Sblocca bio illimitata →</a>
          </div>
        )}
      </DCard>

      {/* Generi musicali */}
      <DCard>
        <STitle sub={isPro ? "Seleziona tutti i generi che suoni" : "Max 3 generi · illimitati con PRO"}>
          Generi musicali {!isPro && <ProBadge />}
        </STitle>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {MUSIC_GENRES.map(g => (
            <Chip key={g} label={g} active={safeGenres.includes(g)}
              onClick={()=>toggleGenre(g)} />
          ))}
        </div>
        {safeGenres.length > 0 && (
          <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:6 }}>
            <p style={{ fontSize:11, color:MUTED, margin:0 }}>Selezionati:</p>
            {safeGenres.map(g => <span key={g} style={{ fontSize:11, fontWeight:700, color:O, background:`${O}15`, borderRadius:100, padding:"2px 10px" }}>{g}</span>)}
          </div>
        )}
        {!isPro && safeGenres.length >= 3 && <ProLock feature="Più di 3 generi" plan={plan} />}
      </DCard>

      {/* Tipi evento */}
      <DCard>
        <STitle sub="In quali contesti suoni?">Tipi di evento</STitle>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {EVENT_TYPES.map(e => (
            <Chip key={e} label={e} active={safeEvents.includes(e)} onClick={()=>toggleEvent(e)} />
          ))}
        </div>
      </DCard>

      {/* Foto profilo */}
      <DCard>
        <STitle sub="L'immagine che i locali vedono nel marketplace">Foto profilo</STitle>
        <Inp label="URL foto" value={photo} onChange={e=>setPhoto(e.target.value)} placeholder="https://..." />
        {photo && (
          <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:12 }}>
            <img src={photo} alt="Preview" style={{ width:64, height:64, borderRadius:12, objectFit:"cover", border:`1px solid ${BORDER}` }} />
            <p style={{ fontSize:12, color:MUTED, margin:0 }}>Anteprima foto profilo</p>
          </div>
        )}
      </DCard>

      {/* Social */}
      <DCard>
        <STitle sub={isPro?"Tutti i social attivi":"Max 1 social attivo · illimitati con PRO"}>
          Link social {!isPro && <ProBadge />}
        </STitle>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <Inp label="Instagram" value={instagram} onChange={e=>setInstagram(e.target.value)} placeholder="@username" />
          <Inp label="Spotify"   value={spotify}   onChange={e=>setSpotify(e.target.value)}   placeholder="URL profilo" disabled={!isPro&&!!instagram} />
          <Inp label="YouTube"   value={youtube}   onChange={e=>setYoutube(e.target.value)}   placeholder="URL canale"  disabled={!isPro&&(!!instagram||!!spotify)} />
          <Inp label="SoundCloud" value={soundcloud} onChange={e=>setSoundcloud(e.target.value)} placeholder="URL profilo" disabled={!isPro&&(!!instagram||!!spotify||!!youtube)} />
          <Inp label="TikTok"   value={tiktok}   onChange={e=>setTiktok(e.target.value)}   placeholder="@username"  disabled={!isPro} />
        </div>
        {!isPro && <ProLock feature="Tutti i social contemporaneamente" plan={plan} />}
      </DCard>

      {/* Rider — PRO */}
      {isPro ? (
        <DCard>
          <STitle sub="Specifiche tecniche condivise automaticamente con i locali">Rider tecnico</STitle>
          <textarea value={rider||""} onChange={e=>setRider(e.target.value)} rows={3}
            placeholder="Es. 2 casse frontali, mixer 4 canali, monitor..."
            style={{ ...inp, resize:"vertical" }} />
        </DCard>
      ) : (
        <DCard style={{ opacity:.6 }}>
          <STitle>Rider tecnico <ProBadge /></STitle>
          <ProLock feature="Il rider tecnico" plan={plan} />
        </DCard>
      )}

      {/* Salva */}
      <div style={{ display:"flex", alignItems:"center", gap:14, paddingTop:4 }}>
        <button type="submit"
          style={{ background:O, color:W, border:"none", borderRadius:100, padding:"12px 28px", fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif", transition:"all .2s", boxShadow:`0 8px 24px ${O}40` }}>
          Salva profilo
        </button>
        {artistMessage && (
          <p style={{ fontSize:13, fontWeight:700, color:artistMessage.includes("Errore")?"#f87171":"#4ade80", margin:0 }}>
            {artistMessage}
          </p>
        )}
      </div>
    </form>
  );
}

/* ─── Tab: Cachet ────────────────────────────────────────────── */
function TabCachet({ pricing={}, setPricing, eventTypes=[], saveArtistProfile, artistMessage }) {
  const [approvalStatus, setApprovalStatus] = useState(null); // null | pending | approved | rejected
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [approvalMsg, setApprovalMsg]         = useState("");
  const [publicPricing, setPublicPricing]     = useState(null);

  // Carica stato approvazione
  useEffect(() => {
    fetch("/api/pricing-approval")
      .then(r=>r.json())
      .then(d=>{
        if (!Array.isArray(d) || d.length===0) return;
        const latest = d[0];
        setApprovalStatus(latest.status);
        if (latest.public_pricing) setPublicPricing(latest.public_pricing);
      }).catch(()=>{});
  }, []);

  const safeEvents = Array.isArray(eventTypes) && eventTypes.length > 0
    ? eventTypes
    : ["Serata in club","Concerto","Evento privato","Festival"];

  function getPrice(eventType, duration) {
    return (pricing?.[eventType]?.[duration]) || "";
  }
  function setPrice(eventType, duration, value) {
    setPricing(prev => ({
      ...prev,
      [eventType]: { ...(prev?.[eventType]||{}), [duration]: value },
    }));
  }

  async function handleSaveAndRequest(e) {
    e.preventDefault();
    // Prima salva il profilo artista
    await saveArtistProfile(e);
    // Poi invia la richiesta di approvazione
    setApprovalLoading(true);
    setApprovalMsg("");
    const res = await fetch("/api/pricing-approval", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ pricing }),
    });
    const d = await res.json();
    if (!res.ok) {
      setApprovalMsg(d.error || "Errore invio");
    } else {
      setApprovalStatus("pending");
      setApprovalMsg("✓ Richiesta inviata — in attesa di approvazione");
    }
    setApprovalLoading(false);
  }

  const STATUS_CONFIG = {
    pending:  { label:"In attesa di approvazione", color:"#f59e0b", bg:"rgba(245,158,11,.1)", border:"rgba(245,158,11,.25)" },
    approved: { label:"Prezzi approvati ✓",         color:"#4ade80", bg:"rgba(74,222,128,.1)", border:"rgba(74,222,128,.25)" },
    rejected: { label:"Richiesta rifiutata",         color:"#f87171", bg:"rgba(248,113,113,.1)", border:"rgba(248,113,113,.25)" },
  };
  const sc = approvalStatus ? STATUS_CONFIG[approvalStatus] : null;

  return (
    <form onSubmit={handleSaveAndRequest} style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* Badge stato approvazione */}
      {sc && (
        <div style={{ background:sc.bg, border:`1px solid ${sc.border}`, borderRadius:14, padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:sc.color, flexShrink:0 }} />
          <p style={{ fontSize:13, fontWeight:700, color:sc.color, margin:0 }}>{sc.label}</p>
          {approvalStatus==="rejected" && (
            <p style={{ fontSize:12, color:MUTED, margin:0, marginLeft:8 }}>Modifica i prezzi e invia di nuovo.</p>
          )}
        </div>
      )}

      <DCard>
        <STitle sub="Imposta il tuo cachet netto per ogni combinazione evento × durata">
          Listino prezzi (cachet netto)
        </STitle>
        <p style={{ fontSize:12, color:MUTED, margin:"0 0 18px", lineHeight:1.6 }}>
          I prezzi che inserisci sono il tuo <strong style={{color:W}}>cachet netto privato</strong> — non visibili ai locali. Il team TuttoEvento li usa per definire il prezzo pubblico nel marketplace. Una volta approvati, verranno pubblicati.
        </p>

        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:"0 6px", fontSize:13 }}>
            <thead>
              <tr>
                <th style={{ textAlign:"left", padding:"0 12px 8px 0", fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".1em", whiteSpace:"nowrap" }}>Tipo evento</th>
                {DURATIONS.map(d => (
                  <th key={d.key} style={{ textAlign:"center", padding:"0 6px 8px", fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".1em", whiteSpace:"nowrap" }}>{d.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {safeEvents.map(ev => (
                <tr key={ev}>
                  <td style={{ padding:"6px 12px 6px 0", whiteSpace:"nowrap" }}>
                    <span style={{ fontSize:13, fontWeight:700, color:W }}>{ev}</span>
                  </td>
                  {DURATIONS.map(d => (
                    <td key={d.key} style={{ padding:"4px 6px" }}>
                      <div style={{ position:"relative" }}>
                        <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:13, color:MUTED, fontWeight:700, pointerEvents:"none" }}>€</span>
                        <input type="number" min="0" placeholder="—"
                          value={getPrice(ev, d.key)}
                          onChange={e=>setPrice(ev, d.key, e.target.value)}
                          style={{ ...inp, paddingLeft:24, textAlign:"right", width:90 }} />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Prezzi pubblici approvati */}
        {approvalStatus==="approved" && publicPricing && (
          <div style={{ marginTop:18, background:"rgba(74,222,128,.06)", border:"1px solid rgba(74,222,128,.2)", borderRadius:14, padding:"14px 16px" }}>
            <p style={{ fontSize:12, fontWeight:700, color:"#4ade80", margin:"0 0 10px", textTransform:"uppercase", letterSpacing:".1em" }}>Prezzi pubblici approvati (visibili ai locali)</p>
            {Object.entries(publicPricing).map(([ev, durations])=>(
              <div key={ev} style={{ marginBottom:8 }}>
                <p style={{ fontSize:12, fontWeight:700, color:W, margin:"0 0 4px" }}>{ev}</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {Object.entries(durations||{}).map(([dur,price])=>price?(
                    <span key={dur} style={{ fontSize:12, color:"#4ade80", background:"rgba(74,222,128,.1)", borderRadius:8, padding:"3px 10px", fontWeight:700 }}>
                      {DURATIONS.find(d=>d.key===dur)?.label||dur}: €{price}
                    </span>
                  ):null)}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop:16, background:"rgba(255,255,255,.04)", borderRadius:12, padding:"10px 14px", fontSize:12, color:MUTED, lineHeight:1.6 }}>
          💡 Aggiungi i tipi di evento nella tab <strong style={{ color:W }}>Profilo</strong> — i tipi selezionati appariranno qui.
        </div>
      </DCard>

      <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
        <button type="submit" disabled={approvalLoading || approvalStatus==="pending"}
          style={{ background: approvalStatus==="pending"?"rgba(255,255,255,.1)":O, color:W, border:"none", borderRadius:100, padding:"12px 28px", fontWeight:800, fontSize:14, cursor:approvalStatus==="pending"?"not-allowed":"pointer", fontFamily:"'Manrope',system-ui,sans-serif", boxShadow:approvalStatus==="pending"?"none":`0 8px 24px ${O}40`, opacity:approvalStatus==="pending"?.6:1, transition:"all .2s" }}>
          {approvalLoading ? "Invio..." : approvalStatus==="pending" ? "⏳ In attesa di approvazione" : approvalStatus==="approved" ? "Aggiorna listino" : "Salva e invia per approvazione →"}
        </button>
        {(artistMessage||approvalMsg) && (
          <p style={{ fontSize:13, fontWeight:700, color:(artistMessage||approvalMsg).includes("Errore")?"#f87171":"#4ade80", margin:0 }}>
            {approvalMsg||artistMessage}
          </p>
        )}
      </div>
    </form>
  );
}

/* ─── Tab: Calendario ────────────────────────────────────────── */
function TabCalendario({ availableDates=[], setAvailableDates, bookedSlots=[], plan }) {
  const [newDate, setNewDate] = useState("");
  function addDate() {
    if (!newDate || availableDates.includes(newDate)) return;
    setAvailableDates(prev => [...(prev||[]), newDate].sort());
    setNewDate("");
  }
  function removeDate(d) { setAvailableDates(prev=>(prev||[]).filter(x=>x!==d)); }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <DCard>
        <STitle sub="Aggiungi le date in cui sei disponibile per eventi">Disponibilità</STitle>
        <div style={{ display:"flex", gap:10, marginBottom:16 }}>
          <input type="date" value={newDate} onChange={e=>setNewDate(e.target.value)}
            style={{ ...inp, flex:1, maxWidth:200 }} />
          <button type="button" onClick={addDate}
            style={{ background:O, color:W, border:"none", borderRadius:12, padding:"10px 20px", fontWeight:700, fontSize:13, cursor:"pointer" }}>
            + Aggiungi
          </button>
        </div>
        {(availableDates||[]).length===0 ? (
          <p style={{ fontSize:13, color:MUTED }}>Nessuna data aggiunta ancora.</p>
        ) : (
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {(availableDates||[]).map(d=>(
              <div key={d} style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(74,222,128,.1)", border:"1px solid rgba(74,222,128,.25)", borderRadius:10, padding:"6px 12px" }}>
                <span style={{ fontSize:13, fontWeight:600, color:"#4ade80" }}>{d}</span>
                <button type="button" onClick={()=>removeDate(d)} style={{ background:"none", border:"none", cursor:"pointer", color:"#f87171", fontWeight:700, fontSize:14, lineHeight:1 }}>×</button>
              </div>
            ))}
          </div>
        )}
      </DCard>

      {(bookedSlots||[]).length>0 && (
        <DCard>
          <STitle sub="Date già prenotate da booking confermati">Date occupate</STitle>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {(bookedSlots||[]).map((d,i)=>(
              <div key={i} style={{ background:"rgba(251,146,60,.1)", border:"1px solid rgba(251,146,60,.25)", borderRadius:10, padding:"6px 12px", fontSize:13, fontWeight:600, color:"#fb923c" }}>
                {typeof d==="string"?d:d.date||JSON.stringify(d)}
              </div>
            ))}
          </div>
        </DCard>
      )}

      {!plan||plan!=="pro" ? (
        <DCard style={{ opacity:.7 }}>
          <STitle>Sync Google Calendar <ProBadge /></STitle>
          <ProLock feature="La sincronizzazione automatica con Google Calendar" plan={plan} />
        </DCard>
      ) : (
        <DCard>
          <STitle>Sync Google Calendar</STitle>
          <button disabled style={{ background:W, color:BG, border:"none", borderRadius:100, padding:"10px 20px", fontWeight:700, fontSize:13, cursor:"not-allowed", opacity:.5 }}>Connetti Google Calendar</button>
        </DCard>
      )}
    </div>
  );
}

/* ─── Tab: Analitiche ────────────────────────────────────────── */
function TabAnalitiche({ bookings=[], plan }) {
  const safe = Array.isArray(bookings)?bookings:[];
  const confirmed = safe.filter(b=>["confirmed","accettato","accepted"].includes((b.status||"").toLowerCase()));
  const revenue = confirmed.reduce((s,b)=>s+(Number(b.cachet)||Number(b.artistCachet)||0),0);
  const fmt = n=>new Intl.NumberFormat("it-IT",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:10 }}>
        {[
          { label:"Booking totali",    value:safe.length,        accent:false },
          { label:"Confermati",        value:confirmed.length,   accent:false },
          { label:"Cachet maturato",   value:fmt(revenue),       accent:true  },
        ].map(({label,value,accent})=>(
          <div key={label} style={{ background:accent?O:CARD, border:`1px solid ${accent?"transparent":BORDER}`, borderRadius:18, padding:"16px 18px" }}>
            <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".12em", color:accent?"rgba(255,255,255,.6)":MUTED, margin:"0 0 6px", fontFamily:"'Manrope',system-ui,sans-serif" }}>{label}</p>
            <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:22, color:W, margin:0, letterSpacing:"-.02em" }}>{value}</p>
          </div>
        ))}
      </div>
      {plan!=="pro" && (
        <DCard style={{ opacity:.7 }}>
          <STitle>Analitiche avanzate <ProBadge /></STitle>
          <p style={{ fontSize:13, color:MUTED, margin:"0 0 10px" }}>Visite profilo, chi ha guardato e da dove — aggiornato in tempo reale.</p>
          <ProLock feature="Le analitiche avanzate" plan={plan} />
        </DCard>
      )}
    </div>
  );
}

/* ─── Tab: Guadagni ──────────────────────────────────────────── */
function TabGuadagni({ bookings=[] }) {
  const safe = Array.isArray(bookings)?bookings:[];
  const confirmed = safe.filter(b=>["confirmed","accettato","accepted"].includes((b.status||"").toLowerCase()));
  const fmt = n=>new Intl.NumberFormat("it-IT",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n);
  const total = confirmed.reduce((s,b)=>s+(Number(b.cachet)||Number(b.artistCachet)||0),0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:10 }}>
        <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:18, padding:"16px 18px" }}>
          <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".12em", color:MUTED, margin:"0 0 6px" }}>Serate confermate</p>
          <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:22, color:W, margin:0 }}>{confirmed.length}</p>
        </div>
        <div style={{ background:O, borderRadius:18, padding:"16px 18px" }}>
          <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".12em", color:"rgba(255,255,255,.6)", margin:"0 0 6px" }}>Totale maturato</p>
          <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:22, color:W, margin:0 }}>{fmt(total)}</p>
        </div>
      </div>

      <DCard>
        <STitle sub="Tutti i booking con pagamento confermato">Estratto conto</STitle>
        {confirmed.length===0 ? (
          <p style={{ fontSize:13, color:MUTED }}>Nessun booking confermato ancora.</p>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${BORDER}` }}>
                  {["Evento","Data","Locale","Durata","Cachet netto"].map(h=>(
                    <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontWeight:700, color:MUTED, whiteSpace:"nowrap", fontSize:11, textTransform:"uppercase", letterSpacing:".08em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {confirmed.map((b,i)=>(
                  <tr key={b.id||i} style={{ borderBottom:`1px solid ${MUTED2}` }}>
                    <td style={{ padding:"10px 12px", fontWeight:700, color:W }}>{b.eventTitle||"—"}</td>
                    <td style={{ padding:"10px 12px", color:MUTED }}>{b.eventDate||"—"}</td>
                    <td style={{ padding:"10px 12px", color:MUTED }}>{b.organizerName||"—"}</td>
                    <td style={{ padding:"10px 12px", color:MUTED }}>{b.duration||"—"}</td>
                    <td style={{ padding:"10px 12px", fontWeight:800, color:O }}>{fmt(Number(b.cachet)||Number(b.artistCachet)||0)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop:`2px solid ${BORDER}` }}>
                  <td colSpan={4} style={{ padding:"12px", fontWeight:800, color:W }}>TOTALE</td>
                  <td style={{ padding:"12px", fontWeight:900, color:O, fontSize:16 }}>{fmt(total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </DCard>
    </div>
  );
}

/* ─── Global styles + Main ───────────────────────────────────── */
const GLOBAL_CSS = `
  #artist-area input, #artist-area textarea, #artist-area select {
    color-scheme: dark;
  }
  #artist-area input:focus, #artist-area textarea:focus, #artist-area select:focus {
    border-color: rgba(255,90,0,.5) !important;
    box-shadow: 0 0 0 3px rgba(255,90,0,.1);
  }
  #artist-area input::placeholder, #artist-area textarea::placeholder {
    color: rgba(255,255,255,.22);
  }
  #artist-area input[type=number]::-webkit-inner-spin-button { opacity: .3; }
  #artist-area button[type=submit]:hover { filter: brightness(1.1); transform: translateY(-1px); }
`;

const TABS = [
  { key:"mediakit",   label:"Profilo"    },
  { key:"cachet",     label:"Cachet"     },
  { key:"calendario", label:"Calendario" },
  { key:"analitiche", label:"Analitiche" },
  { key:"estratto",   label:"Guadagni"   },
];

export default function ArtistArea(props) {
  const tabMapA = { profile:"mediakit", calendar:"calendario", analytics:"analitiche", earnings:"estratto" };
  const initialTab = tabMapA[props.tab] || props.tab || "mediakit";
  const plan = props.currentUser?.plan || "free";
  const [tab, setTab] = useState(initialTab);

  const p = props;
  const setPricing = props.setPricing || (() => {});

  return (
    <div id="artist-area" style={{ fontFamily:"'Manrope',system-ui,sans-serif", color:W, display:"flex", flexDirection:"column", gap:16 }}>
      <style>{GLOBAL_CSS}</style>

      {/* Tab bar */}
      <div style={{ display:"flex", gap:4, overflowX:"auto", paddingBottom:2, scrollbarWidth:"none" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={()=>setTab(t.key)}
            style={{
              padding:"8px 16px", borderRadius:100, fontWeight:700, fontSize:13,
              cursor:"pointer", whiteSpace:"nowrap", fontFamily:"'Manrope',system-ui,sans-serif",
              border: tab===t.key ? "none" : `1px solid ${BORDER}`,
              background: tab===t.key ? O : "transparent",
              color: tab===t.key ? W : MUTED,
              transition:"all .2s",
            }}>
            {t.label}
          </button>
        ))}

        {/* Link pricing */}
        <a href="/pricing" style={{ marginLeft:"auto", padding:"8px 16px", borderRadius:100, fontWeight:700, fontSize:12, whiteSpace:"nowrap", fontFamily:"'Manrope',system-ui,sans-serif", border:`1px solid ${O}55`, background:`${O}10`, color:O, textDecoration:"none", display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
          {plan==="pro" ? "✓ Piano Pro" : "Free → Pro"}
        </a>
      </div>

      {/* Contenuto */}
      {tab==="mediakit"   && <TabProfilo   plan={plan} stageName={p.stageName} setStageName={p.setStageName} artistType={p.artistType} setArtistType={p.setArtistType} bio={p.bio} setBio={p.setBio} city={p.city} setCity={p.setCity} musicGenres={p.musicGenres} setMusicGenres={p.setMusicGenres} eventTypes={p.eventTypes} setEventTypes={p.setEventTypes} photo={p.photo} setPhoto={p.setPhoto} instagram={p.instagram} setInstagram={p.setInstagram} spotify={p.spotify} setSpotify={p.setSpotify} youtube={p.youtube} setYoutube={p.setYoutube} soundcloud={p.soundcloud} setSoundcloud={p.setSoundcloud} tiktok={p.tiktok} setTiktok={p.setTiktok} rider={p.rider} setRider={p.setRider} saveArtistProfile={p.saveArtistProfile} artistMessage={p.artistMessage} />}
      {tab==="cachet"     && <TabCachet    pricing={p.pricing} setPricing={setPricing} eventTypes={p.eventTypes} saveArtistProfile={p.saveArtistProfile} artistMessage={p.artistMessage} />}
      {tab==="calendario" && <TabCalendario availableDates={p.availableDates||[]} setAvailableDates={p.setAvailableDates} bookedSlots={p.bookedSlots||[]} plan={plan} />}
      {tab==="analitiche" && <TabAnalitiche bookings={p.bookings||[]} plan={plan} />}
      {tab==="estratto"   && <TabGuadagni  bookings={p.bookings||[]} />}
    </div>
  );
}