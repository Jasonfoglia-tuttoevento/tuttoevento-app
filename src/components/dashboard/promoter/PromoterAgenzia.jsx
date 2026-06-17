"use client";
import PromoterReferral from "./PromoterReferral";
import { useState, useEffect, useMemo } from "react";
import VerifiedBadge from "@/components/VerifiedBadge";
import { Card, INK, Inp, KpiCard, MUTED, O, ProBadge, ProLock, SCard, STitle } from "./shared";
export default function PromoterAgenzia({ currentUser, portfolio, plan }) {
  const [agencyName, setAgencyName] = useState(currentUser?.name||"");
  const [bio, setBio]               = useState("");
  const [logo, setLogo]             = useState("");
  const [website, setWebsite]       = useState("");
  const [instagram, setInstagram]   = useState("");
  const [saveMsg, setSaveMsg]       = useState("");

  useEffect(() => {
    fetch("/api/promoter-agency")
      .then(r=>r.json())
      .then(d=>{
        if (!d) return;
        setAgencyName(d.agency_name||"");
        setBio(d.bio||"");
        setLogo(d.logo_url||"");
        setWebsite(d.website||"");
        setInstagram(d.instagram||"");
      }).catch(()=>{});
  },[]);

  async function save(e) {
    e.preventDefault();
    setSaveMsg("Salvataggio...");
    const res = await fetch("/api/promoter-agency",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ agency_name:agencyName, bio, logo_url:logo, website, instagram }),
    });
    setSaveMsg(res.ok?"✓ Salvato":"Errore salvataggio");
  }

  const portfolioArtists = portfolio.filter(p=>p.entity_type==="artist");
  const isPro = plan==="pro";

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* Sezione referral */}
      <PromoterReferral currentUser={currentUser} plan={plan} />

      {/* Preview pagina pubblica base */}
      <Card>
        <STitle>Pagina pubblica agenzia</STitle>
        <p style={{ fontSize:13, color:MUTED, marginBottom:16 }}>
          Questa pagina sarà visibile agli artisti e ai locali nel marketplace.
          {!isPro && <span style={{ color:O, fontWeight:700 }}> Con PRO sblocchi la versione brandizzata completa.</span>}
        </p>

        {/* Preview card */}
        <div style={{ border:"1px solid rgba(0,0,0,.08)", borderRadius:20, overflow:"hidden", marginBottom:16 }}>
          <div style={{ background:INK, padding:"24px", display:"flex", alignItems:"center", gap:16 }}>
            {logo ? (
              <img src={logo} alt="Logo" style={{ width:56, height:56, borderRadius:14, objectFit:"cover", border:"2px solid rgba(255,255,255,.1)" }} />
            ) : (
              <div style={{ width:56, height:56, borderRadius:14, background:O, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:20, color:"white" }}>
                {(agencyName||"A").charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:18, color:"white", margin:0 }}>{agencyName||"Nome agenzia"}</p>
              <p style={{ fontSize:12, color:"rgba(255,255,255,.45)", margin:"3px 0 0" }}>
                {portfolioArtists.length} artisti · Promoter
                {isPro && <VerifiedBadge size={16} style={{ marginLeft:8 }} />}
              </p>
            </div>
          </div>
          <div style={{ padding:"16px 20px", background:"#fbfaf8" }}>
            <p style={{ fontSize:13, color:MUTED, margin:0, lineHeight:1.6 }}>
              {bio||"Nessuna bio inserita."}
            </p>
            {portfolioArtists.length > 0 && (
              <div style={{ marginTop:12 }}>
                <p style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".1em", margin:"0 0 8px" }}>Artisti rappresentati</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {portfolioArtists.map(a => (
                    <span key={a.id} style={{ background:"white", border:"1px solid rgba(0,0,0,.1)", borderRadius:100, padding:"4px 12px", fontSize:12, fontWeight:600, color:INK }}>
                      {a.entity_name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Form base — visibile a tutti */}
      <Card>
        <STitle>Dati agenzia</STitle>
        <form onSubmit={save} style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Inp label="Nome agenzia *" value={agencyName} onChange={e=>setAgencyName(e.target.value)} placeholder="Es. Sound Management" />
            <Inp label="Logo (URL)" value={logo} onChange={e=>setLogo(e.target.value)} placeholder="https://..." disabled={!isPro} />
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".1em", fontFamily:"'Manrope',system-ui,sans-serif" }}>Bio</label>
            <textarea value={bio} onChange={e=>setBio(e.target.value)} rows={3}
              placeholder="Descrivi la tua agenzia e i servizi che offri..."
              style={{ background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)", borderRadius:12, padding:"10px 13px", fontSize:13, fontFamily:"'Manrope',system-ui,sans-serif", outline:"none", resize:"vertical" }} />
          </div>

          {/* Campi PRO */}
          <ProLock feature="I link pubblici e il sito web dell'agenzia" plan={plan}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Inp label="Sito web" value={website} onChange={e=>setWebsite(e.target.value)} placeholder="https://..." />
              <Inp label="Instagram" value={instagram} onChange={e=>setInstagram(e.target.value)} placeholder="@nomeagenzia" />
            </div>
          </ProLock>

          {saveMsg && <p style={{ fontSize:13, fontWeight:700, color:saveMsg.includes("✓")?"#16a34a":"#dc2626" }}>{saveMsg}</p>}
          <button type="submit" style={{ background:INK, color:"white", border:"none", borderRadius:100, padding:"12px 28px", fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif", alignSelf:"flex-start" }}>
            Salva
          </button>
        </form>
      </Card>

      {/* Badge verificato + upgrade — solo PRO */}
      {!isPro && (
        <div style={{ background:"rgba(255,90,0,.04)", border:"1px solid rgba(255,90,0,.15)", borderRadius:18, padding:"16px 20px", display:"flex", gap:14, alignItems:"flex-start" }}>
          <span style={{ fontSize:28 }}>⭐</span>
          <div>
            <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:15, color:INK, margin:"0 0 4px" }}>
              Agenzia verificata + pagina brandizzata <ProBadge />
            </p>
            <p style={{ fontSize:12, color:MUTED, margin:0, lineHeight:1.6 }}>
              Con il piano Pro ottieni il badge di agenzia verificata, logo personalizzato, link social pubblici e posizione prioritaria nel marketplace. I tuoi artisti vengono presentati come "gestiti da [nome agenzia]".
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════ */