"use client";
import { useState, useEffect, useMemo } from "react";
import { Card, INK, Inp, KpiCard, MUTED, O, ProBadge, ProLock, SCard, STitle, fmt } from "./shared";
export default function PromoterCommissioni({ commissions, bookings, portfolio, plan }) {
  const myIds = portfolio.map(p => Number(p.entity_id));

  // Calcolo basato su bookings confermati dei miei artisti
  const myBookings = bookings.filter(b =>
    myIds.includes(Number(b.artist_id)) &&
    ["confirmed","accettato","accepted"].includes((b.status||"").toLowerCase())
  );

  const SHARE_PCT = 50; // % del margine ceduta da TuttoEvento al promoter
  const TE_MARGIN_PCT = 0.45; // margine medio TuttoEvento (stimato)

  const rows = myBookings.map(b => {
    const public_price = Number(b.publicPrice||b.public_price||b.cachet||0);
    const artist_cachet = Number(undefined /* cachet nascosto */||undefined /* cachet nascosto */||b.cachet||0);
    const te_margin = public_price - artist_cachet;
    const promoter_share = te_margin * (SHARE_PCT/100);
    return { ...b, public_price, artist_cachet, te_margin, promoter_share };
  });

  const totalVolume  = rows.reduce((s,r)=>s+r.public_price,0);
  const totalMargin  = rows.reduce((s,r)=>s+r.te_margin,0);
  const totalShare   = rows.reduce((s,r)=>s+r.promoter_share,0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* KPI commissioni */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12 }}>
        <KpiCard label="Volume sui tuoi artisti" value={fmt(totalVolume)} hint="booking confermati" />
        <KpiCard label="Margine TuttoEvento"     value={fmt(totalMargin)} hint="stimato" />
        <KpiCard label="Tua quota (50%)"          value={fmt(totalShare)}  hint="del margine TE" orange />
        <KpiCard label="Booking coinvolti"         value={rows.length}      accent />
      </div>

      {/* Nota modello commissioni */}
      <div style={{ background:"rgba(255,90,0,.04)", border:"1px solid rgba(255,90,0,.15)", borderRadius:18, padding:"14px 18px", display:"flex", gap:14, alignItems:"flex-start" }}>
        <span style={{ fontSize:22, flexShrink:0 }}>ℹ️</span>
        <div>
          <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:14, color:INK, margin:"0 0 4px" }}>Come funzionano le commissioni</p>
          <p style={{ fontSize:12, color:MUTED, margin:0, lineHeight:1.6, fontFamily:"'Manrope',system-ui,sans-serif" }}>
            TuttoEvento trattiene la differenza tra il prezzo pubblico pagato dal locale e il cachet netto dell'artista.
            Come promoter che porta un artista sulla piattaforma, ricevi il <strong>50% di questo margine</strong> per ogni booking confermato del tuo roster.
            I pagamenti vengono elaborati mensilmente una volta aperta la struttura societaria.
          </p>
        </div>
      </div>

      {/* Estratto base */}
      {rows.length===0 ? (
        <Card><p style={{ fontSize:13, color:"rgba(0,0,0,.3)" }}>Nessun booking confermato per i tuoi artisti.</p></Card>
      ) : (
        <Card>
          <STitle>Estratto commissioni</STitle>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:"2px solid rgba(0,0,0,.07)" }}>
                  {["Artista","Evento","Data","Prezzo pub.","Margine TE","Tua quota (50%)"].map(h => (
                    <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontWeight:700, color:MUTED, whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r,i) => (
                  <tr key={r.id||i} style={{ borderBottom:"1px solid rgba(0,0,0,.05)" }}>
                    <td style={{ padding:"10px 12px", fontWeight:700 }}>{r.artistName||"—"}</td>
                    <td style={{ padding:"10px 12px", color:MUTED }}>{r.eventTitle||"—"}</td>
                    <td style={{ padding:"10px 12px", color:MUTED }}>{r.eventDate||"—"}</td>
                    <td style={{ padding:"10px 12px", fontWeight:700 }}>{fmt(r.public_price)}</td>
                    <td style={{ padding:"10px 12px", color:MUTED }}>{fmt(r.te_margin)}</td>
                    <td style={{ padding:"10px 12px", fontWeight:800, color:O }}>{fmt(r.promoter_share)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop:"2px solid rgba(0,0,0,.1)", background:"#fbfaf8" }}>
                  <td colSpan={4} style={{ padding:"12px", fontWeight:800 }}>TOTALE</td>
                  <td style={{ padding:"12px", fontWeight:700 }}>{fmt(totalMargin)}</td>
                  <td style={{ padding:"12px", fontWeight:800, color:O, fontSize:15 }}>{fmt(totalShare)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Commissione personalizzata + Export — solo PRO */}
      <ProLock feature="La commissione personalizzabile per artista e l'export CSV" plan={plan}>
        <Card>
          <STitle>Commissione personalizzata per artista <ProBadge /></STitle>
          <p style={{ fontSize:13, color:MUTED, marginBottom:12 }}>Imposta percentuali diverse per ogni artista del roster. Es. artisti top al 35%, emerging al 25%.</p>
          <div style={{ display:"flex", gap:10 }}>
            <button disabled style={{ background:INK, color:"white", border:"none", borderRadius:100, padding:"10px 22px", fontWeight:700, fontSize:13, cursor:"not-allowed", fontFamily:"'Manrope',system-ui,sans-serif", opacity:.5 }}>
              Configura percentuali
            </button>
            <button disabled style={{ background:"white", border:"1px solid rgba(0,0,0,.1)", color:MUTED, borderRadius:100, padding:"10px 22px", fontWeight:700, fontSize:13, cursor:"not-allowed", fontFamily:"'Manrope',system-ui,sans-serif", opacity:.5 }}>
              Esporta CSV
            </button>
          </div>
        </Card>
      </ProLock>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════
   REFERRAL SECTION
═══════════════════════════════════════════════════════════ */
function ReferralSection({ currentUser, plan }) {
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
        <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".16em", color:"#ff5a00", margin:"0 0 4px", fontFamily:"Manrope,system-ui,sans-serif" }}>Link referral</p>
        <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:16, color:"#0a0a0b", margin:"0 0 4px" }}>Invita i tuoi artisti</h3>
        <p style={{ fontSize:13, color:"#6b6b73", margin:0, fontFamily:"Manrope,system-ui,sans-serif" }}>
          Condividi questo link con i tuoi artisti. Quando si registrano tramite il tuo link, vengono automaticamente collegati al tuo profilo promoter.
        </p>
      </div>

      {loading ? (
        <p style={{ fontSize:13, color:"rgba(0,0,0,.3)" }}>Caricamento...</p>
      ) : (
        <>
          {/* Codice */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12, flexWrap:"wrap" }}>
            <div style={{ background:"#0a0a0b", borderRadius:12, padding:"8px 16px", display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontFamily:"monospace", fontWeight:700, fontSize:18, color:"white", letterSpacing:"3px" }}>{code}</span>
            </div>
            <span style={{ fontSize:12, color:"#6b6b73" }}>Il tuo codice personale</span>
          </div>

          {/* Link */}
          <div style={{ background:"#fbfaf8", border:"1px solid rgba(0,0,0,.08)", borderRadius:14, padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:12, flexWrap:"wrap" }}>
            <p style={{ fontSize:12, color:"#6b6b73", margin:0, fontFamily:"monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{link}</p>
            <button onClick={copyLink}
              style={{ background: copied?"#16a34a":"#0a0a0b", color:"white", border:"none", borderRadius:10, padding:"7px 16px", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"Manrope,system-ui,sans-serif", flexShrink:0, transition:"background .2s" }}>
              {copied ? "✓ Copiato!" : "Copia link"}
            </button>
          </div>

          {/* Come funziona */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:12 }}>
            {[["1","Condividi","Invia il link ai tuoi artisti via WhatsApp, email o Instagram"],["2","Si registrano","L'artista clicca il link e crea l'account — viene collegato a te automaticamente"],["3","Gestisci","L'artista appare nel tuo roster e puoi gestire i suoi booking"]].map(([n,title,desc]) => (
              <div key={n} style={{ background:"#fbfaf8", borderRadius:14, padding:"12px 14px" }}>
                <div style={{ width:24, height:24, borderRadius:"50%", background:"#ff5a00", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Sora,sans-serif", fontWeight:900, fontSize:11, color:"white", marginBottom:8 }}>{n}</div>
                <p style={{ fontWeight:700, fontSize:12, color:"#0a0a0b", margin:"0 0 4px" }}>{title}</p>
                <p style={{ fontSize:11, color:"#6b6b73", margin:0, lineHeight:1.5 }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* Rigenera */}
          <button onClick={regenerate} disabled={regen}
            style={{ background:"none", border:"1px solid rgba(0,0,0,.1)", borderRadius:100, padding:"6px 16px", fontSize:11, fontWeight:700, color:"#6b6b73", cursor:"pointer", fontFamily:"Manrope,system-ui,sans-serif", opacity:regen?.5:1 }}>
            {regen ? "Rigenerazione..." : "↻ Rigenera codice"}
          </button>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB 5 — AGENZIA (pagina pubblica)
═══════════════════════════════════════════════════════════ */