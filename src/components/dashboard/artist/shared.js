"use client";

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