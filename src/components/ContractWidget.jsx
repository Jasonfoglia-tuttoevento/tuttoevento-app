"use client";
import { useState, useEffect } from "react";

const O = "#ff5a00", INK = "#0a0a0b", MUTED = "#6b6b73";

export default function ContractWidget({ bookingId, currentUserRole }) {
  const [contract, setContract] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [signing, setSigning]   = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => { load(); }, [bookingId]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/contracts?bookingId=${bookingId}`);
      const d = await res.json();
      setContract(d);
    } catch {} finally { setLoading(false); }
  }

  async function sign() {
    setSigning(true);
    try {
      const res = await fetch("/api/contracts", {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ bookingId }),
      });
      const d = await res.json();
      if (res.ok) setContract(d);
    } catch {} finally { setSigning(false); }
  }

  if (loading) return <p style={{ fontSize:13, color:MUTED }}>Caricamento contratto…</p>;
  if (!contract) return null;

  const isArtist    = currentUserRole === "artist";
  const mySigned    = isArtist ? contract.artist_signed_at : contract.organizer_signed_at;
  const otherSigned = isArtist ? contract.organizer_signed_at : contract.artist_signed_at;

  return (
    <div style={{ background:"white", border:"1px solid rgba(0,0,0,.08)", borderRadius:16, padding:"16px 18px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom:10 }}>
        <p style={{ fontWeight:800, fontSize:14, color:INK, margin:0, fontFamily:"'Sora',sans-serif" }}>Contratto digitale</p>
        <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:100,
          background: contract.status==="signed" ? "rgba(22,163,74,.12)" : "rgba(217,119,6,.12)",
          color: contract.status==="signed" ? "#16a34a" : "#d97706" }}>
          {contract.status === "signed" ? "Firmato da entrambi" : "In attesa di firme"}
        </span>
      </div>

      {/* Testo contratto */}
      <div style={{ background:"#fbfaf8", border:"1px solid rgba(0,0,0,.06)", borderRadius:12, padding:"12px 14px", marginBottom:12 }}>
        <pre style={{ fontSize:11.5, color:"#333", margin:0, whiteSpace:"pre-wrap", fontFamily:"'Manrope',system-ui,sans-serif", lineHeight:1.6,
          maxHeight: expanded ? "none" : 120, overflow:"hidden", position:"relative" }}>
          {contract.content_snapshot}
        </pre>
        <button onClick={()=>setExpanded(e=>!e)}
          style={{ background:"none", border:"none", color:O, fontSize:12, fontWeight:700, cursor:"pointer", padding:"6px 0 0", fontFamily:"'Manrope',system-ui,sans-serif" }}>
          {expanded ? "Mostra meno" : "Leggi tutto il contratto"}
        </button>
      </div>

      {/* Stato firme */}
      <div style={{ display:"flex", gap:10, marginBottom:12 }}>
        {[["Locale", contract.organizer_signed_at], ["Artista", contract.artist_signed_at]].map(([label, signedAt]) => (
          <div key={label} style={{ flex:1, background:"#fbfaf8", borderRadius:10, padding:"8px 10px", textAlign:"center" }}>
            <p style={{ fontSize:10, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".08em", margin:"0 0 3px" }}>{label}</p>
            <p style={{ fontSize:12, fontWeight:700, color: signedAt ? "#16a34a" : MUTED, margin:0 }}>
              {signedAt ? "✓ Firmato" : "In attesa"}
            </p>
          </div>
        ))}
      </div>

      {/* Azione firma */}
      {!mySigned ? (
        <>
          <button onClick={sign} disabled={signing}
            style={{ width:"100%", background:O, color:"white", border:"none", borderRadius:12, padding:"11px",
              fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif", opacity:signing?.6:1 }}>
            {signing ? "Firma in corso…" : "Accetto e firmo il contratto"}
          </button>
          <p style={{ fontSize:11, color:MUTED, margin:"8px 0 0", textAlign:"center", lineHeight:1.5 }}>
            Firmando accetti i termini. Verranno registrati data, ora e IP.
          </p>
        </>
      ) : (
        <p style={{ fontSize:12, color:"#16a34a", fontWeight:700, margin:0, textAlign:"center" }}>
          ✓ Hai firmato il {new Date(mySigned).toLocaleDateString("it-IT")}
          {!otherSigned && " — in attesa della controparte"}
        </p>
      )}
    </div>
  );
}