import Link from "next/link";

export const metadata = {
  title: "TuttoEvento | Marketplace per artisti, locali ed eventi",
  description:
    "TuttoEvento connette artisti, locali, promoter e organizzatori in un'unica piattaforma.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fbfaf8] text-[#0a0a0b] px-5 py-8">
      <nav className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="font-black tracking-tight text-lg">
          TUTTO<span className="text-[#ff5a00]">EVENTO</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-bold text-black/60 hover:text-black"
          >
            Accedi
          </Link>

          <Link
            href="/register"
            className="bg-black text-white px-4 py-2 rounded-full text-sm font-bold"
          >
            Registrati
          </Link>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto text-center pt-24 sm:pt-32 pb-16">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#ff5a00] mb-4">
          TuttoEvento
        </p>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-[-0.05em] leading-[0.95]">
          La piattaforma per artisti, locali ed eventi.
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-xl text-black/55 mt-6 leading-relaxed">
          Trova artisti, organizza serate, gestisci booking, pagamenti e richieste
          in un unico posto.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mt-10 max-w-3xl mx-auto">
          <Link
            href="/artisti"
            className="rounded-3xl bg-white border border-black/5 p-6 sm:p-8 text-left shadow-sm hover:shadow-md transition"
          >
            <p className="text-3xl mb-4">🎤</p>
            <h2 className="text-2xl font-black tracking-[-0.03em]">
              Sono un artista
            </h2>
            <p className="text-black/55 mt-2 leading-relaxed">
              Crea il tuo profilo, ricevi richieste e guadagna senza commissioni.
            </p>
            <span className="inline-block mt-5 text-[#ff5a00] font-black">
              Vai alla landing artisti →
            </span>
          </Link>

          <Link
            href="/locali"
            className="rounded-3xl bg-black text-white p-6 sm:p-8 text-left shadow-sm hover:shadow-md transition"
          >
            <p className="text-3xl mb-4">🏟️</p>
            <h2 className="text-2xl font-black tracking-[-0.03em]">
              Ho un locale
            </h2>
            <p className="text-white/60 mt-2 leading-relaxed">
              Trova DJ, band, performer e artisti per le tue serate.
            </p>
            <span className="inline-block mt-5 text-[#ff5a00] font-black">
              Vai alla landing locali →
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}