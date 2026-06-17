"use client";
import { useState } from "react";

export const O     = "#ff5a00";
export const INK   = "#0a0a0b";
export const MUTED = "#6b6b73";

export function fmt(n) {
  return new Intl.NumberFormat("it-IT",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n||0);
}
export function pct(n,d) { return d ? `${((n/d)*100).toFixed(1)}%` : "0%"; }

export function SCard({ children, style={} }) {
  return <div style={{ background:"white", border:"1px solid rgba(0,0,0,.06)", borderRadius:24, padding:"20px 22px", ...style }}>{children}</div>;
}
export function STitle({ children }) {
  return <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:15, letterSpacing:"-.02em", color:INK, margin:"0 0 14px" }}>{children}</h3>;
}
export function ProBadge() {
  return <span style={{ display:"inline-flex", alignItems:"center", background:"rgba(255,90,0,.12)", border:"1px solid rgba(255,90,0,.25)", borderRadius:100, padding:"1px 8px", fontSize:10, fontWeight:800, color:O, verticalAlign:"middle", marginLeft:6 }}>PRO</span>;
}
export function ProLock({ feature="questa funzionalità", plan }) {
  if (plan==="pro") return null;
  return (
    <div style={{ background:"rgba(255,90,0,.04)", border:"1px dashed rgba(255,90,0,.25)", borderRadius:18, padding:20, display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:12 }}>
      <p style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:14, color:INK, margin:0 }}>Funzione Piano Pro</p>
      <p style={{ fontSize:12, color:MUTED, margin:0 }}>{feature} è disponibile nel piano Pro.</p>
      <a href="/pricing" style={{ fontSize:11, color:O, fontWeight:700 }}>Upgrade a Pro →</a>
    </div>
  );
}
export function Inp({ label, value, onChange, placeholder, type="text", disabled }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      {label && <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".1em", fontFamily:"'Manrope',system-ui,sans-serif" }}>{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
        style={{ background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)", borderRadius:12, padding:"10px 13px", fontSize:13, fontFamily:"'Manrope',system-ui,sans-serif", outline:"none", opacity:disabled?.5:1, width:"100%", boxSizing:"border-box" }} />
    </div>
  );
}
export function KpiCard({ label, value, hint, accent, orange }) {
  return (
    <div style={{ background:accent?INK:orange?`${O}10`:"white", border:`1px solid ${accent?"transparent":orange?`${O}25`:"rgba(0,0,0,.06)"}`, borderRadius:22, padding:"16px 18px" }}>
      <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".12em", color:accent?"rgba(255,255,255,.45)":MUTED, margin:"0 0 5px", fontFamily:"'Manrope',system-ui,sans-serif" }}>{label}</p>
      <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:22, letterSpacing:"-.03em", color:accent?"white":orange?O:INK, margin:0 }}>{value}</p>
      {hint && <p style={{ fontSize:11, fontWeight:700, color:accent?"rgba(255,255,255,.4)":orange?O:MUTED, margin:"4px 0 0" }}>{hint}</p>}
    </div>
  );
}
export function StatusBadge({ status }) {
  const map = { pending:{label:"In attesa",color:"#d97706"}, reviewed:{label:"In revisione",color:"#2563eb"}, connected:{label:"Connessi",color:"#16a34a"}, rejected:{label:"Rifiutata",color:"#dc2626"} };
  const s = map[status] || { label:status||"—", color:MUTED };
  return <span style={{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:100, background:`${s.color}18`, color:s.color }}>{s.label}</span>;
}


// Alias retrocompatibili
export const Card = SCard;
export const SectionTitle = STitle;