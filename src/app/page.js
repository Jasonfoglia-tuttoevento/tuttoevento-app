import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f4ef] text-[#111] overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#f7f4ef]/90 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between gap-5">
          <Link href="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="TuttoEvento"
              className="h-12 md:h-14 w-auto object-contain"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-9 text-sm font-black uppercase tracking-[1.5px]">
            <a href="#cose" className="hover:text-[#ff5a00]">
              Cos'è
            </a>
            <a href="#funzioni" className="hover:text-[#ff5a00]">
              Funzioni
            </a>
            <a href="#aree" className="hover:text-[#ff5a00]">
              Aree
            </a>
          </nav>

          <Link
            href="/login"
            className="rounded-2xl border border-[#ff5a00] bg-white/70 px-5 py-3 text-sm font-black uppercase tracking-[1px] hover:bg-[#ff5a00] hover:text-white transition"
          >
            Accedi
          </Link>
        </div>
      </header>

      <section className="relative min-h-screen flex items-center pt-28 pb-16 px-5 md:px-8">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-[#ff5a00]/10 blur-3xl" />
          <div className="absolute bottom-10 -left-32 w-[420px] h-[420px] rounded-full bg-black/5 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <div>
            <p className="uppercase tracking-[5px] text-[#ff5a00] text-xs font-black mb-6">
              Eventi · artisti · organizer · promoter
            </p>

            <h1 className="text-6xl md:text-8xl font-black tracking-[-0.08em] leading-[0.86]">
              La piattaforma che connette eventi, artisti e locali.
            </h1>

            <p className="mt-7 text-lg md:text-xl text-black/60 max-w-2xl leading-relaxed">
              TuttoEvento è il gestionale per creare booking, gestire artisti,
              organizzare eventi, monitorare incassi, cachet, chat, richieste e
              disponibilità.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-9">
              <Link
                href="/login"
                className="bg-[#ff5a00] text-white rounded-2xl px-8 py-4 font-black text-center shadow-xl shadow-orange-500/20 hover:scale-[1.02] transition"
              >
                Accedi alla piattaforma
              </Link>

              <Link
                href="/register"
                className="bg-[#111] text-white rounded-2xl px-8 py-4 font-black text-center hover:scale-[1.02] transition"
              >
                Crea account
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-10 max-w-xl">
              <MiniStat value="3" label="Aree operative" />
              <MiniStat value="1" label="Dashboard unica" />
              <MiniStat value="24/7" label="Accesso cloud" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-[#ff5a00]/10 rounded-[46px] blur-2xl" />

            <div className="relative bg-[#111] text-white rounded-[42px] p-6 md:p-8 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#ff5a00]/30 rounded-bl-full" />

              <div className="relative">
                <p className="text-xs uppercase tracking-[3px] text-white/40 font-black">
                  Dashboard preview
                </p>

                <h2 className="text-4xl md:text-5xl font-black tracking-[-0.06em] mt-4 leading-none">
                  Eventi, musica e pubblico. Tutto in un unico posto.
                </h2>

                <div className="grid grid-cols-1 gap-4 mt-8">
                  <PreviewCard
                    title="Booking"
                    text="Crea eventi, scegli artisti e invia richieste."
                  />
                  <PreviewCard
                    title="Chat"
                    text="Conversazioni collegate a booking ed eventi."
                  />
                  <PreviewCard
                    title="Analitiche"
                    text="Incassi, cachet, margini ed estratti conto."
                  />
                </div>

                <div className="mt-8 bg-white text-[#111] rounded-[28px] p-5">
                  <p className="text-xs uppercase tracking-[2px] text-black/35 font-black">
                    Stato piattaforma
                  </p>
                  <p className="text-3xl font-black mt-2">Beta privata</p>
                  <p className="text-sm text-black/50 mt-1">
                    Accesso riservato ad account registrati.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="cose" className="px-5 md:px-8 py-16">
        <div className="max-w-7xl mx-auto bg-white rounded-[42px] border border-black/5 p-7 md:p-12 shadow-sm">
          <p className="uppercase tracking-[4px] text-[#ff5a00] text-xs font-black">
            Cos'è
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 mt-5 items-end">
            <h2 className="text-4xl md:text-6xl font-black tracking-[-0.07em] leading-none">
              Una piattaforma per trasformare un evento in un sistema.
            </h2>

            <p className="text-lg text-black/60 leading-relaxed">
              Ogni ruolo entra nella propria area: gli organizer creano eventi
              e inviano booking, gli artisti gestiscono media kit e
              disponibilità, i promoter collaborano allo sviluppo commerciale.
              Tutto collegato a Supabase e pronto per lavorare online.
            </p>
          </div>
        </div>
      </section>

      <section id="funzioni" className="px-5 md:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="uppercase tracking-[4px] text-[#ff5a00] text-xs font-black">
              Funzioni
            </p>

            <h2 className="text-4xl md:text-6xl font-black tracking-[-0.07em] mt-3">
              Tutto quello che serve per gestire una serata.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FeatureCard
              icon="📅"
              title="Booking eventi"
              text="Crea eventi, seleziona artisti, invia richieste e monitora gli stati."
            />

            <FeatureCard
              icon="🎙️"
              title="Media kit artista"
              text="Bio, cachet, generi, città, social, rider e date disponibili."
            />

            <FeatureCard
              icon="💬"
              title="Chat operativa"
              text="Conversazioni dirette tra organizer e artisti collegate ai booking."
            />

            <FeatureCard
              icon="📊"
              title="Analitiche"
              text="Controllo su incassi, costi artista, margini e performance eventi."
            />

            <FeatureCard
              icon="💶"
              title="Estratto conto"
              text="Gestione economica per organizer e artisti con dati salvati online."
            />

            <FeatureCard
              icon="☁️"
              title="Cloud Supabase"
              text="Dati condivisi online: utenti, eventi, booking, chat e profili."
            />
          </div>
        </div>
      </section>

      <section id="aree" className="px-5 md:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="uppercase tracking-[4px] text-[#ff5a00] text-xs font-black">
              Le aree
            </p>

            <h2 className="text-5xl md:text-7xl font-black tracking-[-0.08em] mt-3">
              Scegli la tua area.
            </h2>

            <p className="text-black/55 mt-4 text-lg">
              Accedi con le tue credenziali: verrai portato alla dashboard
              nuova in base al tuo ruolo.
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
        </div>
      </section>

      <footer className="bg-[#080808] text-white">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <img
              src="/logo.png"
              alt="TuttoEvento"
              className="h-12 w-auto object-contain"
            />

            <p className="text-white/65 font-bold text-center">
              Connettiamo talenti, creiamo eventi, costruiamo opportunità.
            </p>

            <p className="text-white/35 text-sm">© 2026 TuttoEvento</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function MiniStat({ value, label }) {
  return (
    <div className="bg-white/70 border border-black/5 rounded-2xl p-4">
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs text-black/45 font-bold mt-1">{label}</p>
    </div>
  );
}

function PreviewCard({ title, text }) {
  return (
    <div className="bg-white/10 border border-white/10 rounded-3xl p-5">
      <p className="text-xl font-black">{title}</p>
      <p className="text-sm text-white/55 mt-2 leading-relaxed">{text}</p>
    </div>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="bg-white rounded-[32px] border border-black/5 p-7 shadow-sm hover:-translate-y-1 transition">
      <div className="text-4xl mb-5">{icon}</div>

      <h3 className="text-2xl font-black tracking-[-0.04em]">{title}</h3>

      <p className="text-black/55 mt-3 leading-relaxed">{text}</p>
    </div>
  );
}

function AreaCard({ emoji, title, description, href }) {
  return (
    <div className="group bg-white rounded-[38px] border border-black/5 p-7 md:p-8 text-center shadow-sm hover:shadow-2xl hover:-translate-y-1 transition overflow-hidden">
      <div className="mx-auto w-20 h-20 rounded-[28px] bg-[#ff5a00]/10 flex items-center justify-center text-5xl mb-7 group-hover:scale-105 transition">
        {emoji}
      </div>

      <h3 className="text-3xl font-black tracking-[-0.05em]">{title}</h3>

      <p className="text-black/55 mt-4 leading-relaxed min-h-[96px]">
        {description}
      </p>

      <Link
        href={href}
        className="inline-flex items-center justify-center mt-7 bg-[#ff5a00] text-white rounded-2xl px-9 py-4 font-black shadow-lg shadow-orange-500/20 hover:bg-[#111] transition"
      >
        Accedi
      </Link>
    </div>
  );
}