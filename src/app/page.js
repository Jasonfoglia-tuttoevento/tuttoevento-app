"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* Hook reveal on scroll */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    els.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, []);
}

/* Card tilt */
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

export default function HomePage() {
  useReveal();

  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "TuttoEvento è per artisti o per locali?",
      a: "Per entrambi. Gli artisti possono creare un profilo professionale e ricevere richieste di booking. Locali, organizer e aziende possono trovare artisti, inviare richieste e gestire eventi da una dashboard unica.",
    },
    {
      q: "Gli artisti pagano commissioni?",
      a: "No. Uno dei punti centrali di TuttoEvento è permettere agli artisti di ricevere il proprio compenso netto, senza commissioni trattenute sul cachet concordato.",
    },
    {
      q: "Cosa può fare un locale su TuttoEvento?",
      a: "Un locale può pubblicare richieste, cercare artisti per genere e zona, confrontare proposte, chattare con gli artisti, confermare booking e gestire eventi e pagamenti in modo organizzato.",
    },
    {
      q: "C'è una chat integrata?",
      a: "Sì. La piattaforma include una chat istantanea per far comunicare artisti, locali e organizer senza perdere conversazioni tra WhatsApp, email e telefonate.",
    },
    {
      q: "TuttoEvento funziona anche da mobile?",
      a: "Sì. L'esperienza è pensata per essere usata anche da smartphone, con dashboard, booking, chat e gestione profilo accessibili in modo rapido.",
    },
  ];

  return (
    <main className="te-home-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');

        .te-home-root {
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

        .te-home-root ::selection {
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
          background: rgba(16,16,18,0.84);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 30px 80px -35px rgba(0,0,0,.8);
        }

        @media (max-width: 640px) {
          .te-home-root {
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

          .te-mobile-safe {
            padding-bottom: calc(2rem + env(safe-area-inset-bottom));
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
        <div className="te-glass max-w-6xl mx-auto rounded-full px-4 sm:px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center shrink-0">
            <span className="te-display font-extrabold text-base sm:text-lg tracking-tight">
              TUTTO<span className="text-[var(--orange)]">EVENTO</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-[var(--muted)]">
            <a href="#per-chi" className="hover:text-[var(--orange)] transition">
              Per chi è
            </a>
            <a href="#features" className="hover:text-[var(--orange)] transition">
              Features
            </a>
            <a href="#dashboard" className="hover:text-[var(--orange)] transition">
              Dashboard
            </a>
            <a href="#faq" className="hover:text-[var(--orange)] transition">
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:block text-sm font-bold text-[var(--ink)] px-4 py-2 rounded-full hover:bg-black/5 transition"
            >
              Accedi
            </Link>

            <Link
              href="/register"
              className="te-cta bg-[var(--orange)] text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-full hover:scale-[1.04] transition whitespace-nowrap shadow-[0_10px_20px_rgba(255,90,0,0.22)]"
            >
              Inizia gratis
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
                La piattaforma all-in-one per eventi, artisti e locali
              </span>
            </div>

            <h1
              data-reveal
              data-delay="1"
              className="te-display text-[2.55rem] leading-[1] sm:text-6xl sm:leading-[0.95] md:text-7xl font-extrabold mb-6 sm:mb-8 text-[#0a0a0b]"
            >
              Tutto il mondo degli eventi. <br />
              In un'unica <br />
              <span className="te-shimmer">piattaforma</span>.
            </h1>

            <p
              data-reveal
              data-delay="2"
              className="text-base sm:text-xl text-[var(--muted)] max-w-2xl mx-auto lg:mx-0 mb-9 leading-relaxed"
            >
              TuttoEvento connette artisti, locali, organizer e promoter.
              Trovi talenti, ricevi richieste, chatti in tempo reale, gestisci
              booking, pagamenti e dashboard senza dispersione.
            </p>

            <div
              data-reveal
              data-delay="3"
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 max-w-md mx-auto lg:mx-0 sm:max-w-none"
            >
              <Link
                href="/artisti"
                className="te-cta w-full sm:w-auto bg-[var(--orange)] text-white px-8 py-4 rounded-full font-bold text-base sm:text-lg hover:bg-[#e85100] transition shadow-[0_18px_40px_-12px_rgba(255,90,0,.6)] text-center"
              >
                Sono un artista
              </Link>

              <Link
                href="/locali"
                className="w-full sm:w-auto te-glass text-[var(--ink)] px-8 py-4 rounded-full font-bold text-base sm:text-lg hover:scale-[1.02] transition text-center"
              >
                Ho un locale →
              </Link>
            </div>

            <div
              data-reveal
              className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-xs font-semibold text-[var(--muted)]"
            >
              <span>✓ Chat istantanea</span>
              <span>✓ Massima visibilità</span>
              <span>✓ Zero commissioni artisti</span>
              <span>✓ Pagamenti protetti</span>
            </div>
          </div>

          {/* HERO APP PREVIEW */}
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
                      tuttoevento.it/dashboard
                    </p>
                    <h3 className="te-display text-xl font-extrabold mt-1">
                      Centro operativo eventi
                    </h3>
                  </div>

                  <span className="bg-green-500/12 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full">
                    Live
                  </span>
                </div>

                <div className="p-5 sm:p-6 grid sm:grid-cols-2 gap-4">
                  <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-4">
                    <p className="text-xs text-white/45 font-bold uppercase tracking-[0.12em]">
                      Chat
                    </p>
                    <h4 className="te-display text-2xl font-extrabold mt-2">
                      18
                    </h4>
                    <p className="text-sm text-green-400 font-bold mt-1">
                      messaggi attivi
                    </p>
                  </div>

                  <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-4">
                    <p className="text-xs text-white/45 font-bold uppercase tracking-[0.12em]">
                      Booking
                    </p>
                    <h4 className="te-display text-2xl font-extrabold mt-2">
                      42
                    </h4>
                    <p className="text-sm text-[var(--orange-soft)] font-bold mt-1">
                      richieste gestite
                    </p>
                  </div>

                  <div className="sm:col-span-2 bg-black/20 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-extrabold text-white">
                          DJ Set · Rooftop Bar
                        </p>
                        <p className="text-sm text-white/50 mt-1">
                          Richiesta inviata · risposta in tempo reale
                        </p>
                      </div>
                      <span className="text-xs font-bold text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full">
                        confermabile
                      </span>
                    </div>
                  </div>

                  <div className="sm:col-span-2 bg-white/[0.06] border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-bold text-white/70">
                        Guadagni artista
                      </p>
                      <p className="te-display text-xl font-extrabold text-white">
                        € 450
                      </p>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full w-full rounded-full"
                        style={{
                          background:
                            "linear-gradient(90deg, var(--orange), #ffc27d)",
                        }}
                      />
                    </div>
                    <p className="text-xs text-green-400 font-bold mt-2">
                      100% del cachet netto all'artista · zero commissioni
                    </p>
                  </div>
                </div>

                <div className="px-5 sm:px-6 pb-6 grid grid-cols-3 gap-3">
                  {[
                    ["2 min", "profilo pronto"],
                    ["24/7", "vetrina online"],
                    ["0%", "commissioni artisti"],
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

      {/* MARQUEE */}
      <section className="py-6 bg-[var(--night)] overflow-hidden">
        <div
          className="flex whitespace-nowrap"
          style={{ animation: "te-marquee 28s linear infinite" }}
        >
          {[
            "Artisti",
            "DJ",
            "Band Live",
            "Cantanti",
            "Locali",
            "Hotel",
            "Ristoranti",
            "Beach Club",
            "Aziende",
            "Event Planner",
            "Promoter",
            "Festival",
            "Artisti",
            "DJ",
            "Band Live",
            "Cantanti",
            "Locali",
            "Hotel",
            "Ristoranti",
            "Beach Club",
            "Aziende",
            "Event Planner",
            "Promoter",
            "Festival",
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

      {/* PER CHI È */}
      <section
        id="per-chi"
        className="py-20 sm:py-28 px-5 sm:px-6 bg-white border-y border-black/5"
      >
        <div className="max-w-6xl mx-auto">
          <div
            data-reveal
            className="text-center max-w-3xl mx-auto mb-16 sm:mb-20"
          >
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--orange)] mb-3">
              Due mondi, una piattaforma
            </p>

            <h2 className="te-display text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-[#0a0a0b]">
              Pensata per chi si esibisce e per chi organizza.
            </h2>

            <p className="text-base sm:text-lg text-[var(--muted)] mt-4">
              TuttoEvento elimina il caos del booking tradizionale: meno
              telefonate, meno messaggi dispersi, più opportunità e più controllo.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <TiltCard className="rounded-[2rem]" glow="rgba(255,90,0,0.24)">
              <div
                data-reveal
                className="relative overflow-hidden rounded-[2rem] bg-[var(--paper)] border border-black/5 p-6 sm:p-8 h-full"
              >
                <div
                  aria-hidden
                  className="absolute top-[-120px] right-[-120px] w-[260px] h-[260px] rounded-full blur-[70px]"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,90,0,.22), transparent 70%)",
                  }}
                />

                <span className="text-4xl inline-block mb-6">🎤</span>

                <h3 className="te-display text-3xl font-extrabold mb-3 relative">
                  Per artisti
                </h3>

                <p className="text-[var(--muted)] leading-relaxed mb-6 relative">
                  Crea il tuo media kit, aumenta la tua visibilità e ricevi
                  richieste da locali, privati e organizer. Il tuo compenso resta
                  netto: nessuna commissione trattenuta sul cachet.
                </p>

                <ul className="space-y-3 relative">
                  {[
                    "Profilo artista professionale",
                    "Massima visibilità nel marketplace",
                    "Booking ricevuti in dashboard",
                    "Guadagni netti senza commissioni",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 font-bold">
                      <span className="w-6 h-6 rounded-full bg-[var(--orange)] text-white grid place-items-center text-xs">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/artisti"
                  className="te-cta inline-block mt-8 bg-[var(--orange)] text-white px-7 py-3.5 rounded-full font-bold hover:bg-[#e85100] transition relative"
                >
                  Scopri la landing artisti
                </Link>
              </div>
            </TiltCard>

            <TiltCard className="rounded-[2rem]" glow="rgba(246,177,74,0.24)">
              <div
                data-reveal
                data-delay="1"
                className="relative overflow-hidden rounded-[2rem] bg-[var(--ink)] text-white border border-white/10 p-6 sm:p-8 h-full"
              >
                <div
                  aria-hidden
                  className="absolute top-[-120px] right-[-120px] w-[260px] h-[260px] rounded-full blur-[70px]"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,154,70,.32), transparent 70%)",
                  }}
                />

                <span className="text-4xl inline-block mb-6">🏟️</span>

                <h3 className="te-display text-3xl font-extrabold mb-3 relative">
                  Per locali e organizer
                </h3>

                <p className="text-white/65 leading-relaxed mb-6 relative">
                  Trova DJ, band, cantanti e performer per serate, eventi
                  privati, cene spettacolo, hotel, aziende e format ricorrenti.
                  Gestisci tutto da un unico spazio.
                </p>

                <ul className="space-y-3 relative">
                  {[
                    "Ricerca artisti per zona e genere",
                    "Richieste e preventivi organizzati",
                    "Chat istantanea con gli artisti",
                    "Pagamenti e booking protetti",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 font-bold">
                      <span className="w-6 h-6 rounded-full bg-[var(--orange)] text-white grid place-items-center text-xs">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/locali"
                  className="te-cta inline-block mt-8 bg-white text-black px-7 py-3.5 rounded-full font-bold hover:scale-[1.03] transition relative"
                >
                  Scopri la landing locali
                </Link>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 sm:py-28 px-5 sm:px-6 bg-[var(--paper)]">
        <div className="max-w-6xl mx-auto">
          <div data-reveal className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--orange)] mb-3">
              Funzioni principali
            </p>

            <h2 className="te-display text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
              Tutto quello che serve per gestire un evento.
            </h2>

            <p className="text-base sm:text-lg text-[var(--muted)] mt-4">
              Dalla scoperta dell'artista alla conferma del booking, ogni fase
              viene centralizzata e resa più semplice.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "💬",
                title: "Chat istantanea",
                desc: "Comunica in tempo reale con artisti, locali e organizer senza perdere informazioni tra email, WhatsApp e telefonate.",
                glow: "rgba(168,85,247,0.18)",
              },
              {
                icon: "🚀",
                title: "Massima visibilità",
                desc: "Gli artisti possono farsi trovare da chi cerca davvero intrattenimento, musica live, DJ set e performance per eventi.",
                glow: "rgba(255,90,0,0.22)",
              },
              {
                icon: "💰",
                title: "Zero commissioni artisti",
                desc: "Gli artisti ricevono il 100% del cachet concordato. Nessuna percentuale nascosta trattenuta dal compenso.",
                glow: "rgba(34,197,94,0.18)",
              },
              {
                icon: "🔒",
                title: "Pagamenti protetti",
                desc: "Il pagamento viene gestito in modo sicuro per tutelare entrambe le parti e ridurre problemi post-evento.",
                glow: "rgba(59,130,246,0.18)",
              },
              {
                icon: "📊",
                title: "Dashboard completa",
                desc: "Calendario, richieste, booking, analitiche, profilo e pagamenti: tutto organizzato in un unico pannello.",
                glow: "rgba(246,177,74,0.22)",
              },
              {
                icon: "📍",
                title: "Marketplace geolocalizzato",
                desc: "Trova artisti disponibili nella tua zona o fatti trovare dai locali più vicini e più coerenti con il tuo profilo.",
                glow: "rgba(20,184,166,0.18)",
              },
            ].map((feature, idx) => (
              <TiltCard key={idx} className="rounded-3xl" glow={feature.glow}>
                <div
                  data-reveal
                  data-delay={idx % 3}
                  className="bg-white border border-black/5 rounded-3xl p-6 sm:p-8 h-full shadow-sm"
                >
                  <span className="text-3xl p-3 bg-[var(--paper)] rounded-2xl shadow-sm border border-black/5 inline-block mb-6">
                    {feature.icon}
                  </span>

                  <h3 className="te-display text-xl font-extrabold mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-[var(--muted)] leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* DASHBOARD */}
      <section
        id="dashboard"
        className="py-20 sm:py-28 px-5 sm:px-6 bg-white border-y border-black/5"
      >
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div data-reveal className="lg:col-span-5">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--orange)] mb-3">
              Il tuo centro di controllo
            </p>

            <h2 className="te-display text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-[#0a0a0b]">
              Una dashboard diversa per ogni ruolo.
            </h2>

            <p className="text-base sm:text-lg text-[var(--muted)] mt-5 leading-relaxed">
              Artisti, locali, organizer e promoter vedono solo ciò che serve
              davvero. Meno confusione, più azione.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              {[
                {
                  title: "Artisti",
                  text: "Media kit, calendario, booking ricevuti, incassi e profilo.",
                },
                {
                  title: "Locali",
                  text: "Richieste, artisti, eventi, preventivi e storico booking.",
                },
                {
                  title: "Organizer",
                  text: "Gestione eventi, budget, fornitori artistici e pagamenti.",
                },
                {
                  title: "Promoter",
                  text: "Area dedicata per referral, contatti e opportunità.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-[var(--paper)] border border-black/5 rounded-2xl p-5"
                >
                  <h3 className="te-display font-extrabold mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div data-reveal data-delay="1" className="lg:col-span-7">
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-6 rounded-[3rem] blur-3xl opacity-40"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,90,0,.22), rgba(246,177,74,.18), transparent)",
                }}
              />

              <div className="relative te-dark-glass rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden text-white">
                <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/45 font-mono">
                      dashboard.tuttoevento
                    </p>
                    <h3 className="te-display text-xl font-extrabold mt-1">
                      Panoramica operativa
                    </h3>
                  </div>

                  <span className="text-xs bg-white/10 text-white font-bold px-3 py-1.5 rounded-full">
                    CRM
                  </span>
                </div>

                <div className="p-5 sm:p-6 grid sm:grid-cols-3 gap-4">
                  {[
                    ["€ 8.920", "volume gestito"],
                    ["31", "booking attivi"],
                    ["96%", "risposte in chat"],
                  ].map((item) => (
                    <div
                      key={item[1]}
                      className="bg-white/[0.06] border border-white/10 rounded-2xl p-4"
                    >
                      <p className="te-display text-2xl font-extrabold">
                        {item[0]}
                      </p>
                      <p className="text-xs text-white/45 mt-1 font-bold uppercase tracking-[0.12em]">
                        {item[1]}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="px-5 sm:px-6 pb-6 space-y-3">
                  {[
                    {
                      title: "Nuova richiesta booking",
                      meta: "Locale · Cena spettacolo · Napoli",
                      status: "da valutare",
                    },
                    {
                      title: "Pagamento protetto",
                      meta: "DJ Set · Venerdì sera",
                      status: "confermato",
                    },
                    {
                      title: "Chat in corso",
                      meta: "Artista e organizzatore stanno definendo orari",
                      status: "live",
                    },
                  ].map((row, idx) => (
                    <div
                      key={idx}
                      className="bg-black/20 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="font-extrabold text-white">{row.title}</p>
                        <p className="text-sm text-white/45 mt-1">{row.meta}</p>
                      </div>

                      <span className="text-[10px] font-bold text-[var(--orange-soft)] bg-white/10 px-3 py-1.5 rounded-full">
                        {row.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COME FUNZIONA */}
      <section id="come-funziona" className="py-20 sm:py-28 px-5 sm:px-6 bg-[var(--paper)]">
        <div className="max-w-6xl mx-auto">
          <div data-reveal className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--orange)] mb-3">
              Come funziona
            </p>

            <h2 className="te-display text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
              Dal profilo al booking, senza caos.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Crea il profilo",
                desc: "Artisti e locali configurano la propria area con informazioni, foto, esigenze, disponibilità e dati utili.",
              },
              {
                step: "02",
                title: "Entra nel flusso",
                desc: "I locali cercano artisti, gli artisti ricevono richieste, tutti comunicano tramite chat e dashboard.",
              },
              {
                step: "03",
                title: "Conferma e gestisci",
                desc: "Booking, pagamento, calendario, storico e analitiche restano centralizzati fino alla conclusione dell'evento.",
              },
            ].map((item, idx) => (
              <div
                key={item.step}
                data-reveal
                data-delay={idx}
                className="bg-white border border-black/5 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden"
              >
                <span className="te-display text-6xl font-extrabold text-orange-100 absolute top-4 right-5 select-none">
                  {item.step}
                </span>

                <h3 className="te-display text-2xl font-extrabold mb-3 relative">
                  {item.title}
                </h3>

                <p className="text-[var(--muted)] leading-relaxed relative">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SPLIT */}
      <section className="py-20 sm:py-28 px-5 sm:px-6 bg-white border-y border-black/5">
        <div className="max-w-6xl mx-auto">
          <div data-reveal className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--orange)] mb-3">
              Scegli da dove iniziare
            </p>

            <h2 className="te-display text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
              Due percorsi dedicati. Una sola piattaforma.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/artisti"
              data-reveal
              className="group rounded-[2rem] bg-[var(--paper)] border border-black/5 p-6 sm:p-8 hover:shadow-xl transition block"
            >
              <p className="text-4xl mb-5">🎧</p>
              <h3 className="te-display text-3xl font-extrabold mb-3">
                Landing artisti
              </h3>
              <p className="text-[var(--muted)] leading-relaxed">
                Scopri come creare il tuo profilo, ricevere booking e guadagnare
                senza commissioni.
              </p>
              <span className="inline-block mt-6 font-extrabold text-[var(--orange)] group-hover:translate-x-1 transition">
                Vai alla pagina artisti →
              </span>
            </Link>

            <Link
              href="/locali"
              data-reveal
              data-delay="1"
              className="group rounded-[2rem] bg-[var(--ink)] text-white border border-white/10 p-6 sm:p-8 hover:shadow-xl transition block"
            >
              <p className="text-4xl mb-5">🏟️</p>
              <h3 className="te-display text-3xl font-extrabold mb-3">
                Landing locali
              </h3>
              <p className="text-white/65 leading-relaxed">
                Scopri come trovare artisti, pubblicare richieste e organizzare
                eventi più velocemente.
              </p>
              <span className="inline-block mt-6 font-extrabold text-[var(--orange-soft)] group-hover:translate-x-1 transition">
                Vai alla pagina locali →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 sm:py-24 px-5 sm:px-6 bg-[var(--paper)]">
        <div className="max-w-4xl mx-auto">
          <div data-reveal className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--orange)] mb-3">
              Domande frequenti
            </p>

            <h2 className="te-display text-3xl sm:text-4xl font-extrabold text-[#0a0a0b]">
              TuttoEvento in breve
            </h2>
          </div>

          <div data-reveal className="space-y-4">
            {faqs.map((faq, index) => {
              const active = openFaq === index;

              return (
                <div
                  key={index}
                  className="bg-white border border-black/5 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(active ? null : index)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left font-bold text-base sm:text-lg text-[var(--ink)] hover:bg-zinc-50 transition"
                  >
                    <span>{faq.q}</span>

                    <span
                      className={`w-6 h-6 shrink-0 rounded-full bg-[var(--paper)] text-[var(--muted)] flex items-center justify-center font-mono text-sm transition-transform duration-300 ${
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
            Porta il tuo prossimo evento <br />
            <span className="te-shimmer">dentro TuttoEvento</span>.
          </h2>

          <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto mb-8 sm:mb-10 relative">
            Che tu sia un artista, un locale, un organizer o un promoter,
            TuttoEvento ti aiuta a gestire booking, visibilità, chat e pagamenti
            in modo più semplice.
          </p>

          <div className="relative flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto sm:max-w-none">
            <Link
              href="/register"
              className="te-cta bg-[var(--orange)] text-white px-8 sm:px-10 py-4 rounded-full font-bold text-base sm:text-lg hover:bg-[#e85100] transition shadow-[0_18px_40px_-12px_rgba(255,90,0,.7)] text-center"
            >
              Crea account gratis
            </Link>

            <Link
              href="/login"
              className="bg-white/10 text-white border border-white/15 px-8 sm:px-10 py-4 rounded-full font-bold text-base sm:text-lg hover:bg-white/15 transition backdrop-blur text-center"
            >
              Accedi
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
              La piattaforma professionale per artisti, locali, organizer e
              promoter. Trova talenti, gestisci booking, comunica in chat e
              semplifica ogni evento.
            </p>
          </div>

          <div>
            <p className="te-display font-bold mb-3 text-sm">Piattaforma</p>

            <ul className="space-y-2 text-sm text-[var(--muted)] font-semibold">
              <li>
                <a href="#per-chi" className="hover:text-[var(--orange)]">
                  Per chi è
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[var(--orange)]">
                  Features
                </a>
              </li>
              <li>
                <a href="#dashboard" className="hover:text-[var(--orange)]">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#come-funziona" className="hover:text-[var(--orange)]">
                  Come funziona
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="te-display font-bold mb-3 text-sm">Collegamenti</p>

            <ul className="space-y-2 text-sm text-[var(--muted)] font-semibold">
              <li>
                <Link href="/artisti" className="hover:text-[var(--orange)]">
                  Landing artisti
                </Link>
              </li>
              <li>
                <Link href="/locali" className="hover:text-[var(--orange)]">
                  Landing locali
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[var(--orange)]">
                  Accedi
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[var(--orange)]">
                  Registrati
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