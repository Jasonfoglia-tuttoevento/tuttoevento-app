"use client";

import { useEffect, useState, useRef } from "react";
import LandingNav from "@/components/LandingNav";
import RegisterFormInline from "@/components/RegisterFormInline";

const ORANGE = "#ff5a00";
const INK = "#0a0a0b";
const MUTED = "#6b6b73";

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = "1";
          e.target.style.transform = "translateY(0) scale(1)";
          io.unobserve(e.target);
        }
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
  { q: "Quanto costa iscriversi?", a: "L'iscrizione è gratuita al 100%. TuttoEvento non trattiene commissioni dal tuo cachet: ricevi il compenso netto concordato, senza percentuali o trattenute." },
  { q: "Come funzionano le richieste di booking?", a: "I locali ti scoprono nel marketplace, inviano una richiesta di contatto. Il team TuttoEvento gestisce la trattativa e ti avvisa via notifica push." },
  { q: "Posso iscrivermi senza partita IVA?", a: "Certamente. Supportiamo sia professionisti con P.IVA sia artisti emergenti in regime di prestazione occasionale. Il nostro team è a disposizione per assisterti." },
  { q: "Quali generi e categorie artistiche sono ammessi?", a: "DJ, band live, cantanti, duo acustici, musicisti strumentali, performer, illusionisti, animatori e molto altro." },
  { q: "Come fanno i locali a trovarmi?", a: "Filtrano il marketplace per città, genere musicale e budget. Più completo è il tuo profilo, più appari in cima ai risultati." },
];

export default function LandingArtisti() {
  useReveal();
  const [cachet, setCachet] = useState(150);
  const [openFaq, setOpenFaq] = useState(null);

  const rev = { opacity: 0, transform: "translateY(32px) scale(0.98)", transition: "opacity .75s cubic-bezier(.2,.7,.2,1), transform .75s cubic-bezier(.2,.7,.2,1)" };

  return (
    <>
      <style>{`
        @keyframes float { 0%,100%{transform:translate(-50%,0)} 50%{transform:translate(-50%,-28px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(14px,14px)} }
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        @keyframes shimmer { to{background-position:-200% 0} }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes orbit { from{transform:rotate(0deg) translateX(140px) rotate(0deg)} to{transform:rotate(360deg) translateX(140px) rotate(-360deg)} }
        @keyframes orbit2 { from{transform:rotate(120deg) translateX(200px) rotate(-120deg)} to{transform:rotate(480deg) translateX(200px) rotate(-480deg)} }
        @keyframes orbit3 { from{transform:rotate(240deg) translateX(165px) rotate(-240deg)} to{transform:rotate(600deg) translateX(165px) rotate(-600deg)} }
        * { box-sizing:border-box; }
        html,body { margin:0; padding:0; overflow-x:hidden; }
        .la2-root { font-family:'Manrope',system-ui,sans-serif; background:#0a0a0b; color:white; min-height:100vh; overflow-x:hidden; }
        .la2-shimmer { background:linear-gradient(100deg,#ff5a00 0%,#ff8246 40%,#ffb98a 50%,#ff8246 60%,#ff5a00 100%); background-size:200% 100%; -webkit-background-clip:text; background-clip:text; color:transparent; animation:shimmer 5s linear infinite; }
        .la2-glass { background:rgba(255,255,255,.06); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,.1); }
        .la2-card { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:24px; }
        .la2-cta { background:#ff5a00; color:white; border:none; border-radius:100px; padding:15px 32px; font-weight:800; font-size:.95rem; cursor:pointer; font-family:'Manrope',system-ui,sans-serif; transition:all .2s; text-decoration:none; display:inline-block; }
        .la2-cta:hover { background:#e85100; transform:scale(1.03); }
        .la2-ghost { background:rgba(255,255,255,.07); color:white; border:1px solid rgba(255,255,255,.15); border-radius:100px; padding:15px 32px; font-weight:700; font-size:.95rem; cursor:pointer; font-family:'Manrope',system-ui,sans-serif; transition:all .2s; text-decoration:none; display:inline-block; }
        .la2-ghost:hover { background:rgba(255,255,255,.13); }
        @media(max-width:768px) { .la2-hero-grid{grid-template-columns:1fr!important} .la2-feat-grid{grid-template-columns:1fr!important} .la2-orbit{display:none!important} }

        @media(max-width:768px) {
          .la2-nav-links { display:none; }
          .la2-footer-grid { grid-template-columns:1fr!important; gap:24px!important; }
          .la2-hero-grid { grid-template-columns:1fr!important; gap:32px!important; }
          .la2-feat-grid { grid-template-columns:1fr!important; }
          .la2-kpi-grid { grid-template-columns:1fr 1fr!important; }
        }
        @media(max-width:480px) {
          .la2-kpi-grid { grid-template-columns:1fr!important; }
        }
            @media(max-width:480px) { .la2-kpi-grid{grid-template-columns:1fr 1fr!important} }

        /* Nav mobile */
        /* Footer */
        .la2-footer-grid { display:grid; }
        
        @media(max-width:768px) {
          .la2-hero-grid { grid-template-columns:1fr!important; gap:32px!important; }
          .la2-feat-grid { grid-template-columns:1fr!important; }
          .la2-steps { grid-template-columns:1fr!important; }
          .la2-kpi-grid { grid-template-columns:1fr 1fr; gap:10px; }
          .la2-footer-grid { grid-template-columns:1fr!important; gap:20px!important; }
          .la2-orbit { display:none!important; }
        }
        @media(max-width:480px) {
          .la2-kpi-grid { grid-template-columns:1fr!important; }
        }
    
      `}</style>

      <div className="la2-root">

                {/* NAVBAR */}
        <LandingNav
          links={[["#benefici","Vantaggi"],["#calcolatore","Guadagni"],["#faq","FAQ"]]}
          ctaHref={"#registrati"}
          ctaLabel={"Iscriviti gratis"}
        />

{/* HERO */}
        <section style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", overflow:"hidden", paddingTop:80 }}>
          <div aria-hidden style={{ position:"absolute", top:-120, left:"50%", width:800, height:800, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,90,0,.3),rgba(255,130,70,.1) 50%,transparent 72%)", filter:"blur(120px)", animation:"float 9s ease-in-out infinite", pointerEvents:"none" }} />
          <div aria-hidden style={{ position:"absolute", top:200, right:-150, width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,185,138,.2),transparent 70%)", filter:"blur(100px)", animation:"float2 12s ease-in-out infinite", pointerEvents:"none" }} />

          {/* Orbite decorative */}
          <div className="la2-orbit" style={{ position:"absolute", top:"50%", left:"62%", transform:"translate(-50%,-50%)", width:460, height:460, pointerEvents:"none", opacity:.55 }}>
            <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"1px dashed rgba(255,90,0,.2)" }} />
            <div style={{ position:"absolute", inset:40, borderRadius:"50%", border:"1px dashed rgba(255,255,255,.08)" }} />
            <div style={{ position:"absolute", inset:80, borderRadius:"50%", border:"1px dashed rgba(255,90,0,.1)" }} />
            {[
              { style:{ animation:"orbit 8s linear infinite" }, bg:"#ff5a00", label:"🎤", size:38 },
              { style:{ animation:"orbit2 12s linear infinite" }, bg:"rgba(255,255,255,.1)", label:"🎵", size:34 },
              { style:{ animation:"orbit3 10s linear infinite" }, bg:"rgba(255,90,0,.3)", label:"📅", size:30 },
            ].map((o,i) => (
              <div key={i} style={{ position:"absolute", top:"50%", left:"50%", marginTop:-o.size/2, marginLeft:-o.size/2, ...o.style }}>
                <div style={{ width:o.size, height:o.size, borderRadius:"50%", background:o.bg, border:"1px solid rgba(255,255,255,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:o.size*.45 }}>{o.label}</div>
              </div>
            ))}
          </div>

          <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 20px", display:"grid", gridTemplateColumns:"1fr 420px", gap:60, alignItems:"center", position:"relative", zIndex:1, width:"100%" }} className="la2-hero-grid">
            <div>
              <div data-reveal style={{ ...rev, display:"inline-flex", alignItems:"center", gap:8, borderRadius:100, padding:"6px 16px", marginBottom:28, background:"rgba(255,90,0,.12)", border:"1px solid rgba(255,90,0,.25)" }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:ORANGE, animation:"pulse 2s infinite", display:"inline-block" }} />
                <span style={{ fontSize:".72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".12em", color:"rgba(255,255,255,.8)" }}>Marketplace eventi dal vivo · Italia 2026</span>
              </div>
              <h1 data-reveal style={{ ...rev, fontFamily:"Sora,sans-serif", fontSize:"clamp(2.6rem,5.5vw,4.2rem)", fontWeight:900, lineHeight:1.0, letterSpacing:"-3px", margin:"0 0 24px", transitionDelay:".08s" }}>
                Trova più concerti.<br/>Gestisci i tuoi ingaggi<br/><span className="la2-shimmer">a costo zero.</span>
              </h1>
              <p data-reveal style={{ ...rev, fontSize:"clamp(.95rem,2vw,1.15rem)", color:"rgba(255,255,255,.6)", lineHeight:1.7, marginBottom:36, maxWidth:540, transitionDelay:".16s" }}>
                Crea la tua vetrina professionale, ricevi richieste di booking dai migliori locali e incassa <strong style={{ color:"white" }}>il 100% del tuo cachet netto, senza commissioni.</strong>
              </p>
              <div data-reveal style={{ ...rev, display:"flex", gap:12, flexWrap:"wrap", marginBottom:36, transitionDelay:".24s" }}>
                <a href="#registrati" className="la2-cta" style={{ fontSize:"1rem", padding:"16px 34px" }}>Crea il profilo gratis →</a>
                <a href="#calcolatore" className="la2-ghost" style={{ fontSize:"1rem", padding:"16px 28px" }}>Calcola i guadagni</a>
              </div>
              <div data-reveal style={{ ...rev, display:"flex", gap:20, flexWrap:"wrap", transitionDelay:".32s" }}>
                {["Zero commissioni","Zero canoni fissi","Profilo in 2 minuti","🇮🇹 Made in Italy"].map(t => (
                  <span key={t} style={{ fontSize:".78rem", fontWeight:600, color:"rgba(255,255,255,.45)", display:"flex", alignItems:"center", gap:4 }}>✓ {t}</span>
                ))}
              </div>
            </div>

            {/* Form registrazione */}
            <div data-reveal style={{ ...rev, transitionDelay:".2s" }} id="registrati">
              <div className="la2-glass" style={{ borderRadius:28, padding:"32px 28px" }}>
                <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".16em", color:ORANGE, marginBottom:6 }}>Inizia subito · Gratis</p>
                <h2 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1.3rem", letterSpacing:"-.03em", color:"white", margin:"0 0 20px" }}>Crea il tuo profilo artista</h2>
                <RegisterFormInline role="artist" dark={true} />
              </div>
            </div>
          </div>
        </section>

        {/* TICKER */}
        <section style={{ background:"rgba(255,255,255,.03)", borderTop:"1px solid rgba(255,255,255,.06)", borderBottom:"1px solid rgba(255,255,255,.06)", padding:"16px 0", overflow:"hidden" }}>
          <div style={{ display:"flex", whiteSpace:"nowrap", animation:"marquee 28s linear infinite" }}>
            {["DJ","Band Live","Cantante","Duo Acustico","Saxofonista","Violinista","Hip Hop","Jazz","Techno","House","Rock","Pop","Soul","R&B","DJ","Band Live","Cantante","Duo Acustico","Saxofonista","Violinista","Hip Hop","Jazz","Techno","House"].map((item,i) => (
              <span key={i} style={{ margin:"0 24px", color:"rgba(255,255,255,.3)", fontSize:".8rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".16em" }}>{item}</span>
            ))}
          </div>
        </section>

        {/* KPI */}
        <section style={{ padding:"80px 20px" }}>
          <div style={{ maxWidth:1000, margin:"0 auto" }}>
            <div className="la2-kpi-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
              {[["0€","per iniziare","nessuna carta richiesta"],["100%","del cachet","sempre tuo, zero commissioni"],["🇮🇹","mercato italiano","locali da tutta Italia"],["📊","analitiche","chi vede il tuo profilo"]].map(([val,label,sub],i) => (
                <div key={i} data-reveal style={{ ...rev, transitionDelay:`${i*.07}s` }}>
                  <TiltCard style={{ borderRadius:22, height:"100%" }}>
                    <div className="la2-card" style={{ padding:"24px 20px", height:"100%", position:"relative", zIndex:2 }}>
                      <p style={{ fontFamily:"Sora,sans-serif", fontWeight:900, fontSize:"2rem", letterSpacing:"-2px", color:i===1?ORANGE:"white", margin:"0 0 6px" }}>{val}</p>
                      <p style={{ fontWeight:700, fontSize:".875rem", color:"white", margin:"0 0 4px" }}>{label}</p>
                      <p style={{ fontSize:".78rem", color:"rgba(255,255,255,.4)", margin:0 }}>{sub}</p>
                    </div>
                  </TiltCard>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BENEFICI */}
        <section id="benefici" style={{ padding:"80px 20px", background:"rgba(255,255,255,.02)", borderTop:"1px solid rgba(255,255,255,.05)" }}>
          <div style={{ maxWidth:1100, margin:"0 auto" }}>
            <div data-reveal style={{ ...rev, textAlign:"center", marginBottom:56 }}>
              <p style={{ fontSize:".72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".18em", color:ORANGE, marginBottom:10 }}>Creato per chi si esibisce</p>
              <h2 style={{ fontFamily:"Sora,sans-serif", fontSize:"clamp(1.8rem,4vw,2.8rem)", fontWeight:900, letterSpacing:"-.04em", lineHeight:1.1, margin:"0 0 12px" }}>Perché scegliere TuttoEvento.</h2>
              <p style={{ fontSize:"1rem", color:"rgba(255,255,255,.5)", maxWidth:480, margin:"0 auto", lineHeight:1.7 }}>Abbiamo eliminato i problemi tradizionali del settore.</p>
            </div>
            <div className="la2-feat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18 }}>
              {[
                { icon:"🎸", title:"Massima Visibilità", desc:"Fatti trovare da locali, hotel, festival e organizzatori privati che cercano attivamente il tuo genere.", delay:".05s" },
                { icon:"💰", title:"Zero Commissioni", desc:"Il cachet concordato è tuo: nessuna percentuale, nessuna trattenuta, nessuna sorpresa. Sempre.", delay:".1s" },
                { icon:"📅", title:"Calendario Integrato", desc:"Vista mese, lista e in arrivo. Export iCal compatibile con Google Calendar, Apple e Outlook.", delay:".15s" },
                { icon:"💬", title:"Chat Realtime", desc:"Comunicazione diretta con il team TuttoEvento che gestisce le trattative per te.", delay:".2s" },
                { icon:"📊", title:"Analitiche Profilo", desc:"Scopri quanti locali hanno visto il tuo profilo, da dove arrivano e qual è il tuo tasso di conversione.", delay:".25s" },
                { icon:"🔔", title:"Notifiche Push", desc:"Ogni nuova richiesta di booking arriva come notifica push. Non perdi mai un'opportunità.", delay:".3s" },
              ].map(f => (
                <div key={f.title} data-reveal style={{ ...rev, transitionDelay:f.delay }}>
                  <TiltCard style={{ borderRadius:22, height:"100%" }}>
                    <div className="la2-card" style={{ padding:"26px 22px", height:"100%", position:"relative", zIndex:2, transition:"border-color .2s" }}
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

        {/* CALCOLATORE */}
        <section id="calcolatore" style={{ padding:"80px 20px" }}>
          <div style={{ maxWidth:1000, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, alignItems:"center" }} className="la2-hero-grid">
            <div data-reveal style={rev}>
              <p style={{ fontSize:".72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".18em", color:ORANGE, marginBottom:10 }}>Simula i tuoi compensi</p>
              <h2 style={{ fontFamily:"Sora,sans-serif", fontSize:"clamp(1.8rem,4vw,2.6rem)", fontWeight:900, letterSpacing:"-.04em", lineHeight:1.1, margin:"0 0 16px" }}>
                Scopri quanto puoi<br/><span className="la2-shimmer">guadagnare.</span>
              </h2>
              <p style={{ fontSize:"1rem", color:"rgba(255,255,255,.55)", lineHeight:1.7 }}>
                TuttoEvento non applica commissioni alla tua quota: quello che concordi è quello che incassi, <strong style={{ color:"white" }}>netto al 100%.</strong>
              </p>
            </div>
            <div data-reveal style={{ ...rev, transitionDelay:".15s" }}>
              <div className="la2-glass" style={{ borderRadius:24, padding:"28px 24px" }}>
                <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".14em", color:ORANGE, marginBottom:14 }}>Calcolatore guadagni</p>
                <div style={{ marginBottom:20 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <label style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,.6)" }}>Il tuo cachet a serata</label>
                    <span style={{ fontFamily:"Sora,sans-serif", fontWeight:800, color:ORANGE }}>€{cachet}</span>
                  </div>
                  <input type="range" min="50" max="1500" step="25" value={cachet} onChange={e => setCachet(Number(e.target.value))}
                    style={{ width:"100%", accentColor:ORANGE, height:6, cursor:"pointer" }} />
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"rgba(255,255,255,.35)", fontWeight:600, marginTop:6 }}>
                    <span>€50</span><span>€750</span><span>€1500</span>
                  </div>
                </div>
                <div style={{ borderTop:"1px solid rgba(255,255,255,.08)", paddingTop:18 }}>
                  <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".1em", color:"rgba(255,255,255,.4)", marginBottom:12 }}>Guadagni netti (0% commissioni)</p>
                  {[[1,"1 data al mese"],[3,"3 date al mese"],[6,"6 date al mese"],[12,"12 date al mese"]].map(([n, label]) => (
                    <div key={n} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(255,255,255,.05)", borderRadius:12, padding:"11px 14px", marginBottom:8, border:"1px solid rgba(255,255,255,.07)" }}>
                      <div>
                        <p style={{ fontWeight:700, fontSize:".875rem", color:"white", margin:0 }}>{label}</p>
                        <p style={{ fontSize:11, color:"rgba(255,255,255,.4)", margin:"2px 0 0" }}>cachet netto, senza trattenute</p>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <p style={{ fontFamily:"Sora,sans-serif", fontWeight:900, fontSize:"1.2rem", color:ORANGE, margin:0 }}>€{cachet * n}</p>
                        <p style={{ fontSize:10, fontWeight:700, color:"#22c55e", margin:"2px 0 0" }}>netti 100%</p>
                      </div>
                    </div>
                  ))}
                </div>
                <a href="#registrati" className="la2-cta" style={{ display:"block", textAlign:"center", width:"100%", marginTop:16 }}>
                  Inizia ora →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" style={{ padding:"80px 20px", background:"rgba(255,255,255,.02)", borderTop:"1px solid rgba(255,255,255,.05)" }}>
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
                    <span style={{ transition:"transform .3s", transform: openFaq === i ? "rotate(180deg)" : "none", color:"rgba(255,255,255,.4)", flexShrink:0, fontSize:".8rem" }}>▼</span>
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
                Non aspettare la prossima<br/>chiamata. <span className="la2-shimmer">Fatti trovare.</span>
              </h2>
              <p style={{ fontSize:"1rem", color:"rgba(255,255,255,.55)", maxWidth:460, margin:"0 auto 36px", lineHeight:1.7 }}>
                Crea oggi il tuo account gratuito, carica il profilo e ricevi richieste da locali di tutta Italia.
              </p>
              <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
                <a href="#registrati" className="la2-cta" style={{ fontSize:"1rem", padding:"16px 36px" }}>Crea account gratis →</a>
                <a href="/login" className="la2-ghost" style={{ fontSize:"1rem", padding:"16px 28px" }}>Accedi</a>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background:"rgba(255,255,255,.03)", borderTop:"1px solid rgba(255,255,255,.06)", padding:"40px 20px 24px" }}>
          <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:40, marginBottom:32 }} className="la2-footer-grid" style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:40, marginBottom:32 }}>
            <div>
              <span style={{ fontFamily:"Sora,sans-serif", fontWeight:900, fontSize:"1.1rem", letterSpacing:"-.04em" }}>TUTTO<span style={{ color:ORANGE }}>EVENTO</span></span>
              <p style={{ fontSize:".875rem", color:"rgba(255,255,255,.4)", lineHeight:1.7, marginTop:10, maxWidth:280 }}>La piattaforma italiana per artisti, locali e promoter.</p>
            </div>
            <div>
              <p style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:".85rem", marginBottom:12 }}>Sezioni</p>
              {[["#benefici","Vantaggi"],["#calcolatore","Guadagni"],["#faq","FAQ"]].map(([h,l]) => (
                <a key={h} href={h} style={{ display:"block", color:"rgba(255,255,255,.4)", fontSize:".875rem", textDecoration:"none", marginBottom:8 }}>{l}</a>
              ))}
            </div>
            <div>
              <p style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:".85rem", marginBottom:12 }}>Link utili</p>
              {[["/","Home"],["/login","Accedi"],["/landing-locali","Per locali"],["/landing-promoter","Per promoter"]].map(([h,l]) => (
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