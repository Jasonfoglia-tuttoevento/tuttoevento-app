"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function GdprBanner() {
  const [show, setShow] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: false, marketing: false });

  useEffect(() => {
    const consent = localStorage.getItem("te-cookie-consent");
    if (!consent) setShow(true);
  }, []);

  function acceptAll() {
    const consent = { technical: true, analytics: true, marketing: true, date: new Date().toISOString() };
    localStorage.setItem("te-cookie-consent", JSON.stringify(consent));
    setShow(false);
  }

  function acceptTechnicalOnly() {
    const consent = { technical: true, analytics: false, marketing: false, date: new Date().toISOString() };
    localStorage.setItem("te-cookie-consent", JSON.stringify(consent));
    setShow(false);
  }

  function savePreferences() {
    const consent = { technical: true, analytics: prefs.analytics, marketing: prefs.marketing, date: new Date().toISOString() };
    localStorage.setItem("te-cookie-consent", JSON.stringify(consent));
    setShow(false);
    setShowModal(false);
  }

  if (!show) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap');
        .te-gdpr-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:9998; display:flex; align-items:center; justify-content:center; padding:20px; }
        .te-gdpr-modal { background:white; border-radius:28px; padding:32px; max-width:520px; width:100%; box-shadow:0 40px 80px rgba(0,0,0,.3); font-family:'Manrope',sans-serif; }
        .te-gdpr-banner { position:fixed; bottom:0; left:0; right:0; z-index:9997; background:white; border-top:1px solid #e5e5e7; padding:20px 24px; box-shadow:0 -8px 40px rgba(0,0,0,.1); font-family:'Manrope',sans-serif; }
        .te-gdpr-banner-inner { max-width:1100px; margin:0 auto; display:flex; flex-wrap:wrap; align-items:center; gap:16px; justify-content:space-between; }
        .te-gdpr-btn { padding:10px 20px; border-radius:100px; font-weight:700; font-size:0.875rem; cursor:pointer; border:none; transition:all .2s; }
        .te-gdpr-btn-primary { background:#ff5a00; color:white; }
        .te-gdpr-btn-primary:hover { background:#e85100; }
        .te-gdpr-btn-secondary { background:#f5f5f6; color:#0a0a0b; }
        .te-gdpr-btn-secondary:hover { background:#e5e5e6; }
        .te-gdpr-btn-outline { background:transparent; color:#0a0a0b; border:1.5px solid #d0d0d0; }
        .te-gdpr-btn-outline:hover { border-color:#ff5a00; color:#ff5a00; }
        .te-gdpr-toggle { position:relative; width:44px; height:24px; border-radius:12px; cursor:pointer; transition:.2s; border:none; flex-shrink:0; }
        .te-gdpr-toggle.on { background:#ff5a00; }
        .te-gdpr-toggle.off { background:#d0d0d0; }
        .te-gdpr-toggle::after { content:""; position:absolute; top:2px; width:20px; height:20px; border-radius:50%; background:white; transition:.2s; }
        .te-gdpr-toggle.on::after { left:22px; }
        .te-gdpr-toggle.off::after { left:2px; }
      `}</style>

      {/* Modal preferenze */}
      {showModal && (
        <div className="te-gdpr-overlay">
          <div className="te-gdpr-modal">
            <h2 style={{ fontWeight:800, fontSize:"1.3rem", marginBottom:"0.5rem", letterSpacing:"-0.02em" }}>Preferenze Cookie</h2>
            <p style={{ fontSize:"0.875rem", color:"#6b6b73", marginBottom:"1.5rem", lineHeight:1.6 }}>
              Personalizza le tue preferenze. I cookie tecnici sono sempre attivi perché necessari al funzionamento della piattaforma.
            </p>

            <div style={{ display:"flex", flexDirection:"column", gap:"16px", marginBottom:"1.5rem" }}>
              {/* Tecnici - sempre on */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px", background:"#f5f5f6", borderRadius:"16px" }}>
                <div>
                  <p style={{ fontWeight:700, fontSize:"0.9rem", marginBottom:"4px" }}>Cookie Tecnici</p>
                  <p style={{ fontSize:"0.8rem", color:"#6b6b73", lineHeight:1.5 }}>Autenticazione e funzionamento della piattaforma. Sempre attivi.</p>
                </div>
                <button className="te-gdpr-toggle on" disabled style={{ opacity:0.6, cursor:"not-allowed" }} />
              </div>

              {/* Analitici */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px", background:"#f5f5f6", borderRadius:"16px" }}>
                <div>
                  <p style={{ fontWeight:700, fontSize:"0.9rem", marginBottom:"4px" }}>Cookie Analitici</p>
                  <p style={{ fontSize:"0.8rem", color:"#6b6b73", lineHeight:1.5 }}>Ci aiutano a capire come viene usata la piattaforma (dati aggregati e anonimi).</p>
                </div>
                <button className={`te-gdpr-toggle ${prefs.analytics ? "on" : "off"}`}
                  onClick={() => setPrefs(p => ({ ...p, analytics: !p.analytics }))} />
              </div>

              {/* Marketing */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px", background:"#f5f5f6", borderRadius:"16px" }}>
                <div>
                  <p style={{ fontWeight:700, fontSize:"0.9rem", marginBottom:"4px" }}>Cookie di Marketing</p>
                  <p style={{ fontSize:"0.8rem", color:"#6b6b73", lineHeight:1.5 }}>Usati per mostrare contenuti rilevanti. Attualmente non utilizzati.</p>
                </div>
                <button className={`te-gdpr-toggle ${prefs.marketing ? "on" : "off"}`}
                  onClick={() => setPrefs(p => ({ ...p, marketing: !p.marketing }))} />
              </div>
            </div>

            <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
              <button className="te-gdpr-btn te-gdpr-btn-primary" onClick={savePreferences} style={{ flex:1 }}>Salva preferenze</button>
              <button className="te-gdpr-btn te-gdpr-btn-secondary" onClick={acceptAll} style={{ flex:1 }}>Accetta tutti</button>
            </div>

            <p style={{ fontSize:"0.75rem", color:"#9a9aa2", marginTop:"1rem", textAlign:"center" }}>
              <Link href="/privacy" style={{ color:"#ff5a00" }}>Privacy Policy</Link> · <Link href="/cookie-policy" style={{ color:"#ff5a00" }}>Cookie Policy</Link>
            </p>
          </div>
        </div>
      )}

      {/* Banner bottom */}
      {!showModal && (
        <div className="te-gdpr-banner">
          <div className="te-gdpr-banner-inner">
            <div style={{ flex:1, minWidth:280 }}>
              <p style={{ fontWeight:700, fontSize:"0.9rem", marginBottom:"4px" }}>🍪 Utilizziamo i cookie</p>
              <p style={{ fontSize:"0.8rem", color:"#6b6b73", lineHeight:1.5 }}>
                Usiamo cookie tecnici per il funzionamento della piattaforma e, previo consenso, cookie analitici.
                Leggi la nostra <Link href="/cookie-policy" style={{ color:"#ff5a00", fontWeight:600 }}>Cookie Policy</Link> e la <Link href="/privacy" style={{ color:"#ff5a00", fontWeight:600 }}>Privacy Policy</Link>.
              </p>
            </div>
            <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", flexShrink:0 }}>
              <button className="te-gdpr-btn te-gdpr-btn-outline" onClick={() => setShowModal(true)}>Personalizza</button>
              <button className="te-gdpr-btn te-gdpr-btn-secondary" onClick={acceptTechnicalOnly}>Solo necessari</button>
              <button className="te-gdpr-btn te-gdpr-btn-primary" onClick={acceptAll}>Accetta tutti</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}