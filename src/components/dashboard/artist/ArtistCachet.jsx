"use client";
import { useState, useEffect, useRef } from "react";
import { SCard, STitle, ProBadge, ProLock, O, INK, BORDER, MUTED, MUTED2, inp, DURATIONS } from "./shared";

export default function ArtistCachet({ pricing={}, setPricing, eventTypes=[], saveArtistProfile, artistMessage }) {
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [approvalMsg, setApprovalMsg]         = useState("");

  // NOTA: il prezzo pubblico (public_pricing) NON viene mostrato all'artista.
  // L'artista vede solo lo stato di approvazione del proprio cachet privato.
  useEffect(() => {
    fetch("/api/pricing-approval")
      .then(r=>r.json())
      .then(d=>{
        if (!Array.isArray(d)||d.length===0) return;
        const latest = d[0];
        setApprovalStatus(latest.status);
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
        <STitle sub="Indica quanto vuoi guadagnare per ogni tipo di serata e durata">
          Listino prezzi
        </STitle>
        <p style={{ fontSize:12, color:MUTED, margin:"0 0 18px", lineHeight:1.65 }}>
          Questi sono i <strong style={{color:INK}}>tuoi compensi di riferimento</strong>. Il team TuttoEvento li userà per proporti ai locali con il prezzo migliore, occupandosi della trattativa per te.
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

        <div style={{ marginTop:16, background:"rgba(0,0,0,.03)", borderRadius:12, padding:"10px 14px", fontSize:12, color:MUTED, lineHeight:1.6 }}>
          💡 Aggiungi i tipi di evento nella tab <strong style={{color:INK}}>Profilo</strong> — qui appariranno automaticamente. Se non ne hai ancora, vengono usati 4 tipi di default.
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