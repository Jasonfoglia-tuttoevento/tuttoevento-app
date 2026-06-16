"use client";
import { useState, useEffect, useRef } from "react";

/* ── Design tokens ── */
export const O      = "#ff5a00";
export const INK    = "#0a0a0b";
export const BG     = "#f5f5f6";
export const CARD   = "#ffffff";
export const BORDER = "rgba(0,0,0,.07)";
export const MUTED  = "#6b6b73";
export const MUTED2 = "rgba(0,0,0,.04)";

export const inp = {
  background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)", borderRadius:12,
  padding:"10px 14px", fontSize:13, color:INK,
  fontFamily:"'Manrope',system-ui,sans-serif", outline:"none", width:"100%",
  transition:"border-color .15s",
};

export const sel = { ...inp, cursor:"pointer", appearance:"none", WebkitAppearance:"none" };

export const DURATIONS = [
  { key:"1h",      label:"1 ora"   },
  { key:"2h",      label:"2 ore"   },
  { key:"3h",      label:"3 ore"   },
  { key:"fullday", label:"Full day" },
];

export const MUSIC_GENRES  = ["House","Tech House","Techno","Trance","Drum & Bass","Hip Hop","Rap","R&B","Soul","Jazz","Blues","Rock","Indie","Pop","Reggae","Funk","Electronic","Ambient","Classica","Folk","Latino","Afrobeat","Altro"];
export const EVENT_TYPES   = ["Serata in club","Festival","Evento privato","Concerto","Opening","Matrimonio","Evento aziendale","Altro"];
export const ARTIST_TYPES  = ["DJ","Band","Cantante","Duo","Trio","Musicista solista","Performer","Altro"];

/* ── Componenti UI condivisi ── */

export function SCard({ children, style={}, highlight=false }) {
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

export function STitle({ children, sub }) {
  return (
    <div style={{ marginBottom:16 }}>
      <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:16, letterSpacing:"-.03em", color:INK, margin:0 }}>{children}</h3>
      {sub && <p style={{ fontSize:12, color:MUTED, margin:"4px 0 0", lineHeight:1.5 }}>{sub}</p>}
    </div>
  );
}

export function ProBadge() {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", background:"rgba(255,90,0,.1)",
      border:"1px solid rgba(255,90,0,.25)", borderRadius:100, padding:"1px 8px",
      fontSize:10, fontWeight:800, color:O, verticalAlign:"middle", marginLeft:6 }}>PRO</span>
  );
}

export function ProLock({ feature="questa funzionalità", plan }) {
  if (plan==="pro") return null;
  return (
    <div style={{ background:"rgba(255,90,0,.04)", border:"1px dashed rgba(255,90,0,.2)",
      borderRadius:12, padding:"12px 14px", display:"flex", alignItems:"center", gap:10, marginTop:10 }}>
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

export function Label({ children }) {
  return (
    <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase",
      letterSpacing:".12em", display:"block", marginBottom:5 }}>
      {children}
    </label>
  );
}

export function Field({ label, children, hint }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      {label && <Label>{label}</Label>}
      {children}
      {hint && <p style={{ fontSize:11, color:MUTED, margin:0 }}>{hint}</p>}
    </div>
  );
}

export function Inp({ label, value, onChange, placeholder, type="text", disabled, hint }) {
  return (
    <Field label={label} hint={hint}>
      <input type={type} value={value||""} onChange={onChange} placeholder={placeholder} disabled={disabled}
        style={{ ...inp, opacity:disabled?.4:1 }} />
    </Field>
  );
}

export function SelectField({ label, value, onChange, options=[], placeholder="" }) {
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

export function Chip({ label, active, onClick }) {
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

export function KpiCard({ label, value, accent=false, orange=false }) {
  return (
    <div style={{
      background: accent ? INK : orange ? `${O}08` : "#f8f8f9",
      border:`1px solid ${accent||orange?"transparent":"rgba(0,0,0,.06)"}`,
      borderRadius:18, padding:"18px 20px",
    }}>
      <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".12em",
        color: accent?"rgba(255,255,255,.5)":orange?O:MUTED, margin:"0 0 6px",
        fontFamily:"'Manrope',system-ui,sans-serif" }}>{label}</p>
      <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:26, letterSpacing:"-.04em",
        color: accent?"white":orange?O:INK, margin:0 }}>{value}</p>
    </div>
  );
}


/* ── Componenti profilo ── */
export function PhotoUploader({ photo, onPhotoChange }) {
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

export function GenreMultiSelect({ selected=[], onToggle, isPro }) {
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

export function EventTypeMultiSelect({ selected=[], onToggle }) {
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