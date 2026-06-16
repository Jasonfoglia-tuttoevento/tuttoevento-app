"use client";
import VerifiedBadge from "@/components/VerifiedBadge";
import AnalyticsWidget from "@/components/dashboard/AnalyticsWidget";
import { useState, useEffect, useRef, useCallback } from "react";
import ArtistProfilo    from "./artist/ArtistProfilo";
import ArtistCachet     from "./artist/ArtistCachet";
import ArtistCalendario from "./artist/ArtistCalendario";
import ArtistScalette   from "./artist/ArtistScalette";
import ArtistAnalitiche from "./artist/ArtistAnalitiche";
import ArtistGuadagni   from "./artist/ArtistGuadagni";
import ArtistRichieste  from "./artist/ArtistRichieste";

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
    body: "Indica nel Calendario i giorni in cui NON sei disponibile. Le date non bloccate sono considerate libere e possono ricevere richieste di booking.",
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
   PHOTO UPLOADER — foto profilo con camera/galleria/PDF
───────────────────────────────────────────────────────────────── */
function PhotoUploader({ photo, onPhotoChange }) {
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [preview, setPreview]   = useState(photo||"");
  const fileRef                 = useRef(null);
  const cameraRef               = useRef(null);

  useEffect(() => { setPreview(photo||""); }, [photo]);

  async function handleFile(file) {
    if (!file) return;
    setError(""); setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/artists/upload-photo", { method:"POST", body:fd }); // invia a photo_pending per moderazione
      const d   = await res.json();
      if (!res.ok) { setError(d.error||"Errore upload"); }
      else { setPreview(d.url); onPhotoChange(d.url); }
    } catch { setError("Errore di rete"); }
    setLoading(false);
  }

  const initials = "?";

  return (
    <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
      {/* Anteprima avatar */}
      <div style={{ position:"relative", flexShrink:0 }}>
        {preview ? (
          <img src={preview} alt="Foto profilo"
            style={{ width:80, height:80, borderRadius:16, objectFit:"cover", border:`2px solid ${BORDER}` }} />
        ) : (
          <div style={{ width:80, height:80, borderRadius:16, background:`${O}15`, border:`2px dashed ${O}40`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={O} strokeWidth="1.5" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        )}
        {loading && (
          <div style={{ position:"absolute", inset:0, borderRadius:16, background:"rgba(255,255,255,.8)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ width:20, height:20, border:`2px solid rgba(0,0,0,.1)`, borderTopColor:O, borderRadius:"50%", animation:"spin .7s linear infinite" }} />
          </div>
        )}
      </div>

      {/* Bottoni upload */}
      <div style={{ display:"flex", flexDirection:"column", gap:8, flex:1 }}>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {/* Scatta foto (camera — mobile) */}
          <button type="button" onClick={()=>cameraRef.current?.click()}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:100, background:"white", border:`1px solid ${BORDER}`, fontSize:12, fontWeight:700, color:INK, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            Scatta foto
          </button>
          <input ref={cameraRef} type="file" accept="image/*" capture="user" style={{ display:"none" }}
            onChange={e=>handleFile(e.target.files?.[0])} />

          {/* Scegli dalla galleria / file */}
          <button type="button" onClick={()=>fileRef.current?.click()}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:100, background:"white", border:`1px solid ${BORDER}`, fontSize:12, fontWeight:700, color:INK, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9l4-4 4 4 4-4 4 4"/><path d="M3 15l4 4 4-4 4 4 4-4"/></svg>
            Galleria / File
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
            style={{ display:"none" }} onChange={e=>handleFile(e.target.files?.[0])} />
        </div>
        <p style={{ fontSize:11, color:MUTED, margin:0 }}>JPG, PNG, WebP o PDF · max 10MB</p>
        {error && <p style={{ fontSize:12, fontWeight:700, color:"#dc2626", margin:0 }}>{error}</p>}
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────────────
   VIDEO SHOWCASE — carica, mostra e rimuovi video MP4
───────────────────────────────────────────────────────────────── */
function VideoShowcase({ plan }) {
  const isPro = plan === "pro";
  const MAX_FREE = 2;

  const [videos, setVideos]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [error, setError]         = useState("");
  const [title, setTitle]         = useState("");
  const [playing, setPlaying]     = useState(null);
  const fileRef                   = useRef(null);

  useEffect(() => { loadVideos(); }, []);

  async function loadVideos() {
    setLoading(true);
    const res = await fetch("/api/artists/upload-video");
    const d   = await res.json();
    setVideos(Array.isArray(d)?d:[]);
    setLoading(false);
  }

  async function handleVideoFile(file) {
    if (!file) return;
    if (file.type !== "video/mp4") { setError("Solo file MP4 supportati."); return; }
    if (file.size > 200*1024*1024) { setError("Video troppo grande. Massimo 200MB."); return; }
    if (!isPro && videos.length >= MAX_FREE) {
      setError(`Piano Free: massimo ${MAX_FREE} video.`); return;
    }
    setError(""); setUploading(true); setProgress(0);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", title||file.name.replace(".mp4",""));

    // Simulazione progresso (XHR per progresso reale)
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = e => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded/e.total)*100));
    };
    xhr.onload = async () => {
      setUploading(false); setProgress(0); setTitle("");
      if (xhr.status === 200 || xhr.status === 201) {
        await loadVideos();
      } else {
        try { const d = JSON.parse(xhr.responseText); setError(d.error||"Errore upload"); }
        catch { setError("Errore upload"); }
      }
    };
    xhr.onerror = () => { setUploading(false); setError("Errore di rete"); };
    xhr.open("POST", "/api/artists/upload-video");
    xhr.send(fd);
  }

  async function deleteVideo(id) {
    if (!confirm("Eliminare questo video?")) return;
    await fetch(`/api/artists/upload-video?id=${id}`, { method:"DELETE" });
    setVideos(prev=>prev.filter(v=>v.id!==id));
    if (playing===id) setPlaying(null);
  }

  function fmtSize(bytes) {
    if (bytes > 1024*1024) return `${(bytes/1024/1024).toFixed(1)} MB`;
    return `${Math.round(bytes/1024)} KB`;
  }

  const canUpload = isPro || videos.length < MAX_FREE;

  return (
    <SCard>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10, flexWrap:"wrap", marginBottom:16 }}>
        <STitle sub={isPro?"Video illimitati":"Max 2 con Free — illimitati con PRO"}>
          Video dimostrativi {!isPro && <ProBadge />}
        </STitle>
        {!isPro && (
          <span style={{ fontSize:12, fontWeight:700, color:MUTED }}>
            {videos.length}/{MAX_FREE}
          </span>
        )}
      </div>

      {/* Upload area */}
      {canUpload && (
        <div style={{ marginBottom:18 }}>
          {/* Titolo video */}
          <div style={{ marginBottom:8 }}>
            <input type="text" value={title} onChange={e=>setTitle(e.target.value)}
              placeholder="Titolo del video (opzionale)"
              style={{ ...inp }} />
          </div>

          {/* Drop zone */}
          <div
            onClick={()=>!uploading&&fileRef.current?.click()}
            style={{
              border:`2px dashed ${uploading?"rgba(255,90,0,.4)":"rgba(0,0,0,.1)"}`,
              borderRadius:16, padding:"24px 16px", textAlign:"center",
              cursor:uploading?"not-allowed":"pointer", transition:"all .2s",
              background:uploading?"rgba(255,90,0,.03)":"#fbfaf8",
            }}>
            <input ref={fileRef} type="file" accept="video/mp4" style={{ display:"none" }}
              onChange={e=>handleVideoFile(e.target.files?.[0])} />

            {uploading ? (
              <div>
                <div style={{ width:"100%", height:6, background:"rgba(0,0,0,.08)", borderRadius:3, overflow:"hidden", marginBottom:10 }}>
                  <div style={{ width:`${progress}%`, height:"100%", background:O, borderRadius:3, transition:"width .3s" }} />
                </div>
                <p style={{ fontSize:13, fontWeight:700, color:O, margin:0 }}>Caricamento... {progress}%</p>
                <p style={{ fontSize:11, color:MUTED, margin:"4px 0 0" }}>Non chiudere la pagina</p>
              </div>
            ) : (
              <div>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom:8 }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p style={{ fontSize:13, fontWeight:700, color:INK, margin:"0 0 4px" }}>Carica un video MP4</p>
                <p style={{ fontSize:11, color:MUTED, margin:0 }}>Clicca o trascina · max 200MB · solo MP4</p>
              </div>
            )}
          </div>

          {error && <p style={{ fontSize:12, fontWeight:700, color:"#dc2626", margin:"8px 0 0" }}>{error}</p>}
        </div>
      )}

      {!canUpload && !isPro && (
        <ProLock feature={`Video illimitati (hai usato ${MAX_FREE}/${MAX_FREE} con Free)`} plan={plan} />
      )}

      {/* Lista video */}
      {loading ? (
        <p style={{ fontSize:13, color:MUTED }}>Caricamento...</p>
      ) : videos.length===0 ? (
        <div style={{ padding:"20px 0", textAlign:"center" }}>
          <p style={{ fontSize:13, color:MUTED, margin:0 }}>Nessun video caricato.</p>
          <p style={{ fontSize:12, color:"rgba(0,0,0,.25)", margin:"4px 0 0" }}>Carica un video per mostrare ai locali come suoni dal vivo.</p>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {videos.map(v=>(
            <div key={v.id} style={{ background:"#fbfaf8", border:`1px solid ${BORDER}`, borderRadius:16, overflow:"hidden" }}>
              {/* Player */}
              {playing===v.id ? (
                <video controls autoPlay style={{ width:"100%", display:"block", maxHeight:260, background:"#000" }}
                  onEnded={()=>setPlaying(null)}>
                  <source src={v.url} type="video/mp4" />
                </video>
              ) : (
                <div style={{ position:"relative", background:"#0a0a0b", aspectRatio:"16/9", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
                  onClick={()=>setPlaying(v.id)}>
                  {/* Thumbnail placeholder */}
                  <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ width:52, height:52, borderRadius:"50%", background:"rgba(255,255,255,.15)", display:"flex", alignItems:"center", justifyContent:"center", transition:"background .2s" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    </div>
                  </div>
                  <span style={{ position:"absolute", bottom:8, right:10, fontSize:11, color:"rgba(255,255,255,.5)", fontWeight:600 }}>
                    {fmtSize(v.size_bytes||0)}
                  </span>
                </div>
              )}

              {/* Info + azioni */}
              <div style={{ padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
                <div style={{ minWidth:0 }}>
                  <p style={{ fontWeight:700, fontSize:13, color:INK, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{v.title||"Video dimostrativo"}</p>
                  <p style={{ fontSize:11, color:MUTED, margin:"2px 0 0" }}>
                    {new Date(v.created_at).toLocaleDateString("it-IT",{day:"2-digit",month:"short",year:"numeric"})}
                    {v.size_bytes ? ` · ${fmtSize(v.size_bytes)}` : ""}
                  </p>
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  <button type="button" onClick={()=>setPlaying(playing===v.id?null:v.id)}
                    style={{ padding:"6px 12px", borderRadius:100, border:`1px solid ${BORDER}`, background:"white", fontSize:12, fontWeight:700, color:INK, cursor:"pointer" }}>
                    {playing===v.id ? "⏸ Pausa" : "▶ Play"}
                  </button>
                  <button type="button" onClick={()=>deleteVideo(v.id)}
                    style={{ width:32, height:32, borderRadius:"50%", border:"1px solid rgba(220,38,38,.2)", background:"rgba(220,38,38,.06)", color:"#dc2626", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700 }}>
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SCard>
  );
}

/* ─────────────────────────────────────────────────────────────────
   GENERE MULTISELECT — dropdown con checkbox, senza emoji
───────────────────────────────────────────────────────────────── */
function GenreMultiSelect({ selected=[], onToggle, isPro }) {
  const [open, setOpen] = useState(false);
  const [rect,  setRect]  = useState(null);
  const triggerRef = useRef(null);
  const safe = Array.isArray(selected) ? selected : [];
  const maxReached = !isPro && safe.length >= 3;

  function handleOpen() {
    if (!open && triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect());
    }
    setOpen(p => !p);
  }

  return (
    <div style={{ position:"relative" }}>
      {/* Trigger */}
      <button ref={triggerRef} type="button" onClick={handleOpen}
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

      {/* Overlay per chiudere — onClick, non onMouseDown, per non vincere sul click del checkbox */}
      {open && (
        <div style={{ position:"fixed", inset:0, zIndex:9998 }} onClick={()=>{ setOpen(false); setRect(null); }} />
      )}

      {/* Dropdown — position:fixed per bucare overflow:hidden delle card padre */}
      {open && rect && (
        <div style={{
          position:"fixed",
          top: rect.bottom + 6,
          left: rect.left,
          width: rect.width,
          zIndex:9999,
          background:"white", border:"1px solid rgba(0,0,0,.1)", borderRadius:14,
          boxShadow:"0 8px 32px rgba(0,0,0,.15)", maxHeight:260, overflowY:"auto",
          animation:"te-slide-down .15s ease",
        }}>
          <style>{`@keyframes te-slide-down{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
          {MUSIC_GENRES.map(g => {
            const isActive   = safe.includes(g);
            const isDisabled = maxReached && !isActive;
            return (
              <button key={g} type="button"
                onClick={e=>{ e.stopPropagation(); if(!isDisabled) onToggle(g); }}
                style={{
                  width:"100%", display:"flex", alignItems:"center", gap:10,
                  padding:"10px 14px", background:"none", border:"none",
                  cursor:isDisabled?"not-allowed":"pointer",
                  borderBottom:"1px solid rgba(0,0,0,.04)",
                  opacity:isDisabled?.4:1, transition:"background .1s",
                  fontFamily:"'Manrope',system-ui,sans-serif",
                  WebkitTapHighlightColor:"transparent",
                }}>
                <div style={{
                  width:18, height:18, borderRadius:5, flexShrink:0,
                  border:`1.5px solid ${isActive?O:"rgba(0,0,0,.2)"}`,
                  background:isActive?O:"white",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  transition:"all .15s", pointerEvents:"none",
                }}>
                  {isActive && (
                    <svg width="10" height="10" viewBox="0 0 10 10">
                      <polyline points="1,5 4,8 9,2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>
                <span style={{ fontSize:13, fontWeight:isActive?700:500, color:isActive?INK:MUTED, pointerEvents:"none" }}>
                  {g}
                </span>
              </button>
            );
          })}
        </div>
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
   EVENT TYPE MULTISELECT — identico al GenreMultiSelect
───────────────────────────────────────────────────────────────── */
function EventTypeMultiSelect({ selected=[], onToggle }) {
  const [open, setOpen] = useState(false);
  const [rect, setRect]  = useState(null);
  const triggerRef2 = useRef(null);
  const safe = Array.isArray(selected) ? selected : [];

  function handleOpen2() {
    if (!open && triggerRef2.current) {
      setRect(triggerRef2.current.getBoundingClientRect());
    }
    setOpen(p => !p);
  }

  return (
    <div style={{ position:"relative" }}>
      <button ref={triggerRef2} type="button" onClick={handleOpen2}
        style={{
          width:"100%", background:"#fbfaf8", border:`1px solid ${open?"rgba(255,90,0,.45)":"rgba(0,0,0,.1)"}`,
          borderRadius:12, padding:"10px 14px", fontSize:13, color:INK,
          fontFamily:"'Manrope',system-ui,sans-serif", cursor:"pointer", textAlign:"left",
          display:"flex", alignItems:"center", justifyContent:"space-between", gap:8,
          boxShadow: open?"0 0 0 3px rgba(255,90,0,.08)":"none", transition:"all .15s",
        }}>
        <span style={{ color:safe.length>0?INK:MUTED }}>
          {safe.length===0 ? "Seleziona i tipi di evento..." :
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

      {/* Overlay — onClick, non onMouseDown */}
      {open && <div style={{ position:"fixed", inset:0, zIndex:9998 }} onClick={()=>{ setOpen(false); setRect(null); }} />}

      {open && rect && (
        <div style={{
          position:"fixed",
          top: rect.bottom + 6,
          left: rect.left,
          width: rect.width,
          zIndex:9999,
          background:"white", border:"1px solid rgba(0,0,0,.1)", borderRadius:14,
          boxShadow:"0 8px 32px rgba(0,0,0,.15)", overflow:"hidden", maxHeight:260, overflowY:"auto",
        }}>
          {EVENT_TYPES.map(e => {
            const isActive = safe.includes(e);
            return (
              <button key={e} type="button"
                onClick={ev=>{ ev.stopPropagation(); onToggle(e); }}
                style={{
                  width:"100%", display:"flex", alignItems:"center", gap:10,
                  padding:"10px 14px", background:"none", border:"none",
                  cursor:"pointer", borderBottom:"1px solid rgba(0,0,0,.04)",
                  transition:"background .1s", fontFamily:"'Manrope',system-ui,sans-serif",
                  WebkitTapHighlightColor:"transparent",
                }}>
                <div style={{
                  width:18, height:18, borderRadius:5, flexShrink:0,
                  border:`1.5px solid ${isActive?O:"rgba(0,0,0,.2)"}`,
                  background:isActive?O:"white",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  transition:"all .15s", pointerEvents:"none",
                }}>
                  {isActive && (
                    <svg width="10" height="10" viewBox="0 0 10 10">
                      <polyline points="1,5 4,8 9,2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>
                <span style={{ fontSize:13, fontWeight:isActive?700:500, color:isActive?INK:MUTED, pointerEvents:"none" }}>{e}</span>
              </button>
            );
          })}
        </div>
      )}

      {safe.length>0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:8 }}>
          {safe.map(e=>(
            <span key={e} style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:12, fontWeight:700, color:O, background:`${O}10`, border:`1px solid ${O}25`, borderRadius:100, padding:"3px 10px" }}>
              {e}
              <button type="button" onClick={()=>onToggle(e)}
                style={{ background:"none", border:"none", cursor:"pointer", color:O, fontSize:13, lineHeight:1, padding:0 }}>×</button>
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

export default function ArtistArea(props) {
  const tabMapA = { profile:"mediakit", calendar:"calendario", analytics:"analitiche", earnings:"estratto" };
  const initialTab = tabMapA[props.tab] || props.tab || "mediakit";
  const plan = props.currentUser?.plan || "free";

  const [tab, setTab] = useState(initialTab);
  const [onboardStep, setOnboardStep] = useState(null);  // null = non attivo
  const [highlightCard, setHighlightCard] = useState(null);

  // Sincronizza il tab con la prop esterna (quando si clicca nella sidebar)
  useEffect(() => {
    const mapped = tabMapA[props.tab] || props.tab || "mediakit";
    setTab(mapped);
  }, [props.tab]);

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
      {tab==="video"      && <VideoShowcase plan={plan} />}
      {tab==="mediakit"   && <ArtistProfilo plan={plan} highlightCard={highlightCard} stageName={p.stageName} setStageName={p.setStageName} artistType={p.artistType} setArtistType={p.setArtistType} bio={p.bio} setBio={p.setBio} city={p.city} setCity={p.setCity} musicGenres={p.musicGenres} setMusicGenres={p.setMusicGenres} eventTypes={p.eventTypes} setEventTypes={p.setEventTypes} photo={p.photo} setPhoto={p.setPhoto} instagram={p.instagram} setInstagram={p.setInstagram} spotify={p.spotify} setSpotify={p.setSpotify} youtube={p.youtube} setYoutube={p.setYoutube} soundcloud={p.soundcloud} setSoundcloud={p.setSoundcloud} tiktok={p.tiktok} setTiktok={p.setTiktok} rider={p.rider} setRider={p.setRider} saveArtistProfile={p.saveArtistProfile} artistMessage={p.artistMessage} />}
      {tab==="cachet"     && <ArtistCachet  pricing={p.pricing} setPricing={setPricing} eventTypes={p.eventTypes} saveArtistProfile={p.saveArtistProfile} artistMessage={p.artistMessage} />}
      {tab==="richieste"  && <ArtistRichieste bookings={p.bookings||[]} onRefreshBookings={props.onRefreshBookings} />}
      {tab==="scalette"   && <ArtistScalette bookings={p.bookings||[]} currentUser={props.currentUser} />}
      {tab==="calendario" && <ArtistCalendario availableDates={p.availableDates||[]} setAvailableDates={p.setAvailableDates} bookedSlots={p.bookedSlots||[]} plan={plan} />}
      {tab==="analitiche" && <AnalyticsWidget role="artist" userId={props.currentUser?.id} />}
      {tab==="estratto"   && <ArtistGuadagni bookings={p.bookings||[]} />}

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