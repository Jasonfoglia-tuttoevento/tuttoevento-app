"use client";
import { useState, useEffect } from "react";

export default function GdprBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("te_cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("te_cookie_consent", "accepted");
    setVisible(false);
    window.dispatchEvent(new Event("te:cookie-consent"));
  }

  function reject() {
    localStorage.setItem("te_cookie_consent", "rejected");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{
      position:"fixed", bottom:0, left:0, right:0, zIndex:9999,
      background:"#0a0a0b", borderTop:"1px solid rgba(255,255,255,.1)",
      padding:"16px 20px",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      gap:16, flexWrap:"wrap",
      fontFamily:"'Manrope',system-ui,sans-serif",
    }}>
      <p style={{ fontSize:13, color:"rgba(255,255,255,.7)", margin:0, flex:1, lineHeight:1.6 }}>
        Usiamo cookie tecnici (necessari) e di marketing (Meta Pixel) per migliorare l'esperienza.
        Puoi accettare o rifiutare quelli non necessari. <a href="/cookie-policy" style={{ color:"#ff5a00", textDecoration:"none" }}>Leggi di più →</a>
      </p>
      <div style={{ display:"flex", gap:8, flexShrink:0 }}>
        <button onClick={reject}
          style={{ background:"transparent", border:"1px solid rgba(255,255,255,.2)", color:"rgba(255,255,255,.6)", borderRadius:100, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
          Solo necessari
        </button>
        <button onClick={accept}
          style={{ background:"#ff5a00", border:"none", color:"white", borderRadius:100, padding:"8px 20px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
          Accetta tutti
        </button>
      </div>
    </div>
  );
}