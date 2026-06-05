"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RegisterFormInline from "@/components/RegisterFormInline";

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = "1"; e.target.style.transform = "translateY(0)"; io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const FAQS = [
  { q: "Quanto costa iscriversi?", a: "L'iscrizione è gratuita al 100%. TuttoEvento non trattiene commissioni dal tuo cachet: ricevi il compenso netto concordato, senza percentuali o trattenute." },
  { q: "Come funzionano le richieste di booking?", a: "I locali ti scoprono nel marketplace, inviano una richiesta di contatto con data, tipo evento e budget. Il team TuttoEvento gestisce la trattativa e ti avvisa via notifica push." },
  { q: "Posso iscrivermi senza partita IVA?", a: "Certamente. Supportiamo sia professionisti con P.IVA sia artisti emergenti in regime di prestazione occasionale. Il nostro team è a disposizione per assisterti." },
  { q: "Quali generi e categorie artistiche sono ammessi?", a: "DJ, band live, cantanti, duo acustici, musicisti strumentali, performer, illusionisti, animatori e molto altro. Ogni talento ha spazio nel marketplace." },
  { q: "Come fanno i locali a trovarmi?", a: "Filtrano il marketplace per città, genere musicale e budget. Più completo è il tuo profilo (foto, bio, link social, disponibilità), più appari in cima ai risultati." },
];

const reveal = { opacity: 0, transform: "translateY(28px)", transition: "opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1)" };

export default function LandingArtisti() {
  useReveal();
  const [cachet, setCachet] = useState(150);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      <style>{`
        @keyframes float { 0%,100%{transform:translate(-50%,0)} 50%{transform:translate(-50%,-24px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(14px,14px)} }
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes shimmer { to{background-position:-200% 0} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        * { box-sizing:border-box; }
        html,body { margin:0; padding:0; overflow-x:hidden; }
        .la-root { font-family:'Manrope',system-ui,sans-serif; background:#fbfaf8; color:#0a0a0b; min-height:100vh; overflow-x:hidden; }
        .la-shimmer { background:linear-gradient(100deg,#ff5a00 0%,#ff8246 40%,#ffb98a 50%,#ff8246 60%,#ff5a00 100%); background-size:200% 100%; -webkit-background-clip:text; background-clip:text; color:transparent; animation:shimmer 6s linear infinite; }
        .la-glass { background:rgba(255,255,255,.65); backdrop-filter:blur(18px) saturate(160%); border:1px solid rgba(255,255,255,.72); box-shadow:0 30px 60px -30px rgba(20,12,0,.2); }
        .la-card { background:#fbfaf8; border:1px solid rgba(0,0,0,.06); border-radius:28px; padding:28px; height:100%; transition:box-shadow .2s, transform .2s; }
        .la-card:hover { box-shadow:0 12px 40px rgba(0,0,0,.1); transform:translateY(-3px); }
        .la-cta-btn { position:relative; display:inline-block; background:#ff5a00; color:white; padding:16px 36px; border-radius:100px; font-weight:700; font-size:1rem; text-decoration:none; transition:all .2s; box-shadow:0 18px 40px -12px rgba(255,90,0,.55); font-family:'Manrope',sans-serif; }
        .la-cta-btn:hover { background:#e85100; transform:scale(1.02); }
        .la-ghost-btn { display:inline-block; background:rgba(255,255,255,.65); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,.72); color:#0a0a0b; padding:16px 32px; border-radius:100px; font-weight:700; font-size:1rem; text-decoration:none; transition:all .2s; font-family:'Manrope',sans-serif; }
        .la-ghost-btn:hover { transform:scale(1.02); }
        input[type=range].la-slider { width:100%; height:8px; -webkit-appearance:none; appearance:none; background:rgba(0,0,0,.12); border-radius:4px; outline:none; cursor:pointer; }
        input[type=range].la-slider::-webkit-slider-thumb { -webkit-appearance:none; width:24px; height:24px; border-radius:50%; background:#ff5a00; box-shadow:0 0 12px rgba(255,90,0,.5); transition:transform .15s; }
        input[type=range].la-slider::-webkit-slider-thumb:hover { transform:scale(1.2); }
        @media(max-width:640px) { .la-hero-title{font-size:2.4rem!important} .la-grid-2{grid-template-columns:1fr!important} .la-grid-4{grid-template-columns:1fr 1fr!important} }
        @media(max-width:400px) { .la-grid-4{grid-template-columns:1fr!important} }
      `}</style>

      <div className="la-root">

        {/* NAVBAR */}
        <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, padding:"12px 16px" }}>
          <div className="la-glass" style={{ maxWidth:1100, margin:"0 auto", borderRadius:100, padding:"0 20px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <Link href="/" style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:"1.1rem", letterSpacing:"-.04em", textDecoration:"none", color:"#0a0a0b" }}>
              TUTTO<span style={{ color:"#ff5a00" }}>EVENTO</span>
            </Link>
            <div style={{ display:"flex", gap:28, alignItems:"center" }}>
              {[["#benefici","Vantaggi"],["#calcolatore","Guadagni"],["#faq","FAQ"]].map(([h,l]) => (
                <a key={h} href={h} style={{ fontSize:".875rem", fontWeight:600, color:"#6b6b73", textDecoration:"none" }}>{l}</a>
              ))}
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <Link href="/login" style={{ fontSize:".875rem", fontWeight:700, color:"#0a0a0b", textDecoration:"none", padding:"7px 14px", borderRadius:100 }}>Accedi</Link>
              <Link href="/register?role=artist" className="la-cta-btn" style={{ padding:"8px 18px", fontSize:".85rem" }}>Iscriviti gratis</Link>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ position:"relative", paddingTop:160, paddingBottom:80, paddingLeft:20, paddingRight:20, overflow:"hidden" }}>
          <div aria-hidden style={{ position:"absolute", top:-100, left:"50%", width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,90,0,.26),transparent 70%)", filter:"blur(130px)", zIndex:0, animation:"float 9s ease-in-out infinite", pointerEvents:"none" }} />
          <div aria-hidden style={{ position:"absolute", top:200, right:-100, width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,185,138,.3),transparent 70%)", filter:"blur(100px)", zIndex:0, animation:"float2 12s ease-in-out infinite", pointerEvents:"none" }} />

          <div style={{ maxWidth:900, margin:"0 auto", textAlign:"center", position:"relative", zIndex:1 }}>
            <div data-reveal style={{ ...reveal, display:"inline-flex", alignItems:"center", gap:8, borderRadius:100, padding:"6px 16px", marginBottom:28, ...{ background:"rgba(255,255,255,.65)", backdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,.72)" } }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:"#ff5a00", animation:"pulse 2s infinite", display:"inline-block" }} />
              <span style={{ fontSize:".75rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".1em", color:"#6b6b73" }}>Marketplace eventi dal vivo · Italia 2026</span>
            </div>

            <h1 data-reveal className="la-hero-title" style={{ ...reveal, fontFamily:"'Sora',sans-serif", fontSize:"clamp(2.6rem,6vw,4.8rem)", fontWeight:900, lineHeight:1.0, letterSpacing:"-3px", color:"#0a0a0b", marginBottom:24 }}>
              Trova più concerti.<br/>Gestisci i tuoi ingaggi<br/><span className="la-shimmer">a costo zero.</span>
            </h1>

            <p data-reveal style={{ ...reveal, fontSize:"clamp(1rem,2.5vw,1.2rem)", color:"#6b6b73", maxWidth:680, margin:"0 auto 40px", lineHeight:1.7, fontFamily:"'Manrope',sans-serif" }}>
              Crea la tua vetrina professionale, ricevi richieste di booking dai migliori locali e incassa <strong style={{ color:"#0a0a0b" }}>il 100% del tuo cachet netto, senza commissioni.</strong>
            </p>

            <div data-reveal style={{ ...reveal, display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap", marginBottom:36 }}>
              <Link href="#registrati" className="la-cta-btn">Crea il profilo gratis</Link>
              <a href="#calcolatore" className="la-ghost-btn">Calcola quanto guadagni →</a>
            </div>

            <div data-reveal style={{ ...reveal, display:"flex", gap:20, justifyContent:"center", flexWrap:"wrap" }}>
              {["Zero commissioni","Zero canoni fissi","Profilo pronto in 2 minuti","🇮🇹 Made in Italy"].map(t => (
                <span key={t} style={{ fontSize:".8rem", fontWeight:600, color:"#6b6b73", display:"flex", alignItems:"center", gap:4 }}>✓ {t}</span>
              ))}
            </div>
          </div>

          {/* Dashboard preview */}
          <div data-reveal style={{ ...reveal, maxWidth:860, margin:"64px auto 0", position:"relative", zIndex:1 }}>
            <div style={{ background:"#111114", border:"1px solid rgba(255,255,255,.1)", borderRadius:28, overflow:"hidden", boxShadow:"0 40px 95px -30px rgba(0,0,0,.5)" }}>
              <div style={{ background:"rgba(255,255,255,.05)", borderBottom:"1px solid rgba(255,255,255,.07)", padding:"12px 20px", display:"flex", alignItems:"center", gap:8 }}>
                {["#ff5a55","#ffbd2e","#28c840"].map(c => <span key={c} style={{ width:12, height:12, borderRadius:"50%", background:c, display:"inline-block" }} />)}
                <span style={{ fontSize:11, color:"rgba(255,255,255,.4)", fontFamily:"monospace", marginLeft:8 }}>tuttoevento.it/dashboard/artista</span>
              </div>
              <div style={{ padding:28, display:"grid", gridTemplateColumns:"1fr 1.4fr", gap:24, alignItems:"center" }}>
                <div>
                  <span style={{ fontSize:10, fontWeight:700, letterSpacing:".14em", color:"#ff5a00", background:"rgba(255,90,0,.1)", padding:"4px 12px", borderRadius:100, textTransform:"uppercase" }}>Pannello Artista</span>
                  <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:"1.5rem", fontWeight:800, color:"white", marginTop:14, marginBottom:10, lineHeight:1.1 }}>La tua carriera,<br/>organizzata.</h3>
                  <p style={{ fontSize:".85rem", color:"rgba(255,255,255,.5)", lineHeight:1.6, marginBottom:16 }}>Controlla i booking, il calendario serate e le analitiche del profilo.</p>
                  {["Chat integrata con i locali","Calendario con export iCal","Analitiche visite e conversioni"].map(f => (
                    <div key={f} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                      <span style={{ color:"#ff5a00", fontSize:"1rem" }}>✦</span>
                      <span style={{ fontSize:".8rem", fontWeight:600, color:"rgba(255,255,255,.8)" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)", borderRadius:18, padding:20 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, paddingBottom:14, borderBottom:"1px solid rgba(255,255,255,.06)" }}>
                    <div><p style={{ fontWeight:700, color:"white", fontSize:".95rem" }}>Prossimi eventi</p><p style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginTop:2 }}>Giugno – Luglio 2026</p></div>
                    <span style={{ fontSize:11, fontWeight:700, color:"#4ade80", background:"rgba(74,222,128,.1)", padding:"4px 10px", borderRadius:100 }}>3 date confermate</span>
                  </div>
                  {[["Sunset Beach Club","18 Giu 2026","€ 450","Confermato"],["Ristorante La Fenice","27 Giu 2026","€ 350","Confermato"],["Open Air Festival","11 Lug 2026","€ 800","In attesa"]].map(([locale,data,comp,status]) => (
                    <div key={locale} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(0,0,0,.3)", borderRadius:12, padding:"10px 14px", marginBottom:8, border:"1px solid rgba(255,255,255,.05)" }}>
                      <div><p style={{ fontWeight:700, fontSize:".85rem", color:"white" }}>{locale}</p><p style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginTop:2 }}>{data}</p></div>
                      <div style={{ textAlign:"right" }}><p style={{ fontWeight:700, fontSize:".85rem", color:"#ff5a00" }}>{comp}</p><p style={{ fontSize:10, fontWeight:700, color:status==="Confermato"?"#4ade80":"#fbbf24", marginTop:2 }}>{status}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FORM REGISTRAZIONE INLINE */}
        <section id="registrati" style={{ padding:"0 20px 60px" }}>
          <div style={{ maxWidth:560, margin:"0 auto" }}>
            <div data-reveal style={{ ...reveal, background:"white", border:"1px solid rgba(0,0,0,.07)", borderRadius:28, padding:"32px 28px", boxShadow:"0 20px 60px rgba(0,0,0,.1)" }}>
              <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".16em", color:"#ff5a00", marginBottom:6 }}>Inizia subito</p>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"1.3rem", letterSpacing:"-.03em", color:"#0a0a0b", margin:"0 0 20px" }}>Crea il tuo profilo artista</h2>
              <RegisterFormInline role="artist" dark={false} />
            </div>
          </div>
        </section>

        {/* BENEFICI */}
        <section id="benefici" style={{ padding:"80px 20px", background:"white", borderTop:"1px solid rgba(0,0,0,.06)", borderBottom:"1px solid rgba(0,0,0,.06)" }}>
          <div style={{ maxWidth:1100, margin:"0 auto" }}>
            <div data-reveal style={{ ...reveal, textAlign:"center", marginBottom:56 }}>
              <p style={{ fontSize:".75rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".16em", color:"#ff5a00", marginBottom:10 }}>Creato per chi si esibisce</p>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(1.8rem,4vw,2.8rem)", fontWeight:900, color:"#0a0a0b", letterSpacing:"-.04em", lineHeight:1.1 }}>Perché scegliere TuttoEvento?</h2>
              <p style={{ color:"#6b6b73", fontSize:"1rem", marginTop:12, maxWidth:520, margin:"12px auto 0", lineHeight:1.7 }}>Abbiamo eliminato i problemi tradizionali del settore.</p>
            </div>
            <div className="la-grid-4" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
              {[["🎸","Massima Visibilità","Fatti trovare da locali, hotel, festival e organizzatori privati che cercano attivamente il tuo genere."],["🔒","Pagamenti Garantiti","Il team TuttoEvento gestisce la trattativa. Tu ti concentri solo sulla performance."],["💰","Zero Commissioni","Il cachet concordato è tuo: nessuna percentuale, nessuna trattenuta, nessuna sorpresa."],["📅","Calendario Integrato","Vista mese, lista e in arrivo. Export iCal compatibile con Google Calendar, Apple e Outlook."]].map(([icon,title,desc],i) => (
                <div key={title} data-reveal style={{ ...reveal, transitionDelay:`${i*.08}s` }}>
                  <div className="la-card">
                    <span style={{ fontSize:"1.8rem", display:"block", marginBottom:14 }}>{icon}</span>
                    <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"1rem", color:"#0a0a0b", marginBottom:8 }}>{title}</h3>
                    <p style={{ fontSize:".875rem", color:"#6b6b73", lineHeight:1.6 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CALCOLATORE */}
        <section id="calcolatore" style={{ padding:"80px 20px", background:"#fbfaf8" }}>
          <div style={{ maxWidth:1000, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"center" }} className="la-grid-2">
            <div data-reveal style={reveal}>
              <p style={{ fontSize:".75rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".16em", color:"#ff5a00", marginBottom:10 }}>Simula i tuoi compensi</p>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(1.8rem,4vw,2.8rem)", fontWeight:900, color:"#0a0a0b", letterSpacing:"-.04em", lineHeight:1.1, marginBottom:16 }}>Scopri quanto puoi guadagnare.</h2>
              <p style={{ color:"#6b6b73", fontSize:"1rem", lineHeight:1.7 }}>TuttoEvento non applica commissioni alla tua quota: quello che concordi è quello che incassi, netto al 100%.</p>
            </div>
            <div data-reveal style={{ ...reveal, background:"white", border:"1px solid rgba(0,0,0,.07)", borderRadius:32, padding:36, boxShadow:"0 20px 60px rgba(0,0,0,.08)" }}>
              <div style={{ marginBottom:24 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:10 }}>
                  <label style={{ fontSize:".875rem", fontWeight:700 }}>Il tuo cachet a serata</label>
                  <span style={{ fontFamily:"'Sora',sans-serif", fontSize:"2rem", fontWeight:900, color:"#ff5a00" }}>€{cachet}</span>
                </div>
                <input type="range" min="50" max="1500" step="50" value={cachet} onChange={e => setCachet(Number(e.target.value))} className="la-slider" />
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#6b6b73", fontWeight:600, marginTop:6 }}>
                  <span>€50</span><span>€750</span><span>€1500+</span>
                </div>
              </div>
              <div style={{ borderTop:"1px solid rgba(0,0,0,.07)", paddingTop:20 }}>
                <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".1em", color:"#6b6b73", marginBottom:14 }}>Guadagni netti (0% commissioni)</p>
                {[[1,"1 data al mese"],[3,"3 date al mese"],[6,"6 date al mese"]].map(([n,label]) => (
                  <div key={n} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"#fbfaf8", borderRadius:14, padding:"12px 16px", marginBottom:10, border:"1px solid rgba(0,0,0,.06)" }}>
                    <div><p style={{ fontWeight:700, fontSize:".875rem" }}>{label}</p><p style={{ fontSize:11, color:"#6b6b73", marginTop:2 }}>Cachet netto, senza trattenute</p></div>
                    <div style={{ textAlign:"right" }}><p style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:"1.2rem" }}>€{cachet*n}</p><p style={{ fontSize:10, fontWeight:700, color:"#16a34a" }}>netti 100%</p></div>
                  </div>
                ))}
              </div>
              <Link href="/register?role=artist" style={{ display:"block", background:"#0a0a0b", color:"white", textAlign:"center", padding:"14px", borderRadius:14, fontWeight:700, fontSize:".95rem", textDecoration:"none", marginTop:16, fontFamily:"'Manrope',sans-serif" }}>
                Inizia ora →
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" style={{ padding:"80px 20px", background:"white", borderTop:"1px solid rgba(0,0,0,.06)" }}>
          <div style={{ maxWidth:760, margin:"0 auto" }}>
            <div data-reveal style={{ ...reveal, textAlign:"center", marginBottom:48 }}>
              <p style={{ fontSize:".75rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".16em", color:"#ff5a00", marginBottom:10 }}>Hai domande?</p>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(1.8rem,4vw,2.6rem)", fontWeight:900, color:"#0a0a0b", letterSpacing:"-.04em" }}>Domande frequenti</h2>
            </div>
            <div data-reveal style={reveal}>
              {FAQS.map((f,i) => (
                <div key={i} style={{ border:"1px solid rgba(0,0,0,.07)", borderRadius:18, marginBottom:10, overflow:"hidden", background:"#fbfaf8" }}>
                  <button onClick={() => setOpenFaq(openFaq===i?null:i)}
                    style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 20px", background:"none", border:"none", cursor:"pointer", textAlign:"left", fontFamily:"'Manrope',sans-serif", fontWeight:700, fontSize:"1rem", color:"#0a0a0b", gap:12 }}>
                    <span>{f.q}</span>
                    <span style={{ transition:"transform .3s", transform:openFaq===i?"rotate(180deg)":"none", color:"#6b6b73", flexShrink:0 }}>▼</span>
                  </button>
                  {openFaq === i && (
                    <div style={{ padding:"0 20px 18px", borderTop:"1px solid rgba(0,0,0,.06)" }}>
                      <p style={{ fontSize:".9rem", color:"#6b6b73", lineHeight:1.7, paddingTop:14 }}>{f.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINALE */}
        <section style={{ padding:"20px 20px 60px" }}>
          <div data-reveal style={{ ...reveal, maxWidth:1000, margin:"0 auto", position:"relative", borderRadius:32, overflow:"hidden", textAlign:"center", padding:"80px 40px" }}>
            <img src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1600&q=80" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,rgba(10,10,11,.92),rgba(26,20,15,.82))" }} />
            <div aria-hidden style={{ position:"absolute", top:-80, left:"50%", transform:"translateX(-50%)", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,90,0,.5),transparent 70%)", filter:"blur(80px)", animation:"float 8s ease-in-out infinite" }} />
            <div style={{ position:"relative", zIndex:1 }}>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(2rem,5vw,3.2rem)", fontWeight:900, color:"white", letterSpacing:"-.04em", lineHeight:1.05, marginBottom:16 }}>
                Non aspettare la prossima chiamata.<br/><span className="la-shimmer">Fatti trovare.</span>
              </h2>
              <p style={{ color:"rgba(255,255,255,.65)", fontSize:"1rem", maxWidth:460, margin:"0 auto 36px", lineHeight:1.7 }}>Crea oggi il tuo account gratuito su TuttoEvento, carica il profilo e ricevi richieste da locali di tutta Italia.</p>
              <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
                <Link href="#registrati" className="la-cta-btn">Crea account gratuito</Link>
                <Link href="/login" style={{ display:"inline-block", background:"rgba(255,255,255,.1)", color:"white", border:"1px solid rgba(255,255,255,.2)", padding:"16px 32px", borderRadius:100, fontWeight:700, fontSize:"1rem", textDecoration:"none", fontFamily:"'Manrope',sans-serif" }}>
                  Accedi
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background:"white", borderTop:"1px solid rgba(0,0,0,.06)", padding:"40px 20px 24px" }}>
          <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:40, marginBottom:32 }} className="la-grid-2">
            <div>
              <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:"1.1rem", letterSpacing:"-.04em" }}>TUTTO<span style={{ color:"#ff5a00" }}>EVENTO</span></span>
              <p style={{ color:"#6b6b73", fontSize:".875rem", lineHeight:1.7, marginTop:10, maxWidth:280 }}>La piattaforma italiana per artisti, locali e promoter. Booking semplice, chat realtime, CRM completo.</p>
            </div>
            <div>
              <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:".85rem", marginBottom:12 }}>Sezioni</p>
              {[["#benefici","Vantaggi"],["#calcolatore","Guadagni"],["#faq","FAQ"]].map(([h,l]) => (
                <a key={h} href={h} style={{ display:"block", color:"#6b6b73", fontSize:".875rem", textDecoration:"none", marginBottom:8 }}>{l}</a>
              ))}
            </div>
            <div>
              <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:".85rem", marginBottom:12 }}>Link utili</p>
              {[["/","Home"],["/login","Accedi"],["/register?role=artist","Registrati"]].map(([h,l]) => (
                <Link key={h} href={h} style={{ display:"block", color:"#6b6b73", fontSize:".875rem", textDecoration:"none", marginBottom:8 }}>{l}</Link>
              ))}
            </div>
          </div>
          <div style={{ borderTop:"1px solid rgba(0,0,0,.06)", paddingTop:20, textAlign:"center", fontSize:".78rem", color:"#6b6b73" }}>
            © 2026 TuttoEvento. Tutti i diritti riservati.
          </div>
        </footer>

      </div>
    </>
  );
}