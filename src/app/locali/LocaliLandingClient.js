"use client";

import { useEffect, useState, useRef } from "react";
import RegisterFormInline from "@/components/RegisterFormInline";

const ORANGE = "#ff5a00";

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.style.opacity = "1"; e.target.style.transform = "translateY(0) scale(1)"; io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function TiltCard({ children, style = {} }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: "50%", gy: "50%" });
  function onMove(e) {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setTilt({ rx: (py - .5) * -14, ry: (px - .5) * 16, gx: `${px * 100}%`, gy: `${py * 100}%` });
  }
  function onLeave() { setTilt({ rx: 0, ry: 0, gx: "50%", gy: "50%" }); }
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`, transition: "transform .3s cubic-bezier(.2,.7,.2,1)", transformStyle: "preserve-3d", position: "relative", ...style }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none", background: `radial-gradient(280px circle at ${tilt.gx} ${tilt.gy}, rgba(255,90,0,.12), transparent 60%)`, zIndex: 1 }} />
      {children}
    </div>
  );
}

const FAQS = [
  { q: "Quanto costa cercare artisti?", a: "La registrazione è gratuita. Puoi sfogliare il marketplace e inviare richieste di contatto senza alcun costo." },
  { q: "Come funziona il pricing degli artisti?", a: "I prezzi sono su richiesta — non visibili nel marketplace. Indica il tuo budget e il team TuttoEvento gestirà la trattativa in modo riservato." },
  { q: "Gli artisti sono verificati?", a: "Ogni artista viene approvato manualmente dal team TuttoEvento prima di apparire nel marketplace." },
  { q: "Posso gestire più eventi contemporaneamente?", a: "Sì. Dalla dashboard puoi monitorare richieste, pipeline trattative, eventi confermati e comunicazioni in un unico spazio." },
  { q: "Posso trovare artisti per eventi privati o aziendali?", a: "Sì. TuttoEvento è pensato per locali, ristoranti, hotel, beach club, wedding planner, aziende e privati." },
];

const PASSI = [
  { n:"01", icon:"🔍", title:"Sfoglia il marketplace", desc:"Filtra artisti per genere, città e budget. Solo profili verificati dal team." },
  { n:"02", icon:"📬", title:"Richiedi contatto riservato", desc:"Il team TuttoEvento gestisce la trattativa per te in totale riservatezza." },
  { n:"03", icon:"🎉", title:"Serata confermata", desc:"Chat, calendario e storico booking in un unico posto." },
];

export default function LandingLocali() {
  useReveal();
  const [budget, setBudget] = useState(300);
  const [openFaq, setOpenFaq] = useState(null);

  const FORMAT = [
    { min:100, max:300, label:"Aperitivo / piccolo evento", desc:"DJ set light, cantante solista o musicista acustico." },
    { min:300, max:700, label:"Serata locale / cena spettacolo", desc:"DJ, duo acustico, performer o live set strutturato." },
    { min:700, max:2000, label:"Evento premium", desc:"Band live, show completo, corporate event o grande format." },
  ];

  const rev = { opacity: 0, transform: "translateY(32px) scale(0.98)", transition: "opacity .75s cubic-bezier(.2,.7,.2,1), transform .75s cubic-bezier(.2,.7,.2,1)" };

  return (
    <>
      <style>{`
        @keyframes float { 0%,100%{transform:translate(-50%,0)} 50%{transform:translate(-50%,-28px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(18px,14px)} }
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        @keyframes shimmer { to{background-position:-200% 0} }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes orbit { from{transform:rotate(0deg) translateX(150px) rotate(0deg)} to{transform:rotate(360deg) translateX(150px) rotate(-360deg)} }
        @keyframes orbit2 { from{transform:rotate(120deg) translateX(210px) rotate(-120deg)} to{transform:rotate(480deg) translateX(210px) rotate(-480deg)} }
        @keyframes orbit3 { from{transform:rotate(240deg) translateX(175px) rotate(-240deg)} to{transform:rotate(600deg) translateX(175px) rotate(-600deg)} }
        * { box-sizing:border-box; }
        html,body { margin:0; padding:0; overflow-x:hidden; }
        .ll2-root { font-family:'Manrope',system-ui,sans-serif; background:#0a0a0b; color:white; min-height:100vh; overflow-x:hidden; }
        .ll2-shimmer { background:linear-gradient(100deg,#ff5a00 0%,#ff8a3d 38%,#ffc27d 50%,#ff8a3d 62%,#ff5a00 100%); background-size:200% 100%; -webkit-background-clip:text; background-clip:text; color:transparent; animation:shimmer 5s linear infinite; }
        .ll2-glass { background:rgba(255,255,255,.06); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,.1); }
        .ll2-card { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:24px; }
        .ll2-cta { background:#ff5a00; color:white; border:none; border-radius:100px; padding:15px 32px; font-weight:800; font-size:.95rem; cursor:pointer; font-family:'Manrope',system-ui,sans-serif; transition:all .2s; text-decoration:none; display:inline-block; }
        .ll2-cta:hover { background:#e85100; transform:scale(1.03); }
        .ll2-ghost { background:rgba(255,255,255,.07); color:white; border:1px solid rgba(255,255,255,.15); border-radius:100px; padding:15px 32px; font-weight:700; font-size:.95rem; cursor:pointer; font-family:'Manrope',system-ui,sans-serif; transition:all .2s; text-decoration:none; display:inline-block; }
        .ll2-ghost:hover { background:rgba(255,255,255,.13); }
        @media(max-width:768px) { .ll2-hero-grid{grid-template-columns:1fr!important} .ll2-feat-grid{grid-template-columns:1fr!important} .ll2-orbit{display:none!important} .ll2-steps{grid-template-columns:1fr!important} }

        @media(max-width:768px) {
          .ll2-nav-links { display:none; }
          .ll2-footer-grid { grid-template-columns:1fr!important; gap:24px!important; }
          .ll2-hero-grid { grid-template-columns:1fr!important; gap:32px!important; }
          .ll2-feat-grid { grid-template-columns:1fr!important; }
          .ll2-kpi-grid { grid-template-columns:1fr 1fr!important; }
        }
        @media(max-width:480px) {
          .ll2-kpi-grid { grid-template-columns:1fr!important; }
        }
            @media(max-width:480px) { .ll2-kpi-grid{grid-template-columns:1fr 1fr!important} }

        /* Nav mobile */
        .ll2-nav-center { display:flex; gap:24px; align-items:center; }
        .ll2-nav-login { display:flex; gap:8px; }
        /* Footer */
        .ll2-footer-grid { display:grid; }
        
        @media(max-width:900px) {
          .ll2-nav-center { display:none; }
        }
        @media(max-width:768px) {
          .ll2-hero-grid { grid-template-columns:1fr!important; gap:32px!important; }
          .ll2-feat-grid { grid-template-columns:1fr!important; }
          .ll2-steps { grid-template-columns:1fr!important; }
          .ll2-kpi-grid { grid-template-columns:1fr 1fr; gap:10px; }
          .ll2-footer-grid { grid-template-columns:1fr!important; gap:20px!important; }
          .ll2-orbit { display:none!important; }
        }
        @media(max-width:480px) {
          .ll2-kpi-grid { grid-template-columns:1fr!important; }
        }
    
      `}</style>

      <div className="ll2-root">

        {/* NAVBAR */}
        <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, padding:"12px 16px" }}>
          <div className="ll2-glass" style={{ maxWidth:1100, margin:"0 auto", borderRadius:100, padding:"0 20px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <a href="/" style={{ fontFamily:"Sora,sans-serif", fontWeight:900, fontSize:"1.1rem", letterSpacing:"-.04em", textDecoration:"none", color:"white" }}>
              TUTTO<span style={{ color:ORANGE }}>EVENTO</span>
            </a>
            <div style={{ display:"flex", gap:24, alignItems:"center" }} className="ll2-nav-center">
              {[["#vantaggi","Vantaggi"],["#come-funziona","Come funziona"],["#budget","Budget"],["#faq","FAQ"]].map(([h,l]) => (
                <a key={h} href={h} style={{ fontSize:".875rem", fontWeight:600, color:"rgba(255,255,255,.6)", textDecoration:"none" }}>{l}</a>
              ))}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <a href="/login" style={{ fontSize:".875rem", fontWeight:700, color:"rgba(255,255,255,.7)", textDecoration:"none", padding:"7px 14px" }}>Accedi</a>
              <a href="#registrati" className="ll2-cta" style={{ padding:"8px 18px", fontSize:".85rem" }}>Trova artisti</a>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", overflow:"hidden", paddingTop:80 }}>
          <div aria-hidden style={{ position:"absolute", top:-120, left:"50%", width:800, height:800, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,90,0,.28),rgba(255,130,70,.1) 50%,transparent 72%)", filter:"blur(120px)", animation:"float 9s ease-in-out infinite", pointerEvents:"none" }} />
          <div aria-hidden style={{ position:"absolute", top:200, right:-150, width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,185,138,.2),transparent 70%)", filter:"blur(100px)", animation:"float2 12s ease-in-out infinite", pointerEvents:"none" }} />

          {/* Orbite */}
          <div className="ll2-orbit" style={{ position:"absolute", top:"50%", left:"62%", transform:"translate(-50%,-50%)", width:480, height:480, pointerEvents:"none", opacity:.55 }}>
            <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"1px dashed rgba(255,90,0,.2)" }} />
            <div style={{ position:"absolute", inset:40, borderRadius:"50%", border:"1px dashed rgba(255,255,255,.08)" }} />
            <div style={{ position:"absolute", inset:80, borderRadius:"50%", border:"1px dashed rgba(255,90,0,.1)" }} />
            {[
              { style:{ animation:"orbit 8s linear infinite" }, bg:"#ff5a00", label:"🏛️", size:38 },
              { style:{ animation:"orbit2 12s linear infinite" }, bg:"rgba(255,255,255,.1)", label:"🎧", size:34 },
              { style:{ animation:"orbit3 10s linear infinite" }, bg:"rgba(255,90,0,.3)", label:"📋", size:30 },
            ].map((o,i) => (
              <div key={i} style={{ position:"absolute", top:"50%", left:"50%", marginTop:-o.size/2, marginLeft:-o.size/2, ...o.style }}>
                <div style={{ width:o.size, height:o.size, borderRadius:"50%", background:o.bg, border:"1px solid rgba(255,255,255,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:o.size*.45 }}>{o.label}</div>
              </div>
            ))}
          </div>

          <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 20px", display:"grid", gridTemplateColumns:"1fr 420px", gap:60, alignItems:"center", position:"relative", zIndex:1, width:"100%" }} className="ll2-hero-grid">
            <div>
              <div data-reveal style={{ ...rev, display:"inline-flex", alignItems:"center", gap:8, borderRadius:100, padding:"6px 16px", marginBottom:28, background:"rgba(255,90,0,.12)", border:"1px solid rgba(255,90,0,.25)" }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:ORANGE, animation:"pulse 2s infinite", display:"inline-block" }} />
                <span style={{ fontSize:".72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".12em", color:"rgba(255,255,255,.8)" }}>Per locali e organizzatori · 2026</span>
              </div>
              <h1 data-reveal style={{ ...rev, fontFamily:"Sora,sans-serif", fontSize:"clamp(2.6rem,5.5vw,4.2rem)", fontWeight:900, lineHeight:1.0, letterSpacing:"-3px", margin:"0 0 24px", transitionDelay:".08s" }}>
                Riempi il tuo locale.<br/>Trova l'artista giusto<br/><span className="ll2-shimmer">in pochi click.</span>
              </h1>
              <p data-reveal style={{ ...rev, fontSize:"clamp(.95rem,2vw,1.15rem)", color:"rgba(255,255,255,.6)", lineHeight:1.7, marginBottom:36, maxWidth:540, transitionDelay:".16s" }}>
                Trova DJ, band, cantanti e performer per serate ed eventi. Gestisci richieste, chat e booking da un'unica dashboard — <strong style={{ color:"white" }}>il tuo CRM per gli eventi.</strong>
              </p>
              <div data-reveal style={{ ...rev, display:"flex", gap:12, flexWrap:"wrap", marginBottom:36, transitionDelay:".24s" }}>
                <a href="#registrati" className="ll2-cta" style={{ fontSize:"1rem", padding:"16px 34px" }}>Registra il locale gratis →</a>
                <a href="#come-funziona" className="ll2-ghost" style={{ fontSize:"1rem", padding:"16px 28px" }}>Come funziona</a>
              </div>
              <div data-reveal style={{ ...rev, display:"flex", gap:20, flexWrap:"wrap", transitionDelay:".32s" }}>
                {["Artisti verificati","Prezzi su richiesta","Risposta in 48h","🇮🇹 Made in Italy"].map(t => (
                  <span key={t} style={{ fontSize:".78rem", fontWeight:600, color:"rgba(255,255,255,.45)", display:"flex", alignItems:"center", gap:4 }}>✓ {t}</span>
                ))}
              </div>
            </div>

            {/* Form registrazione */}
            <div data-reveal style={{ ...rev, transitionDelay:".2s" }} id="registrati">
              <div className="ll2-glass" style={{ borderRadius:28, padding:"32px 28px" }}>
                <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".16em", color:ORANGE, marginBottom:6 }}>Inizia subito · Gratis</p>
                <h2 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1.3rem", letterSpacing:"-.03em", color:"white", margin:"0 0 20px" }}>Registra il tuo locale</h2>
                <RegisterFormInline role="organizer" dark={true} />
              </div>
            </div>
          </div>
        </section>

        {/* TICKER */}
        <section style={{ background:"rgba(255,255,255,.03)", borderTop:"1px solid rgba(255,255,255,.06)", borderBottom:"1px solid rgba(255,255,255,.06)", padding:"16px 0", overflow:"hidden" }}>
          <div style={{ display:"flex", whiteSpace:"nowrap", animation:"marquee 26s linear infinite" }}>
            {["Ristoranti","Beach Club","Hotel","Rooftop Bar","Discoteche","Wedding Planner","Aziende","Festival","Locali Live","Ristoranti","Beach Club","Hotel","Rooftop Bar","Discoteche","Wedding Planner","Aziende","Festival","Locali Live"].map((item,i) => (
              <span key={i} style={{ margin:"0 24px", color:"rgba(255,255,255,.3)", fontSize:".8rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".16em" }}>{item}</span>
            ))}
          </div>
        </section>

        {/* KPI */}
        <section style={{ padding:"80px 20px" }}>
          <div style={{ maxWidth:1000, margin:"0 auto" }}>
            <div className="ll2-kpi-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
              {[["100+","artisti verificati","pronti a suonare"],["48h","risposta garantita","dal team TuttoEvento"],["0€","per iniziare","nessuna carta richiesta"],["∞","richieste/mese","nessun limite"]].map(([val,label,sub],i) => (
                <div key={i} data-reveal style={{ ...rev, transitionDelay:`${i*.07}s` }}>
                  <TiltCard style={{ borderRadius:22, height:"100%" }}>
                    <div className="ll2-card" style={{ padding:"24px 20px", height:"100%", position:"relative", zIndex:2 }}>
                      <p style={{ fontFamily:"Sora,sans-serif", fontWeight:900, fontSize:"2rem", letterSpacing:"-2px", color:i===0?ORANGE:"white", margin:"0 0 6px" }}>{val}</p>
                      <p style={{ fontWeight:700, fontSize:".875rem", color:"white", margin:"0 0 4px" }}>{label}</p>
                      <p style={{ fontSize:".78rem", color:"rgba(255,255,255,.4)", margin:0 }}>{sub}</p>
                    </div>
                  </TiltCard>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VANTAGGI */}
        <section id="vantaggi" style={{ padding:"80px 20px", background:"rgba(255,255,255,.02)", borderTop:"1px solid rgba(255,255,255,.05)" }}>
          <div style={{ maxWidth:1100, margin:"0 auto" }}>
            <div data-reveal style={{ ...rev, textAlign:"center", marginBottom:56 }}>
              <p style={{ fontSize:".72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".18em", color:ORANGE, marginBottom:10 }}>Pensato per chi organizza eventi</p>
              <h2 style={{ fontFamily:"Sora,sans-serif", fontSize:"clamp(1.8rem,4vw,2.8rem)", fontWeight:900, letterSpacing:"-.04em", lineHeight:1.1, margin:0 }}>Meno telefonate, più serate riuscite.</h2>
            </div>
            <div className="ll2-feat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18 }}>
              {[
                { icon:"🎧", title:"Artisti per ogni format", desc:"DJ, band, cantanti, performer e animatori per ogni tipo di pubblico e serata.", delay:".05s" },
                { icon:"📍", title:"Ricerca geolocalizzata", desc:"Trova talenti disponibili nella tua zona, riducendo tempi e costi di trasferta.", delay:".1s" },
                { icon:"💬", title:"CRM integrato", desc:"Pipeline trattative, chat col team TuttoEvento, storico booking e analitiche.", delay:".15s" },
                { icon:"🔒", title:"Prezzi riservati", desc:"Il budget è trattato in modo riservato. I locali non vedono mai il cachet netto dell'artista.", delay:".2s" },
                { icon:"⚡", title:"Risposta in 48h", desc:"Il team TuttoEvento coordina ogni trattativa. Nessuna richiesta rimane senza risposta.", delay:".25s" },
                { icon:"📊", title:"Analytics serate", desc:"Analitiche avanzate, benchmark di zona e storico completo dei booking.", delay:".3s" },
              ].map(f => (
                <div key={f.title} data-reveal style={{ ...rev, transitionDelay:f.delay }}>
                  <TiltCard style={{ borderRadius:22, height:"100%" }}>
                    <div className="ll2-card" style={{ padding:"26px 22px", height:"100%", position:"relative", zIndex:2, transition:"border-color .2s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,90,0,.3)"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"}>
                      <div style={{ fontSize:"1.6rem", marginBottom:14 }}>{f.icon}</div>
                      <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1rem", color:"white", margin:"0 0 8px" }}>{f.title}</h3>
                      <p style={{ fontSize:".875rem", color:"rgba(255,255,255,.5)", lineHeight:1.6, margin:0 }}>{f.desc}</p>
                    </div>
                  </TiltCard>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COME FUNZIONA */}
        <section id="come-funziona" style={{ padding:"80px 20px" }}>
          <div style={{ maxWidth:1000, margin:"0 auto" }}>
            <div data-reveal style={{ ...rev, textAlign:"center", marginBottom:56 }}>
              <p style={{ fontSize:".72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".18em", color:ORANGE, marginBottom:10 }}>Processo semplice</p>
              <h2 style={{ fontFamily:"Sora,sans-serif", fontSize:"clamp(1.8rem,4vw,2.6rem)", fontWeight:900, letterSpacing:"-.04em", lineHeight:1.1, margin:0 }}>Dal bisogno alla serata confermata.</h2>
            </div>
            <div className="ll2-steps" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, position:"relative" }}>
              <div style={{ position:"absolute", top:32, left:"16%", right:"16%", height:1, background:"linear-gradient(90deg,transparent,rgba(255,90,0,.4),transparent)", pointerEvents:"none" }} />
              {PASSI.map((p,i) => (
                <div key={p.n} data-reveal style={{ ...rev, transitionDelay:`${i*.1}s`, textAlign:"center", padding:"24px 16px" }}>
                  <div style={{ width:60, height:60, borderRadius:"50%", background:i===0?ORANGE:"rgba(255,255,255,.06)", border:`2px solid ${i===0?ORANGE:"rgba(255,255,255,.12)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem", margin:"0 auto 14px", position:"relative", zIndex:1 }}>
                    {p.icon}
                  </div>
                  <p style={{ fontFamily:"Sora,sans-serif", fontSize:".7rem", fontWeight:700, color:ORANGE, letterSpacing:".1em", margin:"0 0 6px" }}>{p.n}</p>
                  <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1rem", color:"white", margin:"0 0 8px" }}>{p.title}</h3>
                  <p style={{ fontSize:".8rem", color:"rgba(255,255,255,.45)", lineHeight:1.6, margin:0 }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BUDGET */}
        <section id="budget" style={{ padding:"80px 20px", background:"rgba(255,255,255,.02)", borderTop:"1px solid rgba(255,255,255,.05)" }}>
          <div style={{ maxWidth:1000, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, alignItems:"center" }} className="ll2-hero-grid">
            <div data-reveal style={rev}>
              <p style={{ fontSize:".72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".18em", color:ORANGE, marginBottom:10 }}>Simula il budget della serata</p>
              <h2 style={{ fontFamily:"Sora,sans-serif", fontSize:"clamp(1.8rem,4vw,2.6rem)", fontWeight:900, letterSpacing:"-.04em", lineHeight:1.1, margin:"0 0 16px" }}>
                Parti dal budget e trova<br/><span className="ll2-shimmer">il talento giusto.</span>
              </h2>
              <p style={{ fontSize:"1rem", color:"rgba(255,255,255,.55)", lineHeight:1.7 }}>Imposta un budget indicativo e valuta quale format è più adatto alla tua serata.</p>
            </div>
            <div data-reveal style={{ ...rev, transitionDelay:".15s" }}>
              <div className="ll2-glass" style={{ borderRadius:24, padding:"28px 24px" }}>
                <div style={{ marginBottom:20 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <label style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,.6)" }}>Budget indicativo</label>
                    <span style={{ fontFamily:"Sora,sans-serif", fontWeight:800, color:ORANGE }}>€{budget}</span>
                  </div>
                  <input type="range" min="100" max="2000" step="50" value={budget} onChange={e => setBudget(Number(e.target.value))}
                    style={{ width:"100%", accentColor:ORANGE, height:6, cursor:"pointer" }} />
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"rgba(255,255,255,.35)", fontWeight:600, marginTop:6 }}>
                    <span>€100</span><span>€1000</span><span>€2000+</span>
                  </div>
                </div>
                <div style={{ borderTop:"1px solid rgba(255,255,255,.08)", paddingTop:18 }}>
                  <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".1em", color:"rgba(255,255,255,.4)", marginBottom:12 }}>Format consigliati</p>
                  {FORMAT.map(f => {
                    const active = budget >= f.min && budget <= f.max;
                    return (
                      <div key={f.label} style={{ padding:"12px 14px", borderRadius:14, marginBottom:10, border:`1px solid ${active?ORANGE:"rgba(255,255,255,.08)"}`, background:active?"rgba(255,90,0,.1)":"rgba(255,255,255,.04)", transition:"all .2s" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                          <p style={{ fontWeight:700, fontSize:".875rem", color:"white", margin:0 }}>{f.label}</p>
                          {active && <span style={{ fontSize:10, fontWeight:700, color:"white", background:ORANGE, padding:"2px 8px", borderRadius:100 }}>consigliato</span>}
                        </div>
                        <p style={{ fontSize:".78rem", color:"rgba(255,255,255,.5)", margin:0 }}>{f.desc}</p>
                      </div>
                    );
                  })}
                </div>
                <a href="#registrati" className="ll2-cta" style={{ display:"block", textAlign:"center", width:"100%", marginTop:16 }}>
                  Inizia ora →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" style={{ padding:"80px 20px" }}>
          <div style={{ maxWidth:760, margin:"0 auto" }}>
            <div data-reveal style={{ ...rev, textAlign:"center", marginBottom:48 }}>
              <p style={{ fontSize:".72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".18em", color:ORANGE, marginBottom:10 }}>Hai domande?</p>
              <h2 style={{ fontFamily:"Sora,sans-serif", fontSize:"clamp(1.8rem,4vw,2.4rem)", fontWeight:900, letterSpacing:"-.04em", margin:0 }}>Domande frequenti</h2>
            </div>
            <div data-reveal style={rev}>
              {FAQS.map((f, i) => (
                <div key={i} style={{ border:"1px solid rgba(255,255,255,.08)", borderRadius:18, marginBottom:10, overflow:"hidden", background:"rgba(255,255,255,.03)" }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 20px", background:"none", border:"none", cursor:"pointer", textAlign:"left", fontFamily:"Manrope,system-ui,sans-serif", fontWeight:700, fontSize:"1rem", color:"white", gap:12 }}>
                    <span>{f.q}</span>
                    <span style={{ transition:"transform .3s", transform: openFaq === i ? "rotate(180deg)" : "none", color:"rgba(255,255,255,.4)", flexShrink:0 }}>▼</span>
                  </button>
                  {openFaq === i && (
                    <div style={{ padding:"0 20px 18px", borderTop:"1px solid rgba(255,255,255,.07)" }}>
                      <p style={{ fontSize:".9rem", color:"rgba(255,255,255,.55)", lineHeight:1.7, paddingTop:14, margin:0 }}>{f.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINALE */}
        <section style={{ padding:"20px 20px 60px" }}>
          <div data-reveal style={{ ...rev, maxWidth:1000, margin:"0 auto", position:"relative", borderRadius:32, overflow:"hidden", padding:"80px 40px", textAlign:"center", background:"rgba(255,90,0,.06)", border:"1px solid rgba(255,90,0,.2)" }}>
            <div aria-hidden style={{ position:"absolute", top:-100, left:"50%", transform:"translateX(-50%)", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,90,0,.3),transparent 70%)", filter:"blur(80px)", animation:"float 8s ease-in-out infinite" }} />
            <div style={{ position:"relative", zIndex:1 }}>
              <h2 style={{ fontFamily:"Sora,sans-serif", fontSize:"clamp(2rem,5vw,3rem)", fontWeight:900, letterSpacing:"-.04em", lineHeight:1.05, margin:"0 0 16px" }}>
                La prossima serata può essere<br/><span className="ll2-shimmer">più semplice da organizzare.</span>
              </h2>
              <p style={{ fontSize:"1rem", color:"rgba(255,255,255,.55)", maxWidth:460, margin:"0 auto 36px", lineHeight:1.7 }}>
                Registra il locale, pubblica una richiesta gratuita e trova artisti disponibili oggi.
              </p>
              <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
                <a href="#registrati" className="ll2-cta" style={{ fontSize:"1rem", padding:"16px 36px" }}>Registra il locale gratis →</a>
                <a href="/login" className="ll2-ghost" style={{ fontSize:"1rem", padding:"16px 28px" }}>Accedi</a>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background:"rgba(255,255,255,.03)", borderTop:"1px solid rgba(255,255,255,.06)", padding:"40px 20px 24px" }}>
          <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:40, marginBottom:32 }} className="ll2-footer-grid" style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:40, marginBottom:32 }}>
            <div>
              <span style={{ fontFamily:"Sora,sans-serif", fontWeight:900, fontSize:"1.1rem", letterSpacing:"-.04em" }}>TUTTO<span style={{ color:ORANGE }}>EVENTO</span></span>
              <p style={{ fontSize:".875rem", color:"rgba(255,255,255,.4)", lineHeight:1.7, marginTop:10, maxWidth:280 }}>La piattaforma italiana per artisti, locali e promoter.</p>
            </div>
            <div>
              <p style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:".85rem", marginBottom:12 }}>Sezioni</p>
              {[["#vantaggi","Vantaggi"],["#come-funziona","Come funziona"],["#budget","Budget"],["#faq","FAQ"]].map(([h,l]) => (
                <a key={h} href={h} style={{ display:"block", color:"rgba(255,255,255,.4)", fontSize:".875rem", textDecoration:"none", marginBottom:8 }}>{l}</a>
              ))}
            </div>
            <div>
              <p style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:".85rem", marginBottom:12 }}>Link utili</p>
              {[["/","Home"],["/login","Accedi"],["/landing-artisti","Per artisti"],["/landing-promoter","Per promoter"]].map(([h,l]) => (
                <a key={h} href={h} style={{ display:"block", color:"rgba(255,255,255,.4)", fontSize:".875rem", textDecoration:"none", marginBottom:8 }}>{l}</a>
              ))}
            </div>
          </div>
          <div style={{ borderTop:"1px solid rgba(255,255,255,.06)", paddingTop:20, textAlign:"center", fontSize:".78rem", color:"rgba(255,255,255,.25)" }}>
            © 2026 TuttoEvento. Tutti i diritti riservati.
          </div>
        </footer>
      </div>
    </>
  );
}