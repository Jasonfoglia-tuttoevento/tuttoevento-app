"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* Hook per l'animazione al passaggio dello scroll */
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
    const rx = (py - 0.5) * -9;
    const ry = (px - 0.5) * 11;

    setStyle({
      transform: `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`,
      "--mx": `${px * 100}%`,
      "--my": `${py * 100}%`,
      "--glow": glow,
    });
  }

  function reset() {
    setStyle({
      transform: "perspective(900px) rotateX(0) rotateY(0) translateY(0)",
    });
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

export default function LocaliLandingClient() {
  useReveal();

  const [budget, setBudget] = useState(300);
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Quanto costa cercare artisti su TuttoEvento?",
      a: "La registrazione è gratuita. Puoi creare il tuo profilo locale, pubblicare richieste e ricevere proposte dagli artisti. Il costo finale dipende dal cachet dell'artista scelto e dal servizio richiesto.",
    },
    {
      q: "Posso trovare artisti anche per eventi privati o aziendali?",
      a: "Sì. TuttoEvento è pensato per locali, ristoranti, hotel, beach club, discoteche, wedding planner, aziende e privati che vogliono trovare artisti affidabili per eventi, serate e intrattenimento.",
    },
    {
      q: "Come funziona il pagamento?",
      a: "Il pagamento viene gestito in modo protetto. Confermi la prenotazione, versi l'importo concordato e l'artista riceve il compenso dopo l'evento. In questo modo entrambe le parti sono tutelate.",
    },
    {
      q: "Gli artisti sono verificati?",
      a: "Ogni profilo può includere foto, video, descrizione, genere, disponibilità, area di lavoro e recensioni. Questo ti permette di valutare rapidamente l'artista più adatto alla tua serata.",
    },
    {
      q: "Posso gestire più eventi contemporaneamente?",
      a: "Sì. Dalla dashboard puoi monitorare richieste, artisti contattati, eventi confermati, pagamenti e comunicazioni in un unico spazio.",
    },
  ];

  return (
    <main className="te-locali-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');

        .te-locali-root {
          --orange: #ff5a00;
          --orange-soft: #ff8a3d;
          --ink: #09090b;
          --night: #111114;
          --paper: #fbfaf8;
          --cream: #fff7ef;
          --muted: #6b6b73;
          --gold: #f6b14a;
          font-family: 'Manrope', system-ui, sans-serif;
          background: var(--paper);
          color: var(--ink);
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
        }

        .te-locali-root ::selection {
          background: var(--orange);
          color: #fff;
        }

        .te-display {
          font-family: 'Sora', sans-serif;
          letter-spacing: -0.035em;
        }

        .te-grain::before {
          content: "";
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        [data-reveal] {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1);
        }

        [data-reveal].is-visible {
          opacity: 1;
          transform: none;
        }

        [data-reveal][data-delay="1"] {
          transition-delay: .08s;
        }

        [data-reveal][data-delay="2"] {
          transition-delay: .16s;
        }

        [data-reveal][data-delay="3"] {
          transition-delay: .24s;
        }

        .te-tilt {
          transition: transform .25s cubic-bezier(.2,.7,.2,1);
          transform-style: preserve-3d;
          will-change: transform;
          position: relative;
        }

        .te-tilt::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          background: radial-gradient(
            420px circle at var(--mx,50%) var(--my,50%),
            var(--glow,rgba(255,90,0,.18)),
            transparent 45%
          );
          opacity: 0;
          transition: opacity .3s;
        }

        .te-tilt:hover::after {
          opacity: 1;
        }

        @keyframes te-float {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(0,-24px) scale(1.03); }
        }

        @keyframes te-float2 {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(18px,14px); }
        }

        @keyframes te-spin {
          to { transform: rotate(360deg); }
        }

        @keyframes te-pulse {
          0%,100% { opacity:.5; }
          50% { opacity:1; }
        }

        @keyframes te-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @keyframes te-shimmer-move {
          to { background-position: -200% 0; }
        }

        .te-shimmer {
          background: linear-gradient(
            100deg,
            var(--orange) 0%,
            var(--orange-soft) 38%,
            #ffc27d 50%,
            var(--orange-soft) 62%,
            var(--orange) 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: te-shimmer-move 6s linear infinite;
        }

        .te-cta {
          position: relative;
          isolation: isolate;
        }

        .te-cta::before {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: 999px;
          z-index: -1;
          background: conic-gradient(from 0deg, var(--orange), #ffcf91, var(--orange));
          opacity: 0;
          transition: opacity .35s;
          filter: blur(8px);
        }

        .te-cta:hover::before {
          opacity: .55;
          animation: te-spin 4s linear infinite;
        }

        .te-glass {
          background: rgba(255,255,255,0.68);
          backdrop-filter: blur(18px) saturate(160%);
          -webkit-backdrop-filter: blur(18px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.72);
          box-shadow: 0 1px 0 rgba(255,255,255,.6) inset, 0 30px 60px -30px rgba(20,12,0,.25);
        }

        .te-dark-glass {
          background: rgba(16,16,18,0.82);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 30px 80px -35px rgba(0,0,0,.8);
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
          .te-locali-root {
            -webkit-text-size-adjust: 100%;
          }

          .te-glass,
          .te-dark-glass {
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
        }

        @media (prefers-reduced-motion: reduce) {
          .te-tilt,
          [data-reveal] {
            transition: none !important;
            transform: none !important;
          }

          .te-shimmer,
          .te-cta::before {
            animation: none !important;
          }
        }
      `}</style>

      <div className="te-grain" />

      {/* NAVBAR */}
      <nav className="fixed top-0 inset-x-0 z-50 px-4 pt-4">
        <div className="te-glass max-w-6xl mx-auto rounded-full px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center shrink-0">
            <span className="te-display font-extrabold text-base sm:text-lg tracking-tight">
              TUTTO<span className="text-[var(--orange)]">EVENTO</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-[var(--muted)]">
            <a href="#vantaggi" className="hover:text-[var(--orange)] transition">
              Vantaggi
            </a>
            <a href="#come-funziona" className="hover:text-[var(--orange)] transition">
              Come funziona
            </a>
            <a href="#budget" className="hover:text-[var(--orange)] transition">
              Budget
            </a>
            <a href="#faq" className="hover:text-[var(--orange)] transition">
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm font-bold text-[var(--ink)] px-4 py-2 rounded-full hover:bg-black/5 transition"
            >
              Accedi
            </Link>
            <Link
              href="/register?role=organizer"
              className="te-cta bg-[var(--orange)] text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-full hover:scale-[1.04] transition whitespace-nowrap shadow-[0_10px_20px_rgba(255,90,0,0.22)]"
            >
              Trova artisti
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 sm:pt-44 pb-16 sm:pb-24 px-5 sm:px-6 overflow-hidden">
        <div
          aria-hidden
          className="absolute top-[-160px] left-1/2 -translate-x-1/2 w-[760px] h-[760px] rounded-full -z-10 blur-[130px]"
          style={{
            background:
              "radial-gradient(circle, rgba(255,90,0,.30), rgba(255,177,74,.13) 48%, transparent 72%)",
            animation: "te-float 9s ease-in-out infinite",
          }}
        />

        <div
          aria-hidden
          className="absolute top-[170px] right-[-160px] w-[480px] h-[480px] rounded-full -z-10 blur-[110px]"
          style={{
            background:
              "radial-gradient(circle, rgba(255,210,150,.35), transparent 70%)",
            animation: "te-float2 12s ease-in-out infinite",
          }}
        />

        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 text-center lg:text-left">
            <div
              data-reveal
              className="inline-flex items-center gap-2 te-glass rounded-full px-3 sm:px-4 py-1.5 mb-6 sm:mb-8 max-w-[92vw]"
            >
              <span
                className="w-2 h-2 rounded-full bg-[var(--orange)] shrink-0"
                style={{ animation: "te-pulse 2s infinite" }}
              />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] text-[var(--muted)]">
                CAMPAGNA ACQUISIZIONE LOCALI 2026
              </span>
            </div>

            <h1
              data-reveal
              data-delay="1"
              className="te-display text-[2.55rem] leading-[1] sm:text-6xl sm:leading-[0.95] md:text-7xl font-extrabold mb-6 sm:mb-8 text-[#0a0a0b]"
            >
              Riempi il tuo locale. <br />
              Trova l'artista giusto <br />
              <span className="te-shimmer">in pochi click</span>.
            </h1>

            <p
              data-reveal
              data-delay="2"
              className="text-base sm:text-xl text-[var(--muted)] max-w-2xl mx-auto lg:mx-0 mb-9 leading-relaxed"
            >
              Con TuttoEvento trovi DJ, band, cantanti, performer e animatori
              per serate, eventi privati, cene spettacolo e format ricorrenti.
              Gestisci richieste, preventivi, chat e pagamenti da un'unica
              dashboard.
            </p>

            <div
              data-reveal
              data-delay="3"
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 max-w-md mx-auto lg:mx-0 sm:max-w-none"
            >
              <Link
                href="/register?role=organizer"
                className="te-cta w-full sm:w-auto bg-[var(--orange)] text-white px-8 py-4 rounded-full font-bold text-base sm:text-lg hover:bg-[#e85100] transition shadow-[0_18px_40px_-12px_rgba(255,90,0,.6)] text-center"
              >
                Pubblica una richiesta gratis
              </Link>

              <a
                href="#come-funziona"
                className="w-full sm:w-auto te-glass text-[var(--ink)] px-8 py-4 rounded-full font-bold text-base sm:text-lg hover:scale-[1.02] transition text-center"
              >
                Scopri come funziona →
              </a>
            </div>

            <div
              data-reveal
              className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-xs font-semibold text-[var(--muted)]"
            >
              <span>✓ Artisti filtrati per zona</span>
              <span>✓ Preventivi rapidi</span>
              <span>✓ Pagamenti protetti</span>
              <span>✓ Ideale per locali ed eventi</span>
            </div>
          </div>

          {/* HERO CARD */}
          <div data-reveal data-delay="2" className="lg:col-span-6">
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-6 rounded-[3rem] blur-3xl opacity-50"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,90,0,.30), rgba(246,177,74,.22), transparent)",
                }}
              />

              <div className="relative te-dark-glass rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden text-white">
                <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/45 font-mono">
                      tuttoevento.it/locali
                    </p>
                    <h3 className="te-display text-xl font-extrabold mt-1">
                      Richieste in arrivo
                    </h3>
                  </div>
                  <span className="bg-green-500/12 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full">
                    Live
                  </span>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  {[
                    {
                      type: "DJ Set",
                      place: "Venerdì sera · Rooftop Bar",
                      budget: "€ 350 - € 500",
                      matches: "12 artisti disponibili",
                    },
                    {
                      type: "Duo Acustico",
                      place: "Cena spettacolo · Ristorante",
                      budget: "€ 250 - € 400",
                      matches: "8 artisti disponibili",
                    },
                    {
                      type: "Band Live",
                      place: "Evento aziendale · Hotel",
                      budget: "€ 700 - € 1.200",
                      matches: "6 artisti disponibili",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white/[0.06] border border-white/10 rounded-2xl p-4 hover:bg-white/[0.08] transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-extrabold text-white">{item.type}</p>
                          <p className="text-sm text-white/50 mt-1">{item.place}</p>
                        </div>
                        <p className="text-sm font-bold text-[var(--orange-soft)] whitespace-nowrap">
                          {item.budget}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-xs font-bold text-green-400">
                          {item.matches}
                        </p>
                        <button className="text-xs font-bold bg-white text-black px-3 py-1.5 rounded-full">
                          Vedi profili
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-5 sm:px-6 pb-6 grid grid-cols-3 gap-3">
                  {[
                    ["24h", "tempo medio risposta"],
                    ["150+", "categorie artistiche"],
                    ["0", "stress operativo"],
                  ].map((stat, idx) => (
                    <div
                      key={idx}
                      className="bg-black/20 border border-white/10 rounded-2xl p-3 text-center"
                    >
                      <p className="te-display text-xl sm:text-2xl font-extrabold text-white">
                        {stat[0]}
                      </p>
                      <p className="text-[10px] text-white/45 mt-1 leading-tight">
                        {stat[1]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOGHI / MARQUEE */}
      <section className="py-6 bg-[var(--night)] overflow-hidden">
        <div className="flex whitespace-nowrap" style={{ animation: "te-marquee 26s linear infinite" }}>
          {[
            "Ristoranti",
            "Beach Club",
            "Hotel",
            "Rooftop Bar",
            "Discoteche",
            "Wedding Planner",
            "Aziende",
            "Eventi Privati",
            "Festival",
            "Locali Live",
            "Ristoranti",
            "Beach Club",
            "Hotel",
            "Rooftop Bar",
            "Discoteche",
            "Wedding Planner",
            "Aziende",
            "Eventi Privati",
            "Festival",
            "Locali Live",
          ].map((item, idx) => (
            <span
              key={idx}
              className="mx-6 text-white/55 text-sm sm:text-base font-bold uppercase tracking-[0.16em]"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* VANTAGGI */}
      <section id="vantaggi" className="py-20 sm:py-28 px-5 sm:px-6 bg-white border-y border-black/5">
        <div className="max-w-6xl mx-auto">
          <div data-reveal className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--orange)] mb-3">
              Pensato per chi organizza eventi
            </p>
            <h2 className="te-display text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-[#0a0a0b]">
              Meno telefonate, meno rischio, più serate riuscite.
            </h2>
            <p className="text-base sm:text-lg text-[var(--muted)] mt-4">
              Trova artisti adatti al tuo pubblico, confronta proposte e conferma
              la serata con un flusso semplice e professionale.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "🎧",
                title: "Artisti per ogni format",
                desc: "DJ set, live band, cantanti, performer, animatori, cabaret, magia e intrattenimento per ogni tipo di pubblico.",
                glow: "rgba(255,90,0,0.22)",
              },
              {
                icon: "📍",
                title: "Ricerca geolocalizzata",
                desc: "Trova talenti disponibili nella tua zona, riducendo tempi di ricerca, costi di trasferta e messaggi inutili.",
                glow: "rgba(59,130,246,0.18)",
              },
              {
                icon: "💬",
                title: "Chat e preventivi",
                desc: "Parla direttamente con gli artisti, ricevi proposte chiare e confronta le opzioni prima di confermare.",
                glow: "rgba(168,85,247,0.18)",
              },
              {
                icon: "🔒",
                title: "Pagamento protetto",
                desc: "Confermi la prenotazione in sicurezza e riduci problemi di accordi, disdette e pagamenti non tracciati.",
                glow: "rgba(34,197,94,0.18)",
              },
            ].map((b, idx) => (
              <TiltCard key={idx} className="rounded-3xl" glow={b.glow}>
                <div
                  data-reveal
                  data-delay={idx}
                  className="bg-[var(--paper)] border border-black/5 rounded-3xl p-6 sm:p-8 h-full flex flex-col justify-between"
                >
                  <div>
                    <span className="text-3xl p-3 bg-white rounded-2xl shadow-sm border border-black/5 inline-block mb-6">
                      {b.icon}
                    </span>
                    <h3 className="te-display text-xl font-extrabold mb-3 text-[#0a0a0b]">
                      {b.title}
                    </h3>
                    <p className="text-sm text-[var(--muted)] leading-relaxed">
                      {b.desc}
                    </p>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* COME FUNZIONA */}
      <section id="come-funziona" className="py-20 sm:py-28 px-5 sm:px-6 bg-[var(--paper)]">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div data-reveal className="lg:col-span-5">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--orange)] mb-3">
                Processo semplice
              </p>
              <h2 className="te-display text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-[#0a0a0b]">
                Dal bisogno alla serata confermata.
              </h2>
              <p className="text-base sm:text-lg text-[var(--muted)] mt-5 leading-relaxed">
                Pubblica quello che ti serve, ricevi candidature coerenti e scegli
                l'artista più adatto al tuo locale o evento.
              </p>
            </div>

            <div className="lg:col-span-7 grid gap-5">
              {[
                {
                  step: "01",
                  title: "Pubblica la richiesta",
                  desc: "Indica data, città, tipo di evento, genere desiderato, budget e informazioni utili.",
                },
                {
                  step: "02",
                  title: "Ricevi proposte dagli artisti",
                  desc: "Gli artisti disponibili ti inviano disponibilità, cachet, materiali e dettagli della performance.",
                },
                {
                  step: "03",
                  title: "Confermi e gestisci tutto online",
                  desc: "Chat, accordi, conferma, pagamento e riepilogo evento restano organizzati in dashboard.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  data-reveal
                  data-delay={idx}
                  className="bg-white border border-black/5 rounded-3xl p-6 sm:p-7 flex gap-5 shadow-sm"
                >
                  <div className="shrink-0 w-12 h-12 rounded-2xl bg-[var(--ink)] text-white flex items-center justify-center te-display font-extrabold">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="te-display text-xl font-extrabold text-[var(--ink)]">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-base text-[var(--muted)] mt-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BUDGET */}
      <section id="budget" className="py-20 sm:py-28 px-5 sm:px-6 bg-white border-y border-black/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-12 gap-10 items-center">
            <div data-reveal className="md:col-span-6 space-y-6">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--orange)]">
                Simula il budget della serata
              </p>
              <h2 className="te-display text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-[#0a0a0b]">
                Parti dal budget e trova il talento giusto.
              </h2>
              <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed">
                Ogni evento ha un obiettivo diverso: aperitivo, cena spettacolo,
                festa privata, DJ set o live music. Imposta un budget indicativo
                e valuta quale format può essere più adatto.
              </p>
            </div>

            <div
              data-reveal
              data-delay="1"
              className="md:col-span-6 bg-[var(--paper)] border border-black/5 rounded-[2.5rem] p-6 sm:p-10 shadow-xl"
            >
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="text-sm font-bold text-[var(--ink)]">
                      Budget indicativo
                    </label>
                    <span className="te-display text-3xl font-extrabold text-[var(--orange)]">
                      € {budget}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="50"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full h-2 bg-black/10 rounded-lg appearance-none cursor-pointer outline-none slider-thumb"
                  />

                  <div className="flex justify-between text-xs font-semibold text-[var(--muted)] mt-2">
                    <span>€ 100</span>
                    <span>€ 1.000</span>
                    <span>€ 2.000+</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-black/5 space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                    Format consigliati
                  </p>

                  {[
                    {
                      min: 100,
                      max: 300,
                      label: "Aperitivo / piccolo evento",
                      desc: "DJ set light, cantante solista o musicista acustico.",
                    },
                    {
                      min: 300,
                      max: 700,
                      label: "Serata locale / cena spettacolo",
                      desc: "DJ, duo acustico, performer o live set strutturato.",
                    },
                    {
                      min: 700,
                      max: 2000,
                      label: "Evento premium",
                      desc: "Band live, show completo, corporate event o grande format.",
                    },
                  ].map((item, idx) => {
                    const active = budget >= item.min && budget <= item.max;

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border transition ${
                          active
                            ? "bg-white border-[var(--orange)] shadow-md"
                            : "bg-white/55 border-black/5"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-bold text-sm text-[var(--ink)]">
                            {item.label}
                          </p>
                          {active && (
                            <span className="text-[10px] text-white bg-[var(--orange)] font-bold px-2 py-1 rounded-full">
                              consigliato
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <Link
                  href="/register?role=organizer"
                  className="te-cta block w-full bg-[var(--ink)] text-white text-center py-4 rounded-2xl font-bold hover:scale-[1.01] transition mt-2"
                >
                  Inizia ora
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIANZE */}
      <section className="py-20 sm:py-28 px-5 sm:px-6 bg-[var(--paper)]">
        <div className="max-w-6xl mx-auto">
          <div data-reveal className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--orange)] mb-3">
              Locali più organizzati
            </p>
            <h2 className="te-display text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-[#0a0a0b]">
              Serate migliori, gestione più semplice.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "Prima cercavamo DJ e musicisti tramite passaparola. Ora pubblichiamo la richiesta, confrontiamo le proposte e confermiamo tutto dalla dashboard.",
                author: "Luca M.",
                role: "Rooftop Bar Manager",
                stars: 5,
                img: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&w=150&q=80",
              },
              {
                quote:
                  "Per le nostre cene spettacolo è diventato molto più semplice trovare artisti coerenti con il tipo di clientela e con il budget della serata.",
                author: "Sara P.",
                role: "Restaurant Owner",
                stars: 5,
                img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=150&q=80",
              },
              {
                quote:
                  "Gestiamo eventi aziendali e privati. Avere chat, profili, preventivi e pagamenti in un unico posto ci fa risparmiare tantissimo tempo.",
                author: "Andrea R.",
                role: "Event Planner",
                stars: 5,
                img: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=150&q=80",
              },
            ].map((t, idx) => (
              <div
                key={idx}
                data-reveal
                data-delay={idx}
                className="bg-white border border-black/5 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition duration-300"
              >
                <div>
                  <div className="flex gap-1 mb-5">
                    {[...Array(t.stars)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-lg">
                        ★
                      </span>
                    ))}
                  </div>

                  <p className="text-sm sm:text-base text-[var(--muted)] italic leading-relaxed mb-6">
                    “{t.quote}”
                  </p>
                </div>

                <div className="flex items-center gap-3.5 pt-4 border-t border-black/5">
                  <img
                    src={t.img}
                    alt={t.author}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-sm text-[var(--ink)]">
                      {t.author}
                    </p>
                    <p className="text-xs text-[var(--muted)] font-semibold mt-0.5">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 sm:py-24 px-5 sm:px-6 bg-white border-y border-black/5">
        <div className="max-w-4xl mx-auto">
          <div data-reveal className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--orange)] mb-3">
              Tutte le risposte
            </p>
            <h2 className="te-display text-3xl sm:text-4xl font-extrabold text-[#0a0a0b]">
              Domande Frequenti
            </h2>
          </div>

          <div data-reveal className="space-y-4">
            {faqs.map((faq, index) => {
              const active = openFaq === index;

              return (
                <div
                  key={index}
                  className="bg-[var(--paper)] border border-black/5 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left font-bold text-base sm:text-lg text-[var(--ink)] hover:bg-white/70 transition"
                  >
                    <span>{faq.q}</span>
                    <span
                      className={`w-6 h-6 shrink-0 rounded-full bg-white text-[var(--muted)] flex items-center justify-center font-mono text-sm transition-transform duration-300 ${
                        active ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  <div
                    className={`transition-all duration-350 ease-in-out ${
                      active ? "max-h-60 border-t border-black/5" : "max-h-0 opacity-0"
                    }`}
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

      {/* CTA FINALE */}
      <section className="px-5 sm:px-6 py-14 sm:py-20 bg-[var(--paper)]">
        <div
          data-reveal
          className="max-w-5xl mx-auto relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden text-center px-6 py-16 sm:px-8 sm:py-24"
        >
          <img
            src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1600&q=80"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(9,9,11,.94), rgba(34,22,13,.84))",
            }}
          />

          <div
            aria-hidden
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] max-w-[90vw] rounded-full blur-[110px]"
            style={{
              background:
                "radial-gradient(circle, rgba(255,90,0,.55), transparent 70%)",
              animation: "te-float 8s ease-in-out infinite",
            }}
          />

          <h2 className="te-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5 relative">
            La prossima serata può essere <br />
            <span className="te-shimmer">più semplice da organizzare</span>.
          </h2>

          <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto mb-8 sm:mb-10 relative">
            Crea il profilo del tuo locale, pubblica una richiesta gratuita e
            trova artisti disponibili per il tuo prossimo evento.
          </p>

          <div className="relative flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto sm:max-w-none">
            <Link
              href="/register?role=organizer"
              className="te-cta bg-[var(--orange)] text-white px-8 sm:px-10 py-4 rounded-full font-bold text-base sm:text-lg hover:bg-[#e85100] transition shadow-[0_18px_40px_-12px_rgba(255,90,0,.7)] text-center"
            >
              Pubblica una richiesta gratis
            </Link>

            <Link
              href="/login"
              className="bg-white/10 text-white border border-white/15 px-8 sm:px-10 py-4 rounded-full font-bold text-base sm:text-lg hover:bg-white/15 transition backdrop-blur text-center"
            >
              Accedi al tuo account
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/5 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <span className="te-display font-extrabold text-lg tracking-tight mb-4 inline-block">
              TUTTO<span className="text-[var(--orange)]">EVENTO</span>
            </span>
            <p className="text-[var(--muted)] max-w-sm leading-relaxed">
              La piattaforma professionale per locali, organizzatori, artisti e
              promoter. Trova talenti, gestisci eventi e semplifica ogni booking.
            </p>
          </div>

          <div>
            <p className="te-display font-bold mb-3 text-sm">Sezioni Landing</p>
            <ul className="space-y-2 text-sm text-[var(--muted)] font-semibold">
              <li>
                <a href="#vantaggi" className="hover:text-[var(--orange)]">
                  Vantaggi
                </a>
              </li>
              <li>
                <a href="#come-funziona" className="hover:text-[var(--orange)]">
                  Come funziona
                </a>
              </li>
              <li>
                <a href="#budget" className="hover:text-[var(--orange)]">
                  Budget
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[var(--orange)]">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="te-display font-bold mb-3 text-sm">Collegamenti</p>
            <ul className="space-y-2 text-sm text-[var(--muted)] font-semibold">
              <li>
                <Link href="/" className="hover:text-[var(--orange)]">
                  Home principale
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[var(--orange)]">
                  Accedi
                </Link>
              </li>
              <li>
                <Link href="/register?role=organizer" className="hover:text-[var(--orange)]">
                  Registrati come Locale
                </Link>
              </li>
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