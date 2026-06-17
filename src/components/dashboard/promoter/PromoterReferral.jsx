"use client";
import { useState, useEffect } from "react";
import { O, INK, MUTED } from "./shared";

export default function PromoterReferral({ currentUser, plan }) {
  const [code, setCode]       = useState("");
  const [link, setLink]       = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied]   = useState(false);
  const [regen, setRegen]     = useState(false);

  useEffect(() => {
    fetch("/api/referral/code")
      .then(r => r.json())
      .then(d => { if (d.code) { setCode(d.code); setLink(d.link); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function regenerate() {
    setRegen(true);
    const res = await fetch("/api/referral/code", { method:"POST" });
    const d = await res.json();
    if (d.code) { setCode(d.code); setLink(d.link); }
    setRegen(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ background:"white", border:"1px solid rgba(0,0,0,.06)", borderRadius:24, padding:"20px 22px" }}>
      <div style={{ marginBottom:16 }}>
        <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".16em", color:O, margin:"0 0 4px", fontFamily:"Manrope,system-ui,sans-serif" }}>Link referral</p>
        <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:16, color:INK, margin:"0 0 4px" }}>Invita i tuoi artisti</h3>
        <p style={{ fontSize:13, color:MUTED, margin:0, fontFamily:"Manrope,system-ui,sans-serif" }}>
          Condividi questo link con i tuoi artisti. Quando si registrano tramite il tuo link, vengono automaticamente collegati al tuo profilo promoter.
        </p>
      </div>

      {loading ? (
        <p style={{ fontSize:13, color:"rgba(0,0,0,.3)" }}>Caricamento...</p>
      ) : (
        <>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12, flexWrap:"wrap" }}>
            <div style={{ background:INK, borderRadius:12, padding:"8px 16px", display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontFamily:"monospace", fontWeight:700, fontSize:18, color:"white", letterSpacing:"3px" }}>{code}</span>
            </div>
            <span style={{ fontSize:12, color:MUTED }}>Il tuo codice personale</span>
          </div>

          <div style={{ background:"#fbfaf8", border:"1px solid rgba(0,0,0,.08)", borderRadius:14, padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:12, flexWrap:"wrap" }}>
            <p style={{ fontSize:12, color:MUTED, margin:0, fontFamily:"monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{link}</p>
            <button onClick={copyLink}
              style={{ background: copied?"#16a34a":INK, color:"white", border:"none", borderRadius:10, padding:"7px 16px", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"Manrope,system-ui,sans-serif", flexShrink:0, transition:"background .2s" }}>
              {copied ? "✓ Copiato!" : "Copia link"}
            </button>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:12 }}>
            {[["1","Condividi","Invia il link ai tuoi artisti via WhatsApp, email o Instagram"],["2","Si registrano","L'artista clicca il link e crea l'account — viene collegato a te automaticamente"],["3","Gestisci","L'artista appare nel tuo roster e puoi gestire i suoi booking"]].map(([n,title,desc]) => (
              <div key={n} style={{ background:"#fbfaf8", borderRadius:14, padding:"12px 14px" }}>
                <div style={{ width:24, height:24, borderRadius:"50%", background:O, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Sora,sans-serif", fontWeight:900, fontSize:11, color:"white", marginBottom:8 }}>{n}</div>
                <p style={{ fontWeight:700, fontSize:12, color:INK, margin:"0 0 4px" }}>{title}</p>
                <p style={{ fontSize:11, color:MUTED, margin:0, lineHeight:1.5 }}>{desc}</p>
              </div>
            ))}
          </div>

          <button onClick={regenerate} disabled={regen}
            style={{ background:"none", border:"1px solid rgba(0,0,0,.1)", borderRadius:100, padding:"6px 16px", fontSize:11, fontWeight:700, color:MUTED, cursor:"pointer", fontFamily:"Manrope,system-ui,sans-serif", opacity:regen?.5:1 }}>
            {regen ? "Rigenerazione..." : "↻ Rigenera codice"}
          </button>
        </>
      )}
    </div>
  );
}