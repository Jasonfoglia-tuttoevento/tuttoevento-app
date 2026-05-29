import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f5f6] text-[#111] overflow-hidden">
      <section className="min-h-screen flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-6xl">
          <div className="bg-white border border-black/5 rounded-[40px] p-6 md:p-12 shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#ff5a00]/10 text-[#ff5a00] rounded-full px-4 py-2 text-xs font-black uppercase tracking-[2px] mb-6">
                  TuttoEvento
                </div>

                <h1 className="text-5xl md:text-7xl font-black tracking-[-0.07em] leading-[0.9]">
                  Booking eventi,
                  <br />
                  artisti e locali.
                </h1>

                <p className="text-lg md:text-xl text-black/55 mt-6 max-w-2xl leading-relaxed">
                  La dashboard per gestire eventi, richieste booking,
                  media kit artisti, chat, analitiche ed estratti conto.
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

                  <Link
                    href="/dashboard"
                    className="bg-[#f5f5f6] text-[#111] border border-black/10 rounded-2xl px-7 py-4 font-black text-center"
                  >
                    Vai alla dashboard
                  </Link>
                </div>
              </div>

              <div className="bg-[#111] text-white rounded-[34px] p-6 md:p-8 overflow-hidden">
                <p className="text-xs uppercase tracking-[3px] text-white/40 font-black">
                  Area operativa
                </p>

                <h2 className="text-3xl md:text-4xl font-black tracking-[-0.05em] mt-3">
                  Una sola dashboard per ogni ruolo.
                </h2>

                <div className="space-y-3 mt-8">
                  <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                    <p className="font-black">Organizer</p>
                    <p className="text-sm text-white/55 mt-1">
                      Eventi, booking, artist marketplace, incassi e analitiche.
                    </p>
                  </div>

                  <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                    <p className="font-black">Artista</p>
                    <p className="text-sm text-white/55 mt-1">
                      Media kit, richieste ricevute, calendario ed estratto
                      conto.
                    </p>
                  </div>

                  <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                    <p className="font-black">Chat</p>
                    <p className="text-sm text-white/55 mt-1">
                      Conversazioni collegate a booking ed eventi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-black/35 mt-6 font-bold">
            Beta privata TuttoEvento
          </p>
        </div>
      </section>
    </main>
  );
}