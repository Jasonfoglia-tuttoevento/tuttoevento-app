"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ORANGE = "#ff5a00";
const INK    = "#0a0a0b";
const MUTED  = "#6b6b73";

const PLANS = {
  artist: {
    name: "Artista",
    free: { price: "0€", label: "Free" },
    pro:  { price: "9€/mese", label: "Pro" },
    features: [
      { label: "Profilo nel marketplace",              free: true,  pro: true  },
      { label: "Ricevi richieste di booking",          free: true,  pro: true  },
      { label: "Chat con il team TuttoEvento",         free: true,  pro: true  },
      { label: "Calendario booking",                   free: true,  pro: true  },
      { label: "Notifiche push",                       free: true,  pro: true  },
      { label: "Estratto conto base",                  free: true,  pro: true  },
      { label: "Analitiche avanzate profilo",          free: false, pro: true  },
      { label: "Priorità nei risultati di ricerca",    free: false, pro: true  },
      { label: "Badge verificato nel marketplace",     free: false, pro: true  },
      { label: "Export iCal calendario",               free: false, pro: true  },
      { label: "Prezzi dinamici per tipo evento",      free: false, pro: true  },
      { label: "Supporto prioritario",                 free: false, pro: true  },
    ],
  },
  organizer: {
    name: "Locale",
    free: { price: "0€", label: "Free" },
    pro:  { price: "19,90€/mese", label: "Pro" },
    features: [
      { label: "Accesso al marketplace artisti",       free: true,  pro: true  },
      { label: "Richieste di contatto illimitate",     free: true,  pro: true  },
      { label: "Chat con il team TuttoEvento",         free: true,  pro: true  },
      { label: "Gestione booking base",                free: true,  pro: true  },
      { label: "Storico booking",                      free: true,  pro: true  },
      { label: "Filtri avanzati marketplace",          free: false, pro: true  },
      { label: "AI matching artisti",                  free: false, pro: true  },
      { label: "CRM con note e rating artisti",        free: false, pro: true  },
      { label: "Analitiche avanzate serate",           free: false, pro: true  },
      { label: "Benchmark budget zona",                free: false, pro: true  },
      { label: "Export CSV storico booking",           free: false, pro: true  },
      { label: "Multi-utente staff (fino a 5)",        free: false, pro: true  },
      { label: "Badge locale verificato",              free: false, pro: true  },
      { label: "Supporto prioritario",                 free: false, pro: true  },
    ],
  },
  promoter: {
    name: "Promoter",
    free: { price: "0€", label: "Free" },
    pro:  { price: "19,90€/mese", label: "Pro" },
    features: [
      { label: "Codice referral personale",            free: true,  pro: true  },
      { label: "Roster artisti (fino a 3)",            free: true,  pro: false },
      { label: "Roster artisti illimitato",            free: false, pro: true  },
      { label: "Trattative attive",                    free: true,  pro: true  },
      { label: "Commissioni automatiche (50% margine)", free: true, pro: true  },
      { label: "Estratto conto commissioni",           free: true,  pro: true  },
      { label: "Pagina pubblica agenzia",              free: false, pro: true  },
      { label: "Commissione personalizzabile per artista", free: false, pro: true },
      { label: "Analitiche roster avanzate",           free: false, pro: true  },
      { label: "Export CSV commissioni",               free: false, pro: true  },
      { label: "Supporto prioritario",                 free: false, pro: true  },
    ],
  },
};

function CheckIcon({ ok }) {
  if (ok) return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

export default function PricingPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState("artist");
  const [currentPlan, setCurrentPlan] = useState("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(d => {
      if (d?.role) setUserRole(d.role);
      if (d?.plan) setCurrentPlan(d.plan);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const plan = PLANS[userRole] || PLANS.artist;

  return (
    <>
      <style>{`
        * { box-sizing:border-box; }
        body { margin:0; }
        .pr-root { min-height:100vh; background:#f5f5f6; font-family:'Manrope',system-ui,sans-serif; padding:0 0 60px; }
        .pr-header { background:#0a0a0b; padding:20px 24px; display:flex; align-items:center; justify-content:space-between; }
        .pr-logo { font-family:'Sora',sans-serif; font-weight:900; font-size:1.1rem; letter-spacing:-.04em; color:white; text-decoration:none; }
        .pr-logo span { color:#ff5a00; }
        .pr-back { color:rgba(255,255,255,.5); font-size:.875rem; font-weight:600; text-decoration:none; display:flex; align-items:center; gap:6px; transition:color .15s; }
        .pr-back:hover { color:white; }
        .pr-hero { text-align:center; padding:60px 20px 40px; }
        .pr-hero h1 { font-family:'Sora',sans-serif; font-weight:900; font-size:clamp(2rem,5vw,3rem); letter-spacing:-.04em; color:#0a0a0b; margin:0 0 12px; line-height:1.05; }
        .pr-hero p { font-size:1rem; color:#6b6b73; max-width:480px; margin:0 auto; line-height:1.7; }
        .pr-cards { display:grid; grid-template-columns:1fr 1fr; gap:20px; max-width:860px; margin:0 auto; padding:0 20px; }
        .pr-card { background:white; border-radius:24px; overflow:hidden; border:1px solid rgba(0,0,0,.08); }
        .pr-card.pro { border-color:#ff5a00; box-shadow:0 8px 40px rgba(255,90,0,.15); }
        .pr-card-head { padding:28px 28px 24px; }
        .pr-card-head.pro { background:linear-gradient(135deg,#0a0a0b,#1a1a1b); }
        .pr-badge { display:inline-block; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.1em; padding:3px 10px; border-radius:100px; margin-bottom:14px; }
        .pr-price { font-family:'Sora',sans-serif; font-weight:900; letter-spacing:-.04em; line-height:1; margin:0 0 6px; }
        .pr-desc { font-size:.875rem; line-height:1.6; }
        .pr-features { padding:0 28px 28px; display:flex; flex-direction:column; gap:0; }
        .pr-feat { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid rgba(0,0,0,.05); font-size:.875rem; font-weight:600; }
        .pr-feat:last-child { border-bottom:none; }
        .pr-cta { display:block; text-align:center; margin:0 28px 28px; padding:13px; border-radius:14px; font-weight:800; font-size:.95rem; text-decoration:none; transition:all .2s; cursor:pointer; border:none; font-family:'Manrope',system-ui,sans-serif; }
        @media(max-width:640px) { .pr-cards { grid-template-columns:1fr; } }
      `}</style>

      <div className="pr-root">
        <header className="pr-header">
          <a href="/" className="pr-logo">TUTTO<span>EVENTO</span></a>
          <a href="/dashboard" className="pr-back">← Torna alla dashboard</a>
        </header>

        <div className="pr-hero">
          <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".16em", color:ORANGE, marginBottom:10 }}>
            Piani TuttoEvento
          </p>
          <h1>Semplice e trasparente.</h1>
          <p>Inizia gratis, passa a Pro quando sei pronto. Nessun vincolo, nessuna sorpresa.</p>
        </div>

        {!loading && (
          <div className="pr-cards">

            {/* FREE */}
            <div className="pr-card">
              <div className="pr-card-head">
                <div className="pr-badge" style={{ background:"rgba(0,0,0,.06)", color:MUTED }}>Free</div>
                <p className="pr-price" style={{ fontSize:"2.8rem", color:INK }}>0€</p>
                <p style={{ fontSize:".8rem", color:MUTED, margin:"4px 0 12px", fontWeight:600 }}>per sempre</p>
                <p className="pr-desc" style={{ color:MUTED }}>
                  Tutto il necessario per iniziare su TuttoEvento senza spendere nulla.
                </p>
              </div>
              <div className="pr-features">
                {plan.features.map(f => (
                  <div key={f.label} className="pr-feat" style={{ color: f.free ? INK : "rgba(0,0,0,.25)" }}>
                    <CheckIcon ok={f.free} />
                    <span>{f.label}</span>
                  </div>
                ))}
              </div>
              {currentPlan === "free" ? (
                <div className="pr-cta" style={{ background:"rgba(0,0,0,.05)", color:MUTED, cursor:"default" }}>
                  Piano attivo
                </div>
              ) : (
                <a href="/dashboard" className="pr-cta" style={{ background:"rgba(0,0,0,.07)", color:INK }}>
                  Torna al Free
                </a>
              )}
            </div>

            {/* PRO */}
            <div className="pr-card pro">
              <div className="pr-card-head pro">
                <div className="pr-badge" style={{ background:ORANGE, color:"white" }}>
                  Pro — Consigliato
                </div>
                <p className="pr-price" style={{ fontSize:"2.8rem", color:"white" }}>
                  {userRole === "artist" ? "9€" : "19,90€"}
                </p>
                <p style={{ fontSize:".8rem", color:"rgba(255,255,255,.4)", margin:"4px 0 12px", fontWeight:600 }}>
                  al mese · annullabile quando vuoi
                </p>
                <p className="pr-desc" style={{ color:"rgba(255,255,255,.55)" }}>
                  Funzionalità avanzate per chi vuole massimizzare i risultati sulla piattaforma.
                </p>
              </div>
              <div className="pr-features">
                {plan.features.map(f => (
                  <div key={f.label} className="pr-feat" style={{ color: f.pro ? INK : "rgba(0,0,0,.25)" }}>
                    <CheckIcon ok={f.pro} />
                    <span style={{ fontWeight: f.pro && !f.free ? 700 : 600 }}>{f.label}</span>
                    {f.pro && !f.free && (
                      <span style={{ marginLeft:"auto", fontSize:10, fontWeight:700, color:ORANGE, background:"rgba(255,90,0,.08)", padding:"2px 7px", borderRadius:100, whiteSpace:"nowrap" }}>Solo Pro</span>
                    )}
                  </div>
                ))}
              </div>
              {currentPlan === "pro" ? (
                <div className="pr-cta" style={{ background:"rgba(22,163,74,.1)", color:"#16a34a", cursor:"default" }}>
                  ✓ Piano attivo
                </div>
              ) : (
                <div className="pr-cta" style={{ background:ORANGE, color:"white" }}>
                  Disponibile a breve
                </div>
              )}
            </div>
          </div>
        )}

        {/* FAQ */}
        <div style={{ maxWidth:860, margin:"40px auto 0", padding:"0 20px" }}>
          <div style={{ background:"white", borderRadius:20, padding:"24px 28px", border:"1px solid rgba(0,0,0,.06)" }}>
            <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:16, color:INK, margin:"0 0 16px" }}>Domande frequenti</h3>
            {[
              ["Posso cancellare in qualsiasi momento?", "Sì — nessun vincolo. Puoi cancellare il piano Pro in qualsiasi momento dalla tua area impostazioni."],
              ["Il piano Free è davvero gratuito per sempre?", "Sì. Le funzionalità base rimangono gratuite senza limiti di tempo."],
              ["Come funziona il passaggio a Pro?", "Il pagamento sarà gestito tramite carta di credito o bonifico. Ti contatteremo quando il Pro sarà disponibile."],
              ["Le commissioni cambiano con il piano Pro?", "No — le commissioni TuttoEvento sono le stesse per tutti i piani. Il Pro aggiunge funzionalità, non cambia il modello economico."],
            ].map(([q, a]) => (
              <div key={q} style={{ borderBottom:"1px solid rgba(0,0,0,.06)", padding:"14px 0" }}>
                <p style={{ fontWeight:700, fontSize:14, color:INK, margin:"0 0 6px" }}>{q}</p>
                <p style={{ fontSize:13, color:MUTED, margin:0, lineHeight:1.6 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}