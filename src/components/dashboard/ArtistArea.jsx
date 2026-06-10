"use client";
import VerifiedBadge from "@/components/VerifiedBadge";
import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────
   DESIGN TOKENS — stile Spotify (bianco/grigio chiaro + arancione)
───────────────────────────────────────────────────────────────── */
const O      = "#ff5a00";
const INK    = "#0a0a0b";
const BG     = "#f5f5f6";
const CARD   = "#ffffff";
const BORDER = "rgba(0,0,0,.07)";
const MUTED  = "#6b6b73";
const MUTED2 = "rgba(0,0,0,.04)";

const inp = {
  background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)", borderRadius:12,
  padding:"10px 14px", fontSize:13, color:INK,
  fontFamily:"'Manrope',system-ui,sans-serif", outline:"none", width:"100%",
  transition:"border-color .15s",
};
const sel = { ...inp, cursor:"pointer", appearance:"none", WebkitAppearance:"none" };

const DURATIONS = [
  { key:"1h",      label:"1 ora"  },
  { key:"2h",      label:"2 ore"  },
  { key:"3h",      label:"3 ore"  },
  { key:"fullday", label:"Full day" },
];

const MUSIC_GENRES  = ["House","Tech House","Techno","Trance","Drum & Bass","Hip Hop","Rap","R&B","Soul","Jazz","Blues","Rock","Indie","Pop","Reggae","Funk","Electronic","Ambient","Classica","Folk","Latino","Afrobeat","Altro"];
const EVENT_TYPES   = ["Serata in club","Festival","Evento privato","Concerto","Opening","Matrimonio","Evento aziendale","Altro"];
const ARTIST_TYPES  = ["DJ","Band","Cantante","Duo","Trio","Musicista solista","Performer","Altro"];

/* ─────────────────────────────────────────────────────────────────
   MASCOTTE TUTTOEVENTO — omino SVG animato
───────────────────────────────────────────────────────────────── */
function TEmascot({ mood="default", style={} }) {
  const expressions = {
    default: (
      <g>
        <circle cx="16" cy="13" r="2" fill={INK} />
        <circle cx="24" cy="13" r="2" fill={INK} />
        <path d="M13 19 Q20 23 27 19" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </g>
    ),
    point: (
      <g>
        <circle cx="16" cy="13" r="2" fill={INK} />
        <circle cx="24" cy="13" r="2.5" fill={INK} />
        <path d="M13 19 Q20 23 27 19" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </g>
    ),
    celebrate: (
      <g>
        <path d="M14 12 Q16 9 18 12" stroke={INK} strokeWidth="1.5" fill="none" />
        <path d="M22 12 Q24 9 26 12" stroke={INK} strokeWidth="1.5" fill="none" />
        <path d="M12 19 Q20 25 28 19" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    ),
    wave: (
      <g>
        <circle cx="16" cy="13" r="2" fill={INK} />
        <circle cx="24" cy="13" r="2" fill={INK} />
        <path d="M13 19 Q20 23 27 19" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </g>
    ),
  };

  const armRight = mood === "point"
    ? "M27 26 Q38 18 44 10"
    : mood === "celebrate"
    ? "M27 26 Q36 16 40 8"
    : "M27 26 Q34 28 36 32";

  return (
    <svg width="60" height="80" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink:0, ...style }}>
      {/* Testa */}
      <circle cx="20" cy="18" r="15" fill={O} />
      {expressions[mood]}
      {/* Lettera TE */}
      <text x="20" y="8" textAnchor="middle" fontSize="5" fontWeight="900" fill="white" fontFamily="'Sora',sans-serif">TE</text>
      {/* Corpo */}
      <rect x="12" y="32" width="16" height="22" rx="6" fill={INK} />
      {/* Braccio sinistro */}
      <path d="M13 36 Q6 40 4 46" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      {/* Braccio destro */}
      <path d={armRight} stroke={INK} strokeWidth="4" strokeLinecap="round" />
      {mood === "point" && (
        <circle cx="44" cy="10" r="3" fill={O} stroke="white" strokeWidth="1" />
      )}
      {/* Gambe */}
      <path d="M16 54 Q14 64 12 70" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <path d="M24 54 Q26 64 28 70" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      {/* Piedi */}
      <ellipse cx="11" cy="71" rx="5" ry="3" fill={INK} />
      <ellipse cx="29" cy="71" rx="5" ry="3" fill={INK} />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ONBOARDING COMPONENT
   4 step per ruolo artista:
   1. Bentornato — panoramica
   2. Punta al tab Profilo → compila nome d'arte
   3. Punta al tab Cachet → imposta prezzi
   4. Punta al tab Calendario → aggiungi disponibilità
───────────────────────────────────────────────────────────────── */
const ONBOARDING_STEPS_ARTIST = [
  {
    id: 1,
    mood: "wave",
    title: "Ciao! Sono Evo, la tua guida su TuttoEvento 👋",
    body: "Ti mostro in 4 passi come configurare il tuo profilo artista per iniziare a ricevere richieste dai locali.",
    highlight: null,
    cta: "Inizia →",
    mascotPos: "center",
  },
  {
    id: 2,
    mood: "point",
    title: "Prima cosa: il tuo profilo artistico",
    body: "Vai su Profilo e inserisci il tuo nome d'arte, la tua città e i generi che suoni. I locali ti trovano così.",
    highlight: "mediakit",
    cta: "Ho capito →",
    mascotPos: "left",
    tabToPoint: "mediakit",
  },
  {
    id: 3,
    mood: "point",
    title: "Ora imposta i tuoi prezzi",
    body: "Nella tab Cachet inserisci il tuo prezzo per ogni tipo di serata e durata. Il team li approverà prima di pubblicarli.",
    highlight: "cachet",
    cta: "Avanti →",
    mascotPos: "left",
    tabToPoint: "cachet",
  },
  {
    id: 4,
    mood: "celebrate",
    title: "Perfetto! Sei pronto per ricevere richieste 🎉",
    body: "Aggiungi le date in cui sei disponibile nel Calendario. Più date aggiungi, più booking ricevi. In bocca al lupo!",
    highlight: "calendario",
    cta: "Inizia a usare TuttoEvento",
    mascotPos: "center",
    tabToPoint: "calendario",
  },
];

function OnboardingToast({ step, totalSteps, onNext, onSkip, onTabChange }) {
  const s = ONBOARDING_STEPS_ARTIST[step];
  const isLast = step === ONBOARDING_STEPS_ARTIST.length - 1;

  function handleNext() {
    if (s.tabToPoint) onTabChange(s.tabToPoint);
    onNext();
  }

  return (
    <div style={{
      position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
      zIndex:200, width:"calc(100% - 32px)", maxWidth:420,
      background:CARD, borderRadius:20,
      border:`1px solid ${BORDER}`,
      boxShadow:"0 8px 32px rgba(0,0,0,.12)",
      padding:"16px 20px",
      display:"flex", flexDirection:"column", gap:12,
      animation:"te-slide-up .3s cubic-bezier(.4,0,.2,1)",
    }}>
      <style>{`
        @keyframes te-slide-up { from{opacity:0;transform:translateX(-50%) translateY(20px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes te-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .te-mascot-bounce { animation: te-bounce 1.8s ease-in-out infinite; }
        @media(max-width:480px){ .te-onboard-btn{font-size:12px!important;padding:8px 14px!important} }
      `}</style>

      {/* Progress dots */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", gap:5 }}>
          {ONBOARDING_STEPS_ARTIST.map((_,i) => (
            <div key={i} style={{ width: i===step?20:6, height:6, borderRadius:3,
              background: i<=step ? O : "rgba(0,0,0,.1)",
              transition:"all .3s" }} />
          ))}
        </div>
        <button onClick={onSkip} style={{ background:"none", border:"none", cursor:"pointer", fontSize:11, color:MUTED, fontFamily:"'Manrope',system-ui,sans-serif", fontWeight:600 }}>
          Salta guida
        </button>
      </div>

      {/* Contenuto */}
      <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
        <div className="te-mascot-bounce">
          <TEmascot mood={s.mood} />
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:14, color:INK, margin:"0 0 6px", lineHeight:1.3 }}>{s.title}</p>
          <p style={{ fontSize:12, color:MUTED, margin:0, lineHeight:1.6 }}>{s.body}</p>
        </div>
      </div>

      {/* CTA */}
      <button onClick={handleNext} className="te-onboard-btn"
        style={{ background:O, color:"white", border:"none", borderRadius:100, padding:"10px 20px", fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif", transition:"all .2s", alignSelf:"flex-end", boxShadow:`0 4px 16px ${O}35` }}>
        {isLast ? "✓ Fatto!" : s.cta}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MICRO-COMPONENTS
───────────────────────────────────────────────────────────────── */
function ProLock({ feature="questa funzionalità", plan }) {
  if (plan==="pro") return null;
  return (
    <div style={{ background:"rgba(255,90,0,.04)", border:"1px dashed rgba(255,90,0,.2)", borderRadius:12, padding:"12px 14px", display:"flex", alignItems:"center", gap:10, marginTop:10 }}>
      <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
        <rect x="1" y="7" width="12" height="9" rx="2" fill={O}/>
        <path d="M3.5 7V5C3.5 2.79 5.07 1 7 1C8.93 1 10.5 2.79 10.5 5V7" stroke={O} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
      <p style={{ fontSize:12, color:O, fontWeight:700, margin:0, fontFamily:"'Manrope',system-ui,sans-serif" }}>
        {feature} · <a href="/pricing" style={{ color:INK, textDecoration:"none", fontWeight:800, borderBottom:`1px solid rgba(0,0,0,.2)` }}>Upgrade a Pro →</a>
      </p>
    </div>
  );
}

function ProBadge() {
  return <span style={{ display:"inline-flex", alignItems:"center", background:"rgba(255,90,0,.1)", border:"1px solid rgba(255,90,0,.25)", borderRadius:100, padding:"1px 8px", fontSize:10, fontWeight:800, color:O, verticalAlign:"middle", marginLeft:6 }}>PRO</span>;
}

function SCard({ children, style={}, highlight=false }) {
  return (
    <div style={{
      background:CARD, border:`1px solid ${highlight ? O : BORDER}`,
      borderRadius:20, padding:"20px 22px",
      boxShadow: highlight ? `0 0 0 3px rgba(255,90,0,.12)` : "none",
      transition:"border-color .3s, box-shadow .3s",
      ...style
    }}>
      {children}
    </div>
  );
}

function STitle({ children, sub }) {
  return (
    <div style={{ marginBottom:16 }}>
      <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:16, letterSpacing:"-.03em", color:INK, margin:0 }}>{children}</h3>
      {sub && <p style={{ fontSize:12, color:MUTED, margin:"4px 0 0", lineHeight:1.5 }}>{sub}</p>}
    </div>
  );
}

function Label({ children }) {
  return <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".12em", display:"block", marginBottom:5 }}>{children}</label>;
}

function Field({ label, children, hint }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      {label && <Label>{label}</Label>}
      {children}
      {hint && <p style={{ fontSize:11, color:MUTED, margin:0 }}>{hint}</p>}
    </div>
  );
}

function Inp({ label, value, onChange, placeholder, type="text", disabled, hint }) {
  return (
    <Field label={label} hint={hint}>
      <input type={type} value={value||""} onChange={onChange} placeholder={placeholder} disabled={disabled}
        style={{ ...inp, opacity:disabled?.4:1 }} />
    </Field>
  );
}

function SelectField({ label, value, onChange, options=[], placeholder="" }) {
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
        <svg style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}
          width="12" height="12" viewBox="0 0 12 12">
          <path d="M2 4l4 4 4-4" stroke={MUTED} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </svg>
      </div>
    </Field>
  );
}

function Chip({ label, active, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding:"5px 13px", borderRadius:100, fontSize:12, fontWeight:700,
      cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif", transition:"all .15s",
      border:`1px solid ${active ? O : "rgba(0,0,0,.1)"}`,
      background: active ? `${O}12` : "white",
      color: active ? O : MUTED,
    }}>
      {label}
    </button>
  );
}

/* KPI card — stile Spotify (numero grande su sfondo chiaro) */
function KpiCard({ label, value, accent=false, orange=false }) {
  return (
    <div style={{
      background: accent ? INK : orange ? `${O}08` : "#f8f8f9",
      border:`1px solid ${accent||orange?"transparent":"rgba(0,0,0,.06)"}`,
      borderRadius:18, padding:"18px 20px",
    }}>
      <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".12em", color: accent?"rgba(255,255,255,.5)":orange?O:MUTED, margin:"0 0 6px", fontFamily:"'Manrope',system-ui,sans-serif" }}>{label}</p>
      <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:26, letterSpacing:"-.04em", color: accent?"white":orange?O:INK, margin:0 }}>{value}</p>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────────────
   GENERE MULTISELECT — dropdown con checkbox, senza emoji
───────────────────────────────────────────────────────────────── */
function GenreMultiSelect({ selected=[], onToggle, isPro }) {
  const [open, setOpen] = useState(false);
  const safe = Array.isArray(selected) ? selected : [];
  const maxReached = !isPro && safe.length >= 3;

  return (
    <div style={{ position:"relative" }}>
      {/* Trigger */}
      <button type="button" onClick={()=>setOpen(p=>!p)}
        style={{
          width:"100%", background:"#fbfaf8", border:`1px solid ${open?"rgba(255,90,0,.45)":"rgba(0,0,0,.1)"}`,
          borderRadius:12, padding:"10px 14px", fontSize:13, color:INK,
          fontFamily:"'Manrope',system-ui,sans-serif", cursor:"pointer", textAlign:"left",
          display:"flex", alignItems:"center", justifyContent:"space-between", gap:8,
          boxShadow: open?"0 0 0 3px rgba(255,90,0,.08)":"none", transition:"all .15s",
        }}>
        <span style={{ color: safe.length>0?INK:MUTED }}>
          {safe.length===0 ? "Seleziona i tuoi generi..." :
           safe.length===1 ? safe[0] :
           `${safe[0]} +${safe.length-1} altri`}
        </span>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {safe.length>0 && (
            <span style={{ fontSize:11, fontWeight:700, color:"white", background:O, borderRadius:100, padding:"1px 8px", minWidth:20, textAlign:"center" }}>
              {safe.length}
            </span>
          )}
          <svg width="12" height="12" viewBox="0 0 12 12" style={{ transform:open?"rotate(180deg)":"none", transition:"transform .2s", flexShrink:0 }}>
            <path d="M2 4l4 4 4-4" stroke={MUTED} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </svg>
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 6px)", left:0, right:0, zIndex:50,
          background:"white", border:`1px solid rgba(0,0,0,.1)`, borderRadius:14,
          boxShadow:"0 8px 24px rgba(0,0,0,.1)", maxHeight:280, overflowY:"auto",
          animation:"te-slide-down .15s ease",
        }}>
          <style>{`@keyframes te-slide-down{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
          {MUSIC_GENRES.map(g => {
            const isActive  = safe.includes(g);
            const isDisabled = maxReached && !isActive;
            return (
              <button key={g} type="button"
                onClick={()=>{ if(!isDisabled){ onToggle(g); } }}
                style={{
                  width:"100%", display:"flex", alignItems:"center", gap:10,
                  padding:"9px 14px", background:"none", border:"none",
                  cursor:isDisabled?"not-allowed":"pointer",
                  borderBottom:"1px solid rgba(0,0,0,.04)",
                  opacity:isDisabled?.4:1, transition:"background .1s",
                  fontFamily:"'Manrope',system-ui,sans-serif",
                }}>
                {/* Checkbox custom */}
                <div style={{
                  width:16, height:16, borderRadius:4, flexShrink:0,
                  border:`1.5px solid ${isActive?O:"rgba(0,0,0,.2)"}`,
                  background:isActive?O:"white",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  transition:"all .15s",
                }}>
                  {isActive && (
                    <svg width="9" height="9" viewBox="0 0 10 10">
                      <polyline points="1,5 4,8 9,2" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>
                <span style={{ fontSize:13, fontWeight:isActive?700:400, color:isActive?INK:MUTED }}>
                  {g}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Overlay per chiudere */}
      {open && (
        <div style={{ position:"fixed", inset:0, zIndex:49 }} onClick={()=>setOpen(false)} />
      )}

      {/* Tag selezionati sotto */}
      {safe.length>0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:8 }}>
          {safe.map(g=>(
            <span key={g} style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:12, fontWeight:700, color:O, background:`${O}10`, border:`1px solid ${O}25`, borderRadius:100, padding:"3px 10px" }}>
              {g}
              <button type="button" onClick={()=>onToggle(g)}
                style={{ background:"none", border:"none", cursor:"pointer", color:O, fontSize:13, lineHeight:1, padding:0, display:"flex", alignItems:"center" }}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   TAB: PROFILO
───────────────────────────────────────────────────────────────── */
function TabProfilo({
  plan, stageName, setStageName, artistType, setArtistType,
  bio, setBio, city, setCity,
  musicGenres, setMusicGenres, eventTypes, setEventTypes,
  photo, setPhoto, instagram, setInstagram, spotify, setSpotify,
  youtube, setYoutube, soundcloud, setSoundcloud, tiktok, setTiktok,
  rider, setRider, saveArtistProfile, artistMessage, highlightCard,
}) {
  const isPro = plan === "pro";
  const safeGenres = Array.isArray(musicGenres) ? musicGenres : [];
  const safeEvents = Array.isArray(eventTypes)  ? eventTypes  : [];

  function toggleGenre(g) {
    if (!isPro && safeGenres.length >= 3 && !safeGenres.includes(g)) return;
    setMusicGenres(prev => {
      const s = Array.isArray(prev)?prev:[];
      return s.includes(g) ? s.filter(x=>x!==g) : [...s,g];
    });
  }
  function toggleEvent(e) {
    setEventTypes(prev => {
      const s = Array.isArray(prev)?prev:[];
      return s.includes(e) ? s.filter(x=>x!==e) : [...s,e];
    });
  }

  return (
    <form onSubmit={saveArtistProfile} style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* Identità */}
      <SCard highlight={highlightCard==="identity"}>
        <STitle sub="Nome d'arte, tipo e città — le info base per essere trovato">Identità artistica</STitle>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12 }}>
          <Inp label="Nome d'arte *" value={stageName} onChange={e=>setStageName(e.target.value)} placeholder="Es. Marco DJ" />
          <SelectField label="Tipo artista" value={artistType} onChange={e=>setArtistType(e.target.value)} options={ARTIST_TYPES} placeholder="Seleziona..." />
          <Inp label="Città" value={city} onChange={e=>setCity(e.target.value)} placeholder="Es. Milano" />
        </div>
      </SCard>

      {/* Bio */}
      <SCard>
        <STitle sub={isPro?"Racconta la tua storia senza limiti":"Max 150 caratteri · illimitata con PRO"}>
          Bio {!isPro && <ProBadge />}
        </STitle>
        <textarea value={bio||""} onChange={e=>setBio(e.target.value)} maxLength={isPro?undefined:150} rows={4}
          placeholder="Descrivi il tuo stile, la tua esperienza e cosa ti rende unico..."
          style={{ ...inp, resize:"vertical", lineHeight:1.65 }} />
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
          {!isPro && <p style={{ fontSize:11, color:MUTED, margin:0 }}>{(bio||"").length}/150</p>}
          {!isPro && <a href="/pricing" style={{ fontSize:11, color:O, fontWeight:700, textDecoration:"none" }}>Bio illimitata con Pro →</a>}
        </div>
      </SCard>

      {/* Generi — dropdown multiselect */}
      <SCard>
        <STitle sub={isPro?"Tutti i generi che suoni":"Max 3 con Free — illimitati con PRO"}>
          Generi musicali {!isPro && <ProBadge />}
        </STitle>
        <GenreMultiSelect selected={safeGenres} onToggle={toggleGenre} isPro={isPro} />
        {!isPro && safeGenres.length>=3 && <ProLock feature="Più di 3 generi" plan={plan} />}
      </SCard>

      {/* Tipi evento */}
      <SCard>
        <STitle sub="Specifica in quali contesti suoni — i locali ti trovano per tipo di evento">Tipi di evento</STitle>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {EVENT_TYPES.map(e=>(
            <Chip key={e} label={e} active={safeEvents.includes(e)} onClick={()=>toggleEvent(e)} />
          ))}
        </div>
      </SCard>

      {/* Foto */}
      <SCard>
        <STitle sub="La prima cosa che i locali vedono nel marketplace">Foto profilo</STitle>
        <Inp label="URL foto principale" value={photo} onChange={e=>setPhoto(e.target.value)} placeholder="https://..." />
        {photo && (
          <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:12 }}>
            <img src={photo} alt="Preview" style={{ width:72, height:72, borderRadius:12, objectFit:"cover", border:`1px solid ${BORDER}` }} />
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:INK, margin:0 }}>Anteprima</p>
              <p style={{ fontSize:11, color:MUTED, margin:"2px 0 0" }}>Questa è la foto che vedranno i locali</p>
            </div>
          </div>
        )}
      </SCard>

      {/* Social */}
      <SCard>
        <STitle sub={isPro?"Tutti i link attivi contemporaneamente":"Max 1 social attivo con Free"}>
          Link social {!isPro && <ProBadge />}
        </STitle>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <Inp label="Instagram"  value={instagram}  onChange={e=>setInstagram(e.target.value)}  placeholder="@username" />
          <Inp label="Spotify"    value={spotify}    onChange={e=>setSpotify(e.target.value)}    placeholder="URL profilo"  disabled={!isPro&&!!instagram} />
          <Inp label="YouTube"    value={youtube}    onChange={e=>setYoutube(e.target.value)}    placeholder="URL canale"   disabled={!isPro&&(!!instagram||!!spotify)} />
          <Inp label="SoundCloud" value={soundcloud} onChange={e=>setSoundcloud(e.target.value)} placeholder="URL profilo"  disabled={!isPro&&(!!instagram||!!spotify||!!youtube)} />
          <Inp label="TikTok"     value={tiktok}     onChange={e=>setTiktok(e.target.value)}     placeholder="@username"   disabled={!isPro} />
        </div>
        {!isPro && <ProLock feature="Tutti i social attivi insieme" plan={plan} />}
      </SCard>

      {/* Rider */}
      {isPro ? (
        <SCard>
          <STitle sub="Specifiche tecniche condivise automaticamente con i locali">Rider tecnico</STitle>
          <textarea value={rider||""} onChange={e=>setRider(e.target.value)} rows={3}
            placeholder="Es. 2 casse frontali, mixer 4 canali, monitor..."
            style={{ ...inp, resize:"vertical" }} />
        </SCard>
      ) : (
        <SCard style={{ opacity:.65 }}>
          <STitle>Rider tecnico <ProBadge /></STitle>
          <ProLock feature="Il rider tecnico" plan={plan} />
        </SCard>
      )}

      {/* Salva */}
      <div style={{ display:"flex", alignItems:"center", gap:14, paddingTop:4, flexWrap:"wrap" }}>
        <button type="submit"
          style={{ background:O, color:"white", border:"none", borderRadius:100, padding:"12px 28px", fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif", boxShadow:`0 8px 24px ${O}35`, transition:"all .2s" }}>
          Salva profilo
        </button>
        {artistMessage && (
          <p style={{ fontSize:13, fontWeight:700, color:artistMessage.includes("Errore")?"#dc2626":"#16a34a", margin:0 }}>
            {artistMessage}
          </p>
        )}
      </div>
    </form>
  );
}

/* ─────────────────────────────────────────────────────────────────
   TAB: CACHET
───────────────────────────────────────────────────────────────── */
function TabCachet({ pricing={}, setPricing, eventTypes=[], saveArtistProfile, artistMessage }) {
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [approvalMsg, setApprovalMsg]         = useState("");
  const [publicPricing, setPublicPricing]     = useState(null);

  useEffect(() => {
    fetch("/api/pricing-approval")
      .then(r=>r.json())
      .then(d=>{
        if (!Array.isArray(d)||d.length===0) return;
        const latest = d[0];
        setApprovalStatus(latest.status);
        if (latest.public_pricing) setPublicPricing(latest.public_pricing);
      }).catch(()=>{});
  }, []);

  const safeEvents = Array.isArray(eventTypes)&&eventTypes.length>0
    ? eventTypes : ["Serata in club","Concerto","Evento privato","Festival"];

  function getPrice(ev,dur) { return (pricing?.[ev]?.[dur])||""; }
  function setPrice(ev,dur,val) {
    setPricing(prev=>({ ...prev, [ev]:{ ...(prev?.[ev]||{}), [dur]:val } }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await saveArtistProfile(e);
    setApprovalLoading(true); setApprovalMsg("");
    const res = await fetch("/api/pricing-approval",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({pricing}),
    });
    const d = await res.json();
    if (!res.ok) { setApprovalMsg(d.error||"Errore invio"); }
    else { setApprovalStatus("pending"); setApprovalMsg("✓ Richiesta inviata — in attesa di approvazione"); }
    setApprovalLoading(false);
  }

  const statusMap = {
    pending:  { label:"In attesa di approvazione", color:"#d97706", bg:"rgba(217,119,6,.08)", border:"rgba(217,119,6,.2)" },
    approved: { label:"✓ Prezzi approvati e pubblicati", color:"#16a34a", bg:"rgba(22,163,74,.08)", border:"rgba(22,163,74,.2)" },
    rejected: { label:"Richiesta rifiutata — modifica i prezzi e invia di nuovo", color:"#dc2626", bg:"rgba(220,38,38,.06)", border:"rgba(220,38,38,.2)" },
  };
  const sc = approvalStatus ? statusMap[approvalStatus] : null;

  return (
    <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {sc && (
        <div style={{ background:sc.bg, border:`1px solid ${sc.border}`, borderRadius:14, padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:sc.color, flexShrink:0 }} />
          <p style={{ fontSize:13, fontWeight:700, color:sc.color, margin:0 }}>{sc.label}</p>
        </div>
      )}

      <SCard>
        <STitle sub="Il tuo cachet netto privato per ogni tipo di serata e durata">
          Listino prezzi
        </STitle>
        <p style={{ fontSize:12, color:MUTED, margin:"0 0 18px", lineHeight:1.65 }}>
          I prezzi che inserisci sono il tuo <strong style={{color:INK}}>cachet netto privato</strong> — i locali non li vedono. Il team TuttoEvento imposta il prezzo pubblico e lo pubblica nel marketplace.
        </p>

        {/* Tabella responsive */}
        <div style={{ overflowX:"auto", margin:"0 -4px" }}>
          <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:"0 6px", fontSize:13, minWidth:360 }}>
            <thead>
              <tr>
                <th style={{ textAlign:"left", padding:"0 10px 8px 4px", fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".1em", whiteSpace:"nowrap" }}>Tipo evento</th>
                {DURATIONS.map(d=>(
                  <th key={d.key} style={{ textAlign:"center", padding:"0 4px 8px", fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".08em", whiteSpace:"nowrap" }}>{d.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {safeEvents.map(ev=>(
                <tr key={ev} style={{ background:"#fbfaf8", borderRadius:12 }}>
                  <td style={{ padding:"8px 10px 8px 10px", whiteSpace:"nowrap", borderRadius:"12px 0 0 12px", border:`1px solid rgba(0,0,0,.06)`, borderRight:"none" }}>
                    <span style={{ fontSize:13, fontWeight:700, color:INK }}>{ev}</span>
                  </td>
                  {DURATIONS.map((d,i)=>(
                    <td key={d.key} style={{ padding:"6px 4px", border:`1px solid rgba(0,0,0,.06)`, borderLeft:"none", borderRight: i===DURATIONS.length-1?"1px solid rgba(0,0,0,.06)":"none", borderRadius: i===DURATIONS.length-1?"0 12px 12px 0":"0" }}>
                      <div style={{ position:"relative", width:76 }}>
                        <span style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)", fontSize:12, color:MUTED, fontWeight:700, pointerEvents:"none" }}>€</span>
                        <input type="number" min="0" placeholder="—"
                          value={getPrice(ev,d.key)}
                          onChange={e=>setPrice(ev,d.key,e.target.value)}
                          style={{ ...inp, paddingLeft:22, textAlign:"right", width:76, borderRadius:8, padding:"7px 8px 7px 22px", fontSize:12 }} />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Prezzi approvati */}
        {approvalStatus==="approved" && publicPricing && (
          <div style={{ marginTop:18, background:"rgba(22,163,74,.06)", border:"1px solid rgba(22,163,74,.15)", borderRadius:14, padding:"14px 16px" }}>
            <p style={{ fontSize:11, fontWeight:700, color:"#16a34a", textTransform:"uppercase", letterSpacing:".1em", margin:"0 0 10px" }}>Prezzi pubblici approvati (visibili ai locali)</p>
            {Object.entries(publicPricing).map(([ev,durations])=>(
              <div key={ev} style={{ marginBottom:8 }}>
                <p style={{ fontSize:12, fontWeight:700, color:INK, margin:"0 0 5px" }}>{ev}</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {Object.entries(durations||{}).map(([dur,price])=>price?(
                    <span key={dur} style={{ fontSize:12, fontWeight:700, color:"#16a34a", background:"rgba(22,163,74,.1)", border:"1px solid rgba(22,163,74,.2)", borderRadius:8, padding:"3px 10px" }}>
                      {DURATIONS.find(d=>d.key===dur)?.label||dur}: €{price}
                    </span>
                  ):null)}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop:16, background:"rgba(0,0,0,.03)", borderRadius:12, padding:"10px 14px", fontSize:12, color:MUTED, lineHeight:1.6 }}>
          💡 Aggiungi i tipi di evento nella tab <strong style={{color:INK}}>Profilo</strong> — qui appariranno automaticamente.
        </div>
      </SCard>

      <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
        <button type="submit"
          disabled={approvalLoading||approvalStatus==="pending"}
          style={{
            background: approvalStatus==="pending" ? "rgba(0,0,0,.08)" : O,
            color: approvalStatus==="pending" ? MUTED : "white",
            border:"none", borderRadius:100, padding:"12px 28px", fontWeight:800, fontSize:14,
            cursor: approvalStatus==="pending" ? "not-allowed" : "pointer",
            fontFamily:"'Manrope',system-ui,sans-serif",
            boxShadow: approvalStatus==="pending" ? "none" : `0 8px 24px ${O}35`,
            opacity: approvalStatus==="pending" ? .6 : 1, transition:"all .2s",
          }}>
          {approvalLoading ? "Invio..." :
           approvalStatus==="pending" ? "⏳ In attesa di approvazione" :
           approvalStatus==="approved" ? "Aggiorna listino →" :
           "Salva e invia per approvazione →"}
        </button>
        {(artistMessage||approvalMsg) && (
          <p style={{ fontSize:13, fontWeight:700, color:(approvalMsg||artistMessage).includes("Errore")?"#dc2626":"#16a34a", margin:0 }}>
            {approvalMsg||artistMessage}
          </p>
        )}
      </div>
    </form>
  );
}

/* ─────────────────────────────────────────────────────────────────
   TAB: CALENDARIO
───────────────────────────────────────────────────────────────── */
function TabCalendario({ availableDates=[], setAvailableDates, bookedSlots=[], plan }) {
  const [newDate, setNewDate] = useState("");
  const addDate = () => {
    if (!newDate||(availableDates||[]).includes(newDate)) return;
    setAvailableDates(p=>[...(p||[]),newDate].sort()); setNewDate("");
  };
  const removeDate = d => setAvailableDates(p=>(p||[]).filter(x=>x!==d));
  const avail = availableDates||[];
  const slots = bookedSlots||[];

  // Raggruppa per mese
  const byMonth = {};
  avail.forEach(d => {
    const [y,m] = d.split("-"); const key=`${y}-${m}`;
    if (!byMonth[key]) byMonth[key]=[];
    byMonth[key].push(d);
  });
  const monthNames = ["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* Aggiungi data */}
      <SCard>
        <STitle sub="Aggiungi le date in cui sei libero — più date = più probabilità di booking">Disponibilità</STitle>
        <div style={{ display:"flex", gap:10, marginBottom:avail.length>0?18:0, flexWrap:"wrap" }}>
          <input type="date" value={newDate} onChange={e=>setNewDate(e.target.value)}
            style={{ ...inp, flex:1, maxWidth:200 }} />
          <button type="button" onClick={addDate}
            style={{ background:O, color:"white", border:"none", borderRadius:12, padding:"10px 20px", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif", boxShadow:`0 4px 12px ${O}25` }}>
            + Aggiungi
          </button>
        </div>

        {avail.length===0 ? (
          <div style={{ padding:"24px 0", textAlign:"center" }}>
            <p style={{ fontSize:13, color:MUTED, margin:0 }}>Nessuna data aggiunta ancora.</p>
            <p style={{ fontSize:12, color:"rgba(0,0,0,.25)", margin:"4px 0 0" }}>Aggiungi le date per iniziare a ricevere richieste.</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {Object.entries(byMonth).map(([key,dates])=>{
              const [y,m] = key.split("-");
              return (
                <div key={key}>
                  <p style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".12em", margin:"0 0 8px" }}>
                    {monthNames[parseInt(m)-1]} {y}
                  </p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {dates.map(d=>(
                      <div key={d} style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(22,163,74,.08)", border:"1px solid rgba(22,163,74,.2)", borderRadius:10, padding:"5px 10px" }}>
                        <span style={{ fontSize:12, fontWeight:700, color:"#16a34a" }}>{d.split("-")[2]}</span>
                        <button type="button" onClick={()=>removeDate(d)}
                          style={{ background:"none", border:"none", cursor:"pointer", color:"#dc2626", fontWeight:700, fontSize:13, lineHeight:1, padding:0 }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            <p style={{ fontSize:12, color:MUTED, margin:"4px 0 0" }}>{avail.length} date disponibili</p>
          </div>
        )}
      </SCard>

      {/* Date occupate */}
      {slots.length>0 && (
        <SCard>
          <STitle sub="Date già bloccate da booking confermati">Serate prenotate</STitle>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {slots.map((d,i)=>(
              <div key={i} style={{ background:"rgba(220,38,38,.06)", border:"1px solid rgba(220,38,38,.2)", borderRadius:10, padding:"5px 12px", fontSize:12, fontWeight:700, color:"#dc2626" }}>
                {typeof d==="string"?d:d.date||JSON.stringify(d)}
              </div>
            ))}
          </div>
        </SCard>
      )}

      {/* Sync Google Calendar */}
      {plan!=="pro" ? (
        <SCard style={{ opacity:.6 }}>
          <STitle>Sync Google Calendar <ProBadge /></STitle>
          <ProLock feature="Sincronizzazione automatica con Google Calendar" plan={plan} />
        </SCard>
      ) : (
        <SCard>
          <STitle sub="Aggiorna automaticamente le date disponibili da Google Calendar">Sync Google Calendar</STitle>
          <button disabled style={{ background:INK, color:"white", border:"none", borderRadius:100, padding:"10px 22px", fontWeight:700, fontSize:13, cursor:"not-allowed", opacity:.5 }}>
            Connetti Google Calendar
          </button>
        </SCard>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   TAB: ANALITICHE
───────────────────────────────────────────────────────────────── */
function TabAnalitiche({ bookings=[], plan }) {
  const safe = Array.isArray(bookings)?bookings:[];
  const confirmed = safe.filter(b=>["confirmed","accettato","accepted"].includes((b.status||"").toLowerCase()));
  const pending   = safe.filter(b=>["pending"].includes((b.status||"").toLowerCase()));
  const revenue   = confirmed.reduce((s,b)=>s+(Number(b.cachet)||Number(b.artistCachet)||0),0);
  const fmt = n => new Intl.NumberFormat("it-IT",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n);

  // Distribuzione per tipo evento
  const byType = {};
  confirmed.forEach(b=>{ const t=b.eventType||b.event_type||"Altro"; byType[t]=(byType[t]||0)+1; });
  const topTypes = Object.entries(byType).sort((a,b)=>b[1]-a[1]).slice(0,4);

  // Mesi ultimi 6 (placeholder dati)
  const months = ["Gen","Feb","Mar","Apr","Mag","Giu"];
  const barData = months.map(()=>Math.floor(Math.random()*5));
  const maxBar  = Math.max(...barData,1);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* KPI */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:10 }}>
        <KpiCard label="Booking totali"   value={safe.length} />
        <KpiCard label="Confermati"        value={confirmed.length} orange />
        <KpiCard label="In attesa"         value={pending.length} />
        <KpiCard label="Cachet maturato"  value={fmt(revenue)} accent />
      </div>

      {/* Grafico booking per mese — placeholder */}
      <SCard>
        <STitle sub="Ultimi 6 mesi — dati di esempio">Andamento booking</STitle>
        <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:100, paddingBottom:20, position:"relative" }}>
          {barData.map((v,i)=>(
            <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <span style={{ fontSize:10, color:MUTED, fontWeight:700 }}>{v}</span>
              <div style={{
                width:"100%", borderRadius:"6px 6px 0 0",
                background: i===barData.length-1?O:"rgba(255,90,0,.15)",
                height:`${(v/maxBar)*70}px`, minHeight:4,
                transition:"height .3s",
              }} />
              <span style={{ fontSize:10, color:MUTED, position:"absolute", bottom:0 }}>{months[i]}</span>
            </div>
          ))}
        </div>
      </SCard>

      {/* Distribuzione tipi */}
      {topTypes.length>0 && (
        <SCard>
          <STitle sub="Dove suoni di più">Per tipo di evento</STitle>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {topTypes.map(([type,count])=>(
              <div key={type} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:12, fontWeight:700, color:INK, minWidth:130 }}>{type}</span>
                <div style={{ flex:1, background:"rgba(0,0,0,.06)", borderRadius:4, height:8, overflow:"hidden" }}>
                  <div style={{ width:`${(count/confirmed.length)*100}%`, height:"100%", background:O, borderRadius:4 }} />
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:MUTED, minWidth:24, textAlign:"right" }}>{count}</span>
              </div>
            ))}
          </div>
        </SCard>
      )}

      {/* Analitiche PRO */}
      {plan!=="pro" && (
        <SCard style={{ opacity:.65 }}>
          <STitle>Analitiche avanzate <ProBadge /></STitle>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:12 }}>
            {["Visite profilo","Chi ha guardato","Da dove"].map(l=>(
              <div key={l} style={{ background:"#fbfaf8", borderRadius:12, padding:"12px 14px" }}>
                <p style={{ fontSize:11, color:MUTED, margin:"0 0 4px", fontWeight:700, textTransform:"uppercase", letterSpacing:".1em" }}>{l}</p>
                <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:20, color:INK, margin:0 }}>—</p>
              </div>
            ))}
          </div>
          <ProLock feature="Le analitiche avanzate del profilo" plan={plan} />
        </SCard>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   TAB: GUADAGNI
───────────────────────────────────────────────────────────────── */
function TabGuadagni({ bookings=[] }) {
  const safe = Array.isArray(bookings)?bookings:[];
  const confirmed = safe.filter(b=>["confirmed","accettato","accepted"].includes((b.status||"").toLowerCase()));
  const pending_pay = safe.filter(b=>b.paymentStatus==="paid_by_venue");
  const fmt = n => new Intl.NumberFormat("it-IT",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n);
  const total      = confirmed.reduce((s,b)=>s+(Number(b.cachet)||Number(b.artistCachet)||0),0);
  const pendingAmt = pending_pay.reduce((s,b)=>s+(Number(b.cachet)||Number(b.artistCachet)||0),0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:10 }}>
        <KpiCard label="Serate confermate" value={confirmed.length} />
        <KpiCard label="In arrivo"          value={fmt(pendingAmt)} orange />
        <KpiCard label="Totale maturato"    value={fmt(total)} accent />
      </div>

      <SCard>
        <STitle sub="Storico booking con pagamento tracciato">Estratto conto</STitle>
        {confirmed.length===0 ? (
          <div style={{ padding:"24px 0", textAlign:"center" }}>
            <p style={{ fontSize:13, color:MUTED, margin:0 }}>Nessun booking confermato ancora.</p>
            <p style={{ fontSize:12, color:"rgba(0,0,0,.25)", margin:"4px 0 0" }}>Appena un booking viene confermato apparirà qui.</p>
          </div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${BORDER}` }}>
                  {["Evento","Data","Locale","Stato pagamento","Cachet"].map(h=>(
                    <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontWeight:700, color:MUTED, whiteSpace:"nowrap", fontSize:11, textTransform:"uppercase", letterSpacing:".08em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {confirmed.map((b,i)=>{
                  const ps = b.paymentStatus||"pending";
                  const pConfig = {
                    pending:        {label:"In attesa",         color:"#d97706"},
                    paid_by_venue:  {label:"Pagamento in arrivo",color:"#2563eb"},
                    completed:      {label:"Ricevuto ✓",         color:"#16a34a"},
                  };
                  const pc = pConfig[ps]||{label:ps,color:MUTED};
                  return (
                    <tr key={b.id||i} style={{ borderBottom:`1px solid rgba(0,0,0,.04)` }}>
                      <td style={{ padding:"10px 12px", fontWeight:700, color:INK }}>{b.eventTitle||"—"}</td>
                      <td style={{ padding:"10px 12px", color:MUTED, whiteSpace:"nowrap" }}>{b.eventDate||"—"}</td>
                      <td style={{ padding:"10px 12px", color:MUTED }}>{b.organizerName||"—"}</td>
                      <td style={{ padding:"10px 12px" }}>
                        <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:100, background:`${pc.color}12`, color:pc.color }}>{pc.label}</span>
                      </td>
                      <td style={{ padding:"10px 12px", fontWeight:800, color:O }}>{fmt(Number(b.cachet)||Number(b.artistCachet)||0)}</td>
                    </tr>
                  );
                })}
                <tr style={{ borderTop:`2px solid ${BORDER}`, background:"#fbfaf8" }}>
                  <td colSpan={4} style={{ padding:"12px", fontWeight:800, color:INK }}>TOTALE</td>
                  <td style={{ padding:"12px", fontWeight:900, color:O, fontSize:16 }}>{fmt(total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </SCard>

      {/* Sezione "conferma ricezione" se ci sono pagamenti in arrivo */}
      {pending_pay.length>0 && (
        <SCard style={{ border:`1px solid rgba(37,99,235,.2)`, background:"rgba(37,99,235,.03)" }}>
          <STitle sub="Il locale ha confermato il pagamento — conferma la ricezione">
            Pagamenti in arrivo ({pending_pay.length})
          </STitle>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {pending_pay.map(b=>(
              <div key={b.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, flexWrap:"wrap", background:"white", borderRadius:14, padding:"12px 16px", border:`1px solid ${BORDER}` }}>
                <div>
                  <p style={{ fontWeight:700, fontSize:14, color:INK, margin:0 }}>{b.eventTitle||b.organizerName||"Evento"}</p>
                  <p style={{ fontSize:12, color:MUTED, margin:"3px 0 0" }}>{b.eventDate} · <strong style={{color:INK}}>€{b.cachet||b.artistCachet}</strong></p>
                </div>
                <button
                  onClick={async()=>{
                    await fetch("/api/bookings",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:b.id,paymentAction:"artist_confirm"})});
                    window.location.reload();
                  }}
                  style={{ background:INK, color:"white", border:"none", borderRadius:100, padding:"9px 18px", fontWeight:800, fontSize:13, cursor:"pointer", whiteSpace:"nowrap" }}>
                  ✓ Ho ricevuto il pagamento
                </button>
              </div>
            ))}
          </div>
        </SCard>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   GLOBAL CSS
───────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  #artist-area input:focus,
  #artist-area textarea:focus,
  #artist-area select:focus {
    border-color: rgba(255,90,0,.45) !important;
    box-shadow: 0 0 0 3px rgba(255,90,0,.08) !important;
  }
  #artist-area input::placeholder,
  #artist-area textarea::placeholder { color: rgba(0,0,0,.28); }
  #artist-area input[type=date] { color-scheme: light; }
  #artist-area input[type=number]::-webkit-inner-spin-button { opacity:.3; }
  #artist-area button[type=submit]:not(:disabled):hover {
    filter: brightness(1.08);
    transform: translateY(-1px);
  }
  @media(max-width:600px) {
    #artist-area { gap: 10px !important; }
  }
`;

const TABS = [
  { key:"mediakit",   label:"Profilo",    icon:"👤" },
  { key:"cachet",     label:"Cachet",     icon:"💶" },
  { key:"calendario", label:"Calendario", icon:"📅" },
  { key:"analitiche", label:"Analitiche", icon:"📊" },
  { key:"estratto",   label:"Guadagni",   icon:"💰" },
];

/* ─────────────────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────────────────── */
export default function ArtistArea(props) {
  const tabMapA = { profile:"mediakit", calendar:"calendario", analytics:"analitiche", earnings:"estratto" };
  const initialTab = tabMapA[props.tab] || props.tab || "mediakit";
  const plan = props.currentUser?.plan || "free";

  const [tab, setTab] = useState(initialTab);
  const [onboardStep, setOnboardStep] = useState(null);  // null = non attivo
  const [highlightCard, setHighlightCard] = useState(null);

  // Controlla se primo accesso (nessun profilo salvato)
  useEffect(() => {
    const key = `te_onboard_artist_${props.currentUser?.id}`;
    if (!localStorage.getItem(key)) {
      setOnboardStep(0);
    }
  }, [props.currentUser?.id]);

  function nextStep() {
    const next = onboardStep + 1;
    if (next >= ONBOARDING_STEPS_ARTIST.length) {
      // Fine onboarding
      const key = `te_onboard_artist_${props.currentUser?.id}`;
      localStorage.setItem(key, "done");
      setOnboardStep(null);
      setHighlightCard(null);
    } else {
      setOnboardStep(next);
      const s = ONBOARDING_STEPS_ARTIST[next];
      if (s.highlight) setHighlightCard(s.highlight);
    }
  }

  function skipOnboarding() {
    const key = `te_onboard_artist_${props.currentUser?.id}`;
    localStorage.setItem(key, "done");
    setOnboardStep(null);
    setHighlightCard(null);
  }

  function handleTabChange(newTab) {
    setTab(newTab);
  }

  const p = props;
  const setPricing = props.setPricing || (() => {});

  return (
    <div id="artist-area" style={{ fontFamily:"'Manrope',system-ui,sans-serif", color:INK, display:"flex", flexDirection:"column", gap:16, paddingBottom: onboardStep!==null ? 120 : 0 }}>
      <style>{GLOBAL_CSS}</style>

      {/* navigazione gestita dal DashboardShell */}

      {/* Contenuto tab */}
      {tab==="mediakit"   && <TabProfilo    plan={plan} highlightCard={highlightCard} stageName={p.stageName} setStageName={p.setStageName} artistType={p.artistType} setArtistType={p.setArtistType} bio={p.bio} setBio={p.setBio} city={p.city} setCity={p.setCity} musicGenres={p.musicGenres} setMusicGenres={p.setMusicGenres} eventTypes={p.eventTypes} setEventTypes={p.setEventTypes} photo={p.photo} setPhoto={p.setPhoto} instagram={p.instagram} setInstagram={p.setInstagram} spotify={p.spotify} setSpotify={p.setSpotify} youtube={p.youtube} setYoutube={p.setYoutube} soundcloud={p.soundcloud} setSoundcloud={p.setSoundcloud} tiktok={p.tiktok} setTiktok={p.setTiktok} rider={p.rider} setRider={p.setRider} saveArtistProfile={p.saveArtistProfile} artistMessage={p.artistMessage} />}
      {tab==="cachet"     && <TabCachet     pricing={p.pricing} setPricing={setPricing} eventTypes={p.eventTypes} saveArtistProfile={p.saveArtistProfile} artistMessage={p.artistMessage} />}
      {tab==="calendario" && <TabCalendario availableDates={p.availableDates||[]} setAvailableDates={p.setAvailableDates} bookedSlots={p.bookedSlots||[]} plan={plan} />}
      {tab==="analitiche" && <TabAnalitiche bookings={p.bookings||[]} plan={plan} />}
      {tab==="estratto"   && <TabGuadagni   bookings={p.bookings||[]} />}

      {/* Onboarding toast — solo se attivo */}
      {onboardStep !== null && (
        <OnboardingToast
          step={onboardStep}
          totalSteps={ONBOARDING_STEPS_ARTIST.length}
          onNext={nextStep}
          onSkip={skipOnboarding}
          onTabChange={handleTabChange}
        />
      )}
    </div>
  );
}