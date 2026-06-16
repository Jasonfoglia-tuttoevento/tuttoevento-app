"use client";
// Costanti di design condivise tra tutti i componenti artista
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

export const DURATIONS = [
  { key:"1h",      label:"1 ora"   },
  { key:"2h",      label:"2 ore"   },
  { key:"3h",      label:"3 ore"   },
  { key:"fullday", label:"Full day" },
];

// Componenti UI condivisi
export function SCard({ children, style={} }) {
  return (
    <div style={{
      background:CARD, borderRadius:20, padding:"20px 18px",
      border:`1px solid ${BORDER}`, boxShadow:"0 2px 12px rgba(0,0,0,.04)",
      ...style
    }}>
      {children}
    </div>
  );
}

export function STitle({ children, sub }) {
  return (
    <div style={{ marginBottom:14 }}>
      <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:18, margin:0, color:INK }}>{children}</p>
      {sub && <p style={{ fontSize:12, color:MUTED, margin:"3px 0 0" }}>{sub}</p>}
    </div>
  );
}

export function ProBadge() {
  return (
    <span style={{ fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:100,
      background:`${O}18`, color:O, border:`1px solid ${O}30`,
      letterSpacing:".08em", textTransform:"uppercase" }}>PRO</span>
  );
}

export function ProLock({ feature, plan }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px",
      background:`${O}08`, borderRadius:12, border:`1px solid ${O}20` }}>
      <span style={{ fontSize:16 }}>🔒</span>
      <p style={{ fontSize:12, color:O, fontWeight:600, margin:0 }}>
        {feature} · <a href="/pricing" style={{ color:O, fontWeight:800 }}>Upgrade a Pro →</a>
      </p>
    </div>
  );
}