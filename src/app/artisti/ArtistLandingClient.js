"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* Hook per l'animazione al passaggio dello scroll (Intersection Observer) */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* Card 3D Tilt */
function TiltCard({ children, className = "", glow = "rgba(255,90,0,0.25)" }) {
  const ref = useRef(null);
  const [style, setStyle] = useState({});

  function handleMove(e) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (py - 0.5) * -10;
    const ry = (px - 0.5) * 12;
    setStyle({
      transform: `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`,
      "--mx": `${px * 100}%`,
      "--my": `${py * 100}%`,
      "--glow": glow,
    });
  }

  function reset() {
    setStyle({ transform: "perspective(900px) rotateX(0) rotateY(0) translateY(0)" });
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={style}
      className={`te-tilt ${className}`}
    >
      {children}
    </div>
  );
}

export default function ArtistLandingClient() {
  useReveal();

  // Stato per il calcolatore di guadagni
  const [cachet, setCachet] = useState(50);

  // Stato per le FAQ
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Quanto costa iscriversi e caricare il profilo?",
      a: "L'iscrizione e l'utilizzo della piattaforma sono gratuiti al 100%. TuttoEvento non trattiene alcuna commissione dal tuo cachet: ricevi il compenso netto concordato, senza percentuali o trattenute."
    },
    {
      q: "Come e quando vengo pagato?",
      a: "TuttoEvento garantisce i tuoi compensi tramite pagamento protetto. L'organizzatore versa l'importo concordato al momento della conferma del booking. I fondi rimangono protetti in cassaforte e ti vengono accreditati automaticamente sul tuo conto corrente entro 48 ore dalla fine dell'evento, senza che tu debba sollecitare pagamenti."
    },
    {
      q: "Posso iscrivermi anche se non ho partita IVA?",
      a: "Certamente. TuttoEvento supporta sia professionisti con Partita IVA sia artisti emergenti che operano in regime di prestazione occasionale (ritenuta d'acconto) o tramite cooperative dello spettacolo. Il nostro team amministrativo è a disposizione per assisterti."
    },
    {
      q: "Quali generi e categorie artistiche sono ammessi?",
      a: "Ospitiamo ogni tipo di talento: DJ (di qualsiasi genere), band live, cantanti solisti, duo/trio acustici, musicisti strumentali (chitarristi, sassofonisti, violinisti), ma anche performer di intrattenimento come maghi, cabarettisti, ballerini, presentatori e animatori."
    },
    {
      q: "Come fanno i locali e gli organizzatori a trovarmi?",
      a: "Disponiamo di un marketplace geolocalizzato avanzato. Gli organizzatori possono filtrare gli artisti per città, raggio di spostamento, genere musicale, budget e disponibilità di data. Più completi sono il tuo profilo, le recensioni e le tue clip video, più in alto apparirai nelle loro ricerche."
    }
  ];

  return (
    <main className="te-artisti-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');

        .te-artisti-root {
          --orange: #ff5a00;
          --orange-soft: #ff8246;
          --ink: #0a0a0b;
          --paper: #fbfaf8;
          --muted: #6b6b73;
          font-family: 'Manrope', system-ui, sans-serif;
          background: var(--paper);
          color: var(--ink);
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
        }
        .te-artisti-root ::selection { background: var(--orange); color: #fff; }
        .te-display { font-family: 'Sora', sans-serif; letter-spacing: -0.03em; }

        .te-grain::before {
          content: "";
          position: fixed; inset: 0; z-index: 1; pointer-events: none;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        /* animations */
        [data-reveal] { opacity: 0; transform: translateY(28px); transition: opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1); }
        [data-reveal].is-visible { opacity: 1; transform: none; }
        [data-reveal][data-delay="1"] { transition-delay: .08s; }
        [data-reveal][data-delay="2"] { transition-delay: .16s; }
        [data-reveal][data-delay="3"] { transition-delay: .24s; }

        .te-tilt { transition: transform .25s cubic-bezier(.2,.7,.2,1); transform-style: preserve-3d; will-change: transform; position: relative; }
        .te-tilt::after {
          content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
          background: radial-gradient(420px circle at var(--mx,50%) var(--my,50%), var(--glow,rgba(255,90,0,.18)), transparent 45%);
          opacity: 0; transition: opacity .3s;
        }
        .te-tilt:hover::after { opacity: 1; }

        @keyframes te-float { 0%,100%{ transform: translate(0,0) scale(1);} 50%{ transform: translate(0,-24px) scale(1.03);} }
        @keyframes te-float2 { 0%,100%{ transform: translate(0,0);} 50%{ transform: translate(14px,14px);} }
        @keyframes te-spin { to { transform: rotate(360deg); } }
        @keyframes te-pulse { 0%,100%{ opacity:.5;} 50%{ opacity:1;} }
        @keyframes te-marquee { from { transform: translateX(0);} to { transform: translateX(-50%);} }

        .te-shimmer {
          background: linear-gradient(100deg, var(--orange) 0%, var(--orange-soft) 40%, #ffb98a 50%, var(--orange-soft) 60%, var(--orange) 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text; background-clip: text; color: transparent;
          animation: te-shimmer-move 6s linear infinite;
        }
        @keyframes te-shimmer-move { to { background-position: -200% 0; } }

        .te-cta { position: relative; isolation: isolate; }
        .te-cta::before {
          content:""; position:absolute; inset:-2px; border-radius:999px; z-index:-1;
          background: conic-gradient(from 0deg, var(--orange), #ffb98a, var(--orange));
          opacity:0; transition:opacity .35s; filter: blur(8px);
        }
        .te-cta:hover::before { opacity:.55; animation: te-spin 4s linear infinite; }

        .te-glass {
          background: rgba(255,255,255,0.62);
          backdrop-filter: blur(18px) saturate(160%);
          -webkit-backdrop-filter: blur(18px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.7);
          box-shadow: 0 1px 0 rgba(255,255,255,.6) inset, 0 30px 60px -30px rgba(20,12,0,.25);
        }

        .te-dark-glass {
          background: rgba(20,20,22,0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.06);
        }

        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--orange);
          cursor: pointer;
          box-shadow: 0 0 15px rgba(255,90,0,0.5);
          transition: transform 0.15s, background-color 0.15s;
        }
        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          background: var(--orange-soft);
        }
        .slider-thumb::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--orange);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 15px rgba(255,90,0,0.5);
          transition: transform 0.15s, background-color 0.15s;
        }
        .slider-thumb::-moz-range-thumb:hover {
          transform: scale(1.2);
          background: var(--orange-soft);
        }


        @media (max-width: 640px) {
          .te-artisti-root {
            -webkit-text-size-adjust: 100%;
          }

          .te-glass {
            backdrop-filter: blur(12px) saturate(140%);
            -webkit-backdrop-filter: blur(12px) saturate(140%);
          }

          .te-tilt {
            transform: none !important;
          }

          .te-tilt::after {
            display: none;
          }

          input[type="range"].slider-thumb {
            height: 10px;
          }

          .te-mobile-tight {
            padding-top: 3rem !important;
            padding-bottom: 3rem !important;
          }

          .te-mobile-card {
            border-radius: 1.5rem !important;
            padding: 1.25rem !important;
          }

          .te-mobile-nowrap {
            white-space: normal !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .te-tilt, [data-reveal] { transition: none !important; transform: none !important; }
          .te-shimmer, .te-cta::before { animation: none !important; }
        }
      `}</style>

      <div className="te-grain" />

      {/* ===================== NAVBAR ===================== */}
      <nav className="fixed top-0 inset-x-0 z-50 px-4 pt-4">
        <div className="te-glass max-w-6xl mx-auto rounded-full px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center shrink-0">
            <span className="te-display font-extrabold text-base sm:text-lg tracking-tight">
              TUTTO<span className="text-[var(--orange)]">EVENTO</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-[var(--muted)]">
            <a href="#benefici" className="hover:text-[var(--orange)] transition">I Vantaggi</a>
            <a href="#calcolatore" className="hover:text-[var(--orange)] transition">Calcola Guadagni</a>
            <a href="#recensioni" className="hover:text-[var(--orange)] transition">Testimonianze</a>
            <a href="#faq" className="hover:text-[var(--orange)] transition">Domande Frequenti</a>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm font-bold text-[var(--ink)] px-4 py-2 rounded-full hover:bg-black/5 transition">
              Accedi
            </Link>
            <Link href="/register?role=artist" className="te-cta bg-[var(--orange)] text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-full hover:scale-[1.04] transition whitespace-nowrap te-mobile-nowrap shadow-[0_10px_20px_rgba(255,90,0,0.2)]">
              Iscriviti Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ===================== HERO SECTION ===================== */}
      <section className="relative pt-32 sm:pt-44 pb-20 sm:pb-28 px-5 sm:px-6">
        {/* Sfondi ed effetti sfumati */}
        <div
          aria-hidden
          className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full -z-10 blur-[130px]"
          style={{
            background: "radial-gradient(circle, rgba(255,90,0,.26), rgba(255,130,70,.1) 50%, transparent 70%)",
            animation: "te-float 9s ease-in-out infinite",
          }}
        />
        <div
          aria-hidden
          className="absolute top-[200px] right-[-100px] w-[400px] h-[400px] rounded-full -z-10 blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(255,185,138,.3), transparent 70%)", animation: "te-float2 12s ease-in-out infinite" }}
        />

        <div className="max-w-5xl mx-auto text-center">
          <div data-reveal className="inline-flex items-center gap-2 te-glass rounded-full px-3 sm:px-4 py-1.5 mb-6 sm:mb-8 max-w-[92vw]">
            <span className="w-2 h-2 rounded-full bg-[var(--orange)] shrink-0" style={{ animation: "te-pulse 2s infinite" }} />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] text-[var(--muted)]">CAMPAGNA ACQUISIZIONE ARTISTI 2026</span>
          </div>

          <h1 data-reveal data-delay="1" className="te-display text-[2.5rem] leading-[1] sm:text-6xl sm:leading-[0.95] md:text-7xl font-extrabold mb-6 sm:mb-8 text-[#0a0a0b]">
            Trova più concerti. <br className="hidden sm:block" />
            Gestisci i tuoi ingaggi <br className="hidden sm:block" />
            <span className="te-shimmer">a costo zero</span>.
          </h1>

          <p data-reveal data-delay="2" className="text-base sm:text-xl text-[var(--muted)] max-w-3xl mx-auto mb-10 leading-relaxed">
            Unisciti alla community di TuttoEvento. Crea la tua vetrina professionale, ricevi richieste di booking dai migliori locali della tua zona e incassa <strong className="text-[var(--ink)]">il 100% del tuo cachet netto, senza commissioni e con pagamenti sicuri garantiti</strong>.
          </p>

          <div data-reveal data-delay="3" className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none">
            <Link href="/register?role=artist" className="te-cta w-full sm:w-auto bg-[var(--orange)] text-white px-8 py-4 rounded-full font-bold text-base sm:text-lg hover:bg-[#e85100] transition shadow-[0_18px_40px_-12px_rgba(255,90,0,.6)] text-center">
              Crea il tuo profilo gratis
            </Link>
            <a href="#calcolatore" className="w-full sm:w-auto te-glass text-[var(--ink)] px-8 py-4 rounded-full font-bold text-base sm:text-lg hover:scale-[1.02] transition text-center">
              Calcola quanto guadagni →
            </a>
          </div>

          {/* Icone rapidità */}
          <div data-reveal className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-semibold text-[var(--muted)]">
            <span className="flex items-center gap-1.5">✓ Zero canoni fissi</span>
            <span className="flex items-center gap-1.5">✓ Zero commissioni sul cachet</span>
            <span className="flex items-center gap-1.5">✓ Guadagni netti per l'artista</span>
            <span className="flex items-center gap-1.5">✓ Profilo pronto in 2 minuti</span>
          </div>
        </div>

        {/* Dashboard preview animata per artisti */}
        <div data-reveal data-delay="2" className="max-w-4xl mx-auto mt-16 sm:mt-24 px-1" style={{ perspective: "1600px" }}>
          <div className="relative rounded-3xl overflow-hidden bg-zinc-950 border border-white/10" style={{ boxShadow: "0 40px 95px -30px rgba(0,0,0,.6)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-zinc-900/60">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-3.5 h-3.5 rounded-full bg-green-500/80 inline-block" />
              </div>
              <p className="text-xs text-zinc-500 font-mono">tuttoevento.it/dashboard/artist</p>
              <div className="w-12" />
            </div>

            <div className="p-6 sm:p-10 text-white grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-5 space-y-6">
                <span className="inline-block text-[10px] font-bold tracking-widest text-[var(--orange)] bg-[var(--orange)]/10 px-3 py-1 rounded-full uppercase">Pannello di Controllo Artista</span>
                <h3 className="te-display text-2xl sm:text-3xl font-extrabold leading-tight">La tua carriera, organizzata.</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Controlla i contratti pronti, monitora il tuo calendario serate e ricevi i pagamenti in automatico: il tuo compenso resta netto, senza commissioni trattenute.
                </p>
                <div className="space-y-3.5">
                  <div className="flex items-center gap-3 text-sm font-semibold text-zinc-200">
                    <span className="text-[var(--orange)] text-lg">✦</span> Chat integrata con gli organizzatori
                  </div>
                  <div className="flex items-center gap-3 text-sm font-semibold text-zinc-200">
                    <span className="text-[var(--orange)] text-lg">✦</span> Contratto digitale generato all'istante
                  </div>
                  <div className="flex items-center gap-3 text-sm font-semibold text-zinc-200">
                    <span className="text-[var(--orange)] text-lg">✦</span> Gestione date da cellulare o pc
                  </div>
                </div>
              </div>

              <div className="md:col-span-7 bg-zinc-900 border border-white/5 rounded-2xl p-5 sm:p-6 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div>
                    <h4 className="font-bold text-base">I tuoi prossimi eventi</h4>
                    <p className="text-xs text-zinc-500">Giugno - Luglio 2026</p>
                  </div>
                  <span className="text-xs bg-green-500/10 text-green-400 font-bold px-2.5 py-1 rounded-full">3 date confermate</span>
                </div>

                <div className="space-y-3">
                  {[
                    { locale: "Sunset Beach Club", data: "18 Giu 2026", compenso: "€ 450", status: "Pagamento Confermato" },
                    { locale: "Ristorante La Fenice", data: "27 Giu 2026", compenso: "€ 350", status: "Pagamento Confermato" },
                    { locale: "Open Air Festival", data: "11 Lug 2026", compenso: "€ 800", status: "In attesa deposito" }
                  ].map((evt, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-zinc-950/60 rounded-xl border border-white/5 text-sm">
                      <div>
                        <p className="font-bold text-zinc-100">{evt.locale}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{evt.data}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[var(--orange)]">{evt.compenso}</p>
                        <p className={`text-[10px] font-bold mt-0.5 ${evt.status.includes("Confermato") ? "text-green-400" : "text-yellow-400"}`}>
                          {evt.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== BENEFICI PER GLI ARTISTI ===================== */}
      <section id="benefici" className="py-20 sm:py-28 px-5 sm:px-6 bg-white border-y border-black/5 te-mobile-tight">
        <div className="max-w-6xl mx-auto">
          <div data-reveal className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--orange)] mb-3">Creato per chi si esibisce</p>
            <h2 className="te-display text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-[#0a0a0b]">
              Perché scegliere TuttoEvento per la tua musica o arte?
            </h2>
            <p className="text-base sm:text-lg text-[var(--muted)] mt-4">
              Abbiamo eliminato i problemi tradizionali del settore per permetterti di concentrarti solo sulla tua performance.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "🎸",
                title: "Massima Visibilità",
                desc: "Fatti trovare direttamente da locali, hotel, festival e organizzatori privati che cercano attivamente il tuo genere.",
                glow: "rgba(255,90,0,0.2)"
              },
              {
                icon: "🔒",
                title: "Pagamenti Garantiti",
                desc: "L'organizzatore paga la piattaforma prima dell'evento. Tu suoni tranquillo, noi ti accreditiamo il compenso senza ritardi.",
                glow: "rgba(34,197,94,0.18)"
              },
              {
                icon: "💰",
                title: "Zero Commissioni",
                desc: "Il cachet concordato è tuo: nessuna percentuale, nessuna trattenuta, nessuna sorpresa. Guadagni netti al 100%.",
                glow: "rgba(234,179,8,0.18)"
              },
              {
                icon: "📄",
                title: "Burocrazia Semplificata",
                desc: "Generiamo contratti digitali chiari e validi a livello legale, facilitando la fatturazione o la ritenuta d'acconto.",
                glow: "rgba(168,85,247,0.18)"
              }
            ].map((b, idx) => (
              <TiltCard key={idx} className="rounded-3xl" glow={b.glow}>
                <div data-reveal data-delay={idx} className="bg-[var(--paper)] border border-black/5 rounded-3xl p-6 sm:p-8 h-full flex flex-col justify-between">
                  <div>
                    <span className="text-3xl p-3 bg-white rounded-2xl shadow-sm border border-black/5 inline-block mb-6">{b.icon}</span>
                    <h3 className="te-display text-xl font-extrabold mb-3 text-[#0a0a0b]">{b.title}</h3>
                    <p className="text-sm text-[var(--muted)] leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CALCOLATORE DI GUADAGNI INTERATTIVO ===================== */}
      <section id="calcolatore" className="py-20 sm:py-28 px-5 sm:px-6 bg-[var(--paper)] te-mobile-tight">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-12 gap-10 items-center">
            
            <div data-reveal className="md:col-span-6 space-y-6">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--orange)]">Simula i tuoi compensi</p>
              <h2 className="te-display text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-[#0a0a0b]">
                Scopri quanto puoi guadagnare.
              </h2>
              <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed">
                Utilizza lo slider per impostare il tuo cachet a serata. TuttoEvento non applica commissioni alla tua quota: quello che concordi è quello che incassi, netto al 100%.
              </p>
            </div>

            <div data-reveal data-delay="1" className="md:col-span-6 bg-white border border-black/5 rounded-[2.5rem] p-6 sm:p-10 shadow-xl te-mobile-card">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="text-sm font-bold text-[var(--ink)]">Il tuo Cachet a serata</label>
                    <span className="te-display text-3xl font-extrabold text-[var(--orange)]">€ {cachet}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1500"
                    step="50"
                    value={cachet}
                    onChange={(e) => setCachet(Number(e.target.value))}
                    className="w-full h-2 bg-black/10 rounded-lg appearance-none cursor-pointer outline-none slider-thumb"
                  />
                  <div className="flex justify-between text-xs font-semibold text-[var(--muted)] mt-2">
                    <span>€ 50</span>
                    <span>€ 800</span>
                    <span>€ 1500+</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-black/5 space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Guadagni netti per te (zero commissioni)</p>
                  
                  {[
                    { date: 1, label: "1 data al mese" },
                    { date: 3, label: "3 date al mese" },
                    { date: 6, label: "6 date al mese (stagionale)" }
                  ].map((item, idx) => {
                    const guadagno = cachet * item.date;
                    return (
                      <div key={idx} className="flex justify-between items-center p-3.5 bg-[var(--paper)] rounded-2xl border border-black/5">
                        <div>
                          <p className="font-bold text-sm text-[var(--ink)]">{item.label}</p>
                          <p className="text-[11px] text-[var(--muted)] mt-0.5">Cachet netto, senza trattenute</p>
                        </div>
                        <div className="text-right">
                          <p className="te-display font-extrabold text-lg text-[var(--ink)]">€ {guadagno}</p>
                          <p className="text-[10px] text-green-600 font-bold mt-0.5">netti al 100%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Link href="/register?role=artist" className="te-cta block w-full bg-[var(--ink)] text-white text-center py-4 rounded-2xl font-bold hover:scale-[1.01] transition mt-2">
                  Inizia ora
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===================== SEZIONE TESTIMONIANZE / SOCIAL PROOF ===================== */}
      <section id="recensioni" className="py-20 sm:py-28 px-5 sm:px-6 bg-white border-y border-black/5 te-mobile-tight">
        <div className="max-w-6xl mx-auto">
          <div data-reveal className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--orange)] mb-3">La voce della community</p>
            <h2 className="te-display text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-[#0a0a0b]">
              Cosa dicono gli artisti iscritti
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "Prima perdevo ore a fare preventivi e riscuotere i pagamenti. Con TuttoEvento ricevo richieste profilate e ho la certezza del pagamento il giorno dopo la serata. Ho riempito la mia estate.",
                author: "Gabriele B.",
                role: "DJ & Producer",
                stars: 5,
                img: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?auto=format&fit=crop&w=150&q=80"
              },
              {
                quote: "Abbiamo iniziato da pochi mesi e abbiamo già ottenuto 8 date per eventi aziendali e matrimoni. I locali apprezzano la trasparenza e noi adoriamo l'assenza di scartoffie burocratiche.",
                author: "Elena & Max",
                role: "Duo Acustico",
                stars: 5,
                img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=150&q=80"
              },
              {
                quote: "Finalmente un portale che valorizza l'intrattenimento di qualità. La dashboard mi permette di gestire il mio calendario ed emettere contratti in pochi click. Non ne posso più fare a meno.",
                author: "Christian R.",
                role: "Performer & Illusionista",
                stars: 5,
                img: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=150&q=80"
              }
            ].map((t, idx) => (
              <div key={idx} data-reveal data-delay={idx} className="bg-[var(--paper)] border border-black/5 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition duration-300">
                <div>
                  <div className="flex gap-1 mb-5">
                    {[...Array(t.stars)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-[var(--muted)] italic leading-relaxed mb-6">
                    “{t.quote}”
                  </p>
                </div>
                <div className="flex items-center gap-3.5 pt-4 border-t border-black/5">
                  <img src={t.img} alt={t.author} className="w-11 h-11 rounded-full object-cover" />
                  <div>
                    <p className="font-bold text-sm text-[var(--ink)]">{t.author}</p>
                    <p className="text-xs text-[var(--muted)] font-semibold mt-0.5">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FAQ ACCORDION ===================== */}
      <section id="faq" className="py-20 sm:py-28 px-5 sm:px-6 te-mobile-tight">
        <div className="max-w-4xl mx-auto">
          <div data-reveal className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--orange)] mb-3">Tutte le risposte</p>
            <h2 className="te-display text-3xl sm:text-4xl font-extrabold text-[#0a0a0b]">Domande Frequenti</h2>
          </div>

          <div data-reveal className="space-y-4">
            {faqs.map((faq, index) => {
              const active = openFaq === index;
              return (
                <div key={index} className="bg-white border border-black/5 rounded-2xl overflow-hidden transition-all duration-300">
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-base sm:text-lg text-[var(--ink)] hover:bg-zinc-50/50 transition"
                  >
                    <span>{faq.q}</span>
                    <span className={`w-6 h-6 rounded-full bg-[var(--paper)] text-[var(--muted)] flex items-center justify-center font-mono text-sm transition-transform duration-300 ${active ? "rotate-180" : ""}`}>
                      ▼
                    </span>
                  </button>
                  <div
                    className={`transition-all duration-350 ease-in-out ${active ? "max-h-60 border-t border-black/5" : "max-h-0 opacity-0"}`}
                    style={{ overflow: "hidden" }}
                  >
                    <p className="p-5 text-sm sm:text-base text-[var(--muted)] leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== CTA FINALE ===================== */}
      <section className="px-5 sm:px-6 pb-6 sm:pb-10">
        <div data-reveal className="max-w-5xl mx-auto relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden text-center px-6 py-16 sm:px-8 sm:py-24">
          <img src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1600&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,10,11,.92), rgba(26,20,15,.82))" }} />
          <div aria-hidden className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] max-w-[90vw] rounded-full blur-[110px]"
            style={{ background: "radial-gradient(circle, rgba(255,90,0,.55), transparent 70%)", animation: "te-float 8s ease-in-out infinite" }} />
          
          <h2 className="te-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5 relative">
            Non aspettare la prossima chiamata. <br />
            <span className="te-shimmer">Fatti trovare</span>.
          </h2>
          <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto mb-8 sm:mb-10 relative">
            Crea oggi stesso il tuo account gratuito su TuttoEvento, carica le tue demo e ricevi richieste da locali e privati.
          </p>
          <div className="relative flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto sm:max-w-none">
            <Link href="/register?role=artist" className="te-cta bg-[var(--orange)] text-white px-8 sm:px-10 py-4 rounded-full font-bold text-base sm:text-lg hover:bg-[#e85100] transition shadow-[0_18px_40px_-12px_rgba(255,90,0,.7)] text-center">
              Crea account gratuito
            </Link>
            <Link href="/login" className="bg-white/10 text-white border border-white/15 px-8 sm:px-10 py-4 rounded-full font-bold text-base sm:text-lg hover:bg-white/15 transition backdrop-blur text-center">
              Accedi al tuo account
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t border-black/5 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <span className="te-display font-extrabold text-lg tracking-tight mb-4 inline-block">
              TUTTO<span className="text-[var(--orange)]">EVENTO</span>
            </span>
            <p className="text-[var(--muted)] max-w-sm leading-relaxed">
              La piattaforma professionale per artisti, promoter e locali. Trova serate, gestisci contratti e ricevi pagamenti sicuri.
            </p>
          </div>
          <div>
            <p className="te-display font-bold mb-3 text-sm">Sezioni Landing</p>
            <ul className="space-y-2 text-sm text-[var(--muted)] font-semibold">
              <li><a href="#benefici" className="hover:text-[var(--orange)]">I vantaggi</a></li>
              <li><a href="#calcolatore" className="hover:text-[var(--orange)]">Calcola guadagni</a></li>
              <li><a href="#recensioni" className="hover:text-[var(--orange)]">Testimonianze</a></li>
              <li><a href="#faq" className="hover:text-[var(--orange)]">FAQ</a></li>
            </ul>
          </div>
          <div>
            <p className="te-display font-bold mb-3 text-sm">Collegamenti</p>
            <ul className="space-y-2 text-sm text-[var(--muted)] font-semibold">
              <li><Link href="/" className="hover:text-[var(--orange)]">Home principale</Link></li>
              <li><Link href="/login" className="hover:text-[var(--orange)]">Accedi</Link></li>
              <li><Link href="/register?role=artist" className="hover:text-[var(--orange)]">Registrati come Artista</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-black/5 py-6 text-center text-xs text-[var(--muted)]">
          © 2026 TuttoEvento. Tutti i diritti riservati.
        </div>
      </footer>
    </main>
  );
}
