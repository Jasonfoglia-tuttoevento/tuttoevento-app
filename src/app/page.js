import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f5f6] text-[#111] overflow-x-hidden">
      <header className="w-full bg-white border-b border-black/5">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-5 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="TuttoEvento"
              className="h-12 md:h-14 w-auto object-contain"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-black uppercase tracking-[1px]">
            <a href="#cose">Cos'è</a>
            <a href="#funzioni">Funzioni</a>
            <a href="#aree">Aree</a>
          </nav>

          <Link
            href="/login"
            className="border border-[#ff5a00] text-[#111] rounded-2xl px-5 py-3 text-sm font-black"
          >
            Accedi
          </Link>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div>
            <p className="uppercase tracking-[4px] text-[#ff5a00] text-xs font-black mb-5">
              Eventi · artisti · organizer · promoter
            </p>

            <h1 className="text-5xl md:text-7xl font-black tracking-[-0.07em] leading-[0.9]">
              La dashboard per gestire booking ed eventi.
            </h1>

            <p className="text-lg md:text-xl text-black/55 mt-6 max-w-2xl leading-relaxed">
              TuttoEvento connette locali, artisti e promoter in un unico
              spazio operativo: booking, chat, media kit, calendario,
              analitiche ed estratti conto.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link
                href="/login"
                className="bg-[#ff5a00] text-white rounded-2xl px-7 py-4 font-black text-center shadow-lg shadow-orange-500/20"
              >
                Accedi
              </Link>

              <Link
                href="/register"
                className="bg-[#111] text-white rounded-2xl px-7 py-4 font-black text-center"
              >
                Crea account
              </Link>
            </div>
          </div>

          <div className="bg-[#111] text-white rounded-[36px] p-6 md:p-8 shadow-2xl overflow-hidden">
            <p className="text-xs uppercase tracking-[3px] text-white/40 font-black">
              TuttoEvento Beta
            </p>

            <h2 className="text-3xl md:text-4xl font-black tracking-[-0.05em] mt-3">
              Una sola piattaforma, tre ruoli.
            </h2>

            <div className="space-y-3 mt-8">
              <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                <p className="font-black">Organizer</p>
                <p className="text-sm text-white/55 mt-1">
                  Crea eventi, scegli artisti, gestisci booking e incassi.
                </p>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                <p className="font-black">Artisti</p>
                <p className="text-sm text-white/55 mt-1">
                  Media kit, richieste ricevute, calendario ed estratto conto.
                </p>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                <p className="font-black">Promoter</p>
                <p className="text-sm text-white/55 mt-1">
                  Area dedicata per sviluppo commerciale e collaborazioni.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="cose" className="max-w-7xl mx-auto px-5 md:px-8 py-10">
        <div className="bg-white border border-black/5 rounded-[34px] p-6 md:p-10">
          <p className="uppercase tracking-[3px] text-[#ff5a00] text-xs font-black">
            Cos'è
          </p>

          <h2 className="text-4xl md:text-5xl font-black tracking-[-0.06em] mt-3">
            TuttoEvento è il gestionale operativo per eventi musicali.
          </h2>

          <p className="text-black/55 text-lg mt-5 max-w-3xl leading-relaxed">
            Ogni utente accede con le proprie credenziali e viene portato nella
            dashboard corretta in base al ruolo registrato su Supabase.
          </p>
        </div>
      </section>

      <section id="funzioni" className="max-w-7xl mx-auto px-5 md:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-black/5 rounded-[30px] p-6">
            <p className="text-3xl mb-4">📅</p>
            <h3 className="text-2xl font-black tracking-[-0.04em]">
              Booking
            </h3>
            <p className="text-black/50 mt-3">
              Crea eventi, invia richieste e gestisci accettazioni.
            </p>
          </div>

          <div className="bg-white border border-black/5 rounded-[30px] p-6">
            <p className="text-3xl mb-4">💬</p>
            <h3 className="text-2xl font-black tracking-[-0.04em]">Chat</h3>
            <p className="text-black/50 mt-3">
              Conversazioni collegate a booking, artisti ed eventi.
            </p>
          </div>

          <div className="bg-white border border-black/5 rounded-[30px] p-6">
            <p className="text-3xl mb-4">📊</p>
            <h3 className="text-2xl font-black tracking-[-0.04em]">
              Analitiche
            </h3>
            <p className="text-black/50 mt-3">
              Incassi, cachet, margini ed estratti conto.
            </p>
          </div>
        </div>
      </section>

      <section id="aree" className="max-w-7xl mx-auto px-5 md:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-6xl font-black tracking-[-0.06em]">
            Le <span className="text-[#ff5a00]">aree</span>
          </h2>

          <p className="text-black/55 mt-3 text-lg">
            Accedi con le tue credenziali: la dashboard nuova si adatta al tuo
            ruolo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AreaCard
            emoji="🏢"
            title="Area Organizer"
            description="Gestisci eventi, artisti, cachet, booking, incassi e promoter associati."
            href="/login?role=organizer"
          />

          <AreaCard
            emoji="🎙️"
            title="Area Artisti"
            description="Crea il tuo media kit, imposta cachet, disponibilità, calendario e booking."
            href="/login?role=artist"
          />

          <AreaCard
            emoji="👥"
            title="Area Promoter"
            description="Accedi all’area promoter per collaborazioni e sviluppo commerciale."
            href="/login?role=promoter"
          />
        </div>
      </section>

      <footer className="bg-[#080808] text-white mt-10">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <img
            src="/logo.png"
            alt="TuttoEvento"
            className="h-12 w-auto object-contain invert"
          />

          <p className="text-white/60 text-sm font-bold text-center">
            Connettiamo talenti, creiamo eventi, costruiamo opportunità.
          </p>

          <p className="text-white/35 text-xs">
            © 2026 TuttoEvento
          </p>
        </div>
      </footer>
    </main>
  );
}

function AreaCard({ emoji, title, description, href }) {
  return (
    <div className="bg-white border border-black/5 rounded-[34px] p-7 md:p-8 text-center shadow-sm">
      <div className="text-5xl mb-6">{emoji}</div>

      <h3 className="text-2xl font-black tracking-[-0.04em]">
        {title}
      </h3>

      <p className="text-black/55 mt-4 leading-relaxed min-h-[80px]">
        {description}
      </p>

      <Link
        href={href}
        className="inline-flex items-center justify-center mt-7 bg-[#ff5a00] text-white rounded-2xl px-9 py-4 font-black shadow-lg shadow-orange-500/20"
      >
        Accedi
      </Link>
    </div>
  );
}