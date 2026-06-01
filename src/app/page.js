import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#111] overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="TuttoEvento" className="h-10 w-auto" />
          </Link>
          
          <nav className="hidden md:flex gap-8 text-sm font-semibold tracking-wider uppercase text-gray-600">
            <a href="#cose" className="hover:text-[#ff5a00] transition">Cos'è</a>
            <a href="#funzioni" className="hover:text-[#ff5a00] transition">Funzioni</a>
            <a href="#aree" className="hover:text-[#ff5a00] transition">Aree</a>
          </nav>

          <Link href="/login" className="bg-[#ff5a00] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-[#ff6b1a] transition shadow-lg shadow-orange-500/20">
            Accedi
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff5a00]/5 via-white to-gray-50" />
        
        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 bg-[#ff5a00] rounded-full animate-pulse" />
              <span className="text-xs font-semibold tracking-wider uppercase text-[#ff5a00]">Piattaforma Live</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tight">
              Gestisci eventi{" "}
              <span className="text-[#ff5a00]">
                senza limiti
              </span>
            </h1>

            <p className="mt-6 text-xl text-gray-600 max-w-xl leading-relaxed">
              La piattaforma all-in-one per organizer, artisti e promoter. 
              Booking, chat, analytics e pagamenti in un unico posto.
            </p>

            <div className="flex gap-4 mt-10">
              <Link href="/register" className="bg-[#ff5a00] text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition shadow-xl shadow-orange-500/20">
                Inizia gratis
              </Link>
              <Link href="#cose" className="border border-gray-300 text-gray-900 px-8 py-4 rounded-2xl font-bold hover:bg-gray-50 transition">
                Scopri di più
              </Link>
            </div>

            <div className="flex items-center gap-8 mt-12 pt-8 border-t border-gray-200">
              <div>
                <p className="text-3xl font-bold text-[#ff5a00]">500+</p>
                <p className="text-sm text-gray-500 mt-1">Eventi gestiti</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#ff5a00]">50+</p>
                <p className="text-sm text-gray-500 mt-1">Artisti attivi</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#ff5a00]">24/7</p>
                <p className="text-sm text-gray-500 mt-1">Supporto cloud</p>
              </div>
            </div>
          </div>

          {/* Preview Card */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-[#ff5a00]/20 to-orange-400/20 rounded-[2.5rem] blur-2xl" />
            <div className="relative bg-white border border-gray-200 rounded-[2rem] p-8 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="text-xs text-gray-400 font-mono">Dashboard</div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm text-gray-500">Prossimo evento</p>
                      <p className="text-lg font-bold mt-1">Summer Festival 2026</p>
                    </div>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">In corso</span>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <p className="text-gray-500">Ticket</p>
                      <p className="font-bold mt-1">342/500</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Incasso</p>
                      <p className="font-bold mt-1">€12.450</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-2xl font-bold text-[#ff5a00]">12</p>
                    <p className="text-xs text-gray-500 mt-1">Booking attivi</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-2xl font-bold text-[#ff5a00]">€3.2k</p>
                    <p className="text-xs text-gray-500 mt-1">Cachet mese</p>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100">
                  <p className="font-bold mb-2">💬 Nuovi messaggi</p>
                  <p className="text-sm text-gray-600">3 booking in attesa di conferma</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="funzioni" className="px-6 py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-[#ff5a00] text-sm font-bold tracking-[3px] uppercase mb-4">Funzioni</p>
            <h2 className="text-5xl md:text-7xl font-black tracking-tight">
              Tutto ciò che ti serve
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "📅", title: "Booking Smart", desc: "Crea eventi e gestisci artisti in pochi click" },
              { icon: "💬", title: "Chat Integrata", desc: "Comunica direttamente con organizer e artisti" },
              { icon: "📊", title: "Analytics", desc: "Monitora incassi, margini e performance in tempo reale" },
              { icon: "🎤", title: "Media Kit", desc: "Profilo artista completo con cachet e disponibilità" },
              { icon: "💶", title: "Pagamenti", desc: "Gestione automatica di cachet e commissioni" },
              { icon: "☁️", title: "Cloud Sync", desc: "Dati sincronizzati su tutti i dispositivi" },
            ].map((feature, i) => (
              <div key={i} className="group bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-xl transition duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-32">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-[#ff5a00] to-orange-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="relative">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-white">Pronto a rivoluzionare i tuoi eventi?</h2>
            <p className="text-white/90 text-lg mb-10 max-w-2xl mx-auto">Unisciti a centinaia di organizer e artisti che già usano TuttoEvento.</p>
            <Link href="/register" className="inline-block bg-white text-[#ff5a00] px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition shadow-2xl">
              Crea account gratuito
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] text-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <img src="/logo.png" alt="TuttoEvento" className="h-8 brightness-0 invert" />
          <p className="text-white/40 text-sm">© 2026 TuttoEvento. Tutti i diritti riservati.</p>
        </div>
      </footer>
    </main>
  );
}