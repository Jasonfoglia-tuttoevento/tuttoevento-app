import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] text-[#111] overflow-hidden selection:bg-[#ff5a00] selection:text-white">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/70 border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            <span className="font-black tracking-tight text-xl">TuttoEvento</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <a href="#features" className="hover:text-[#ff5a00] transition">Funzioni</a>
          </div>
          <Link href="/login" className="bg-[#111] text-white px-5 py-2 rounded-full text-sm font-bold hover:scale-105 transition">
            Accedi
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Glow 3D */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#ff5a00]/20 to-orange-300/20 rounded-full blur-[120px] -z-10" />
        
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 mb-8 shadow-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nuova Piattaforma</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8">
            Gestisci eventi <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5a00] to-orange-600">senza limiti.</span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            La piattaforma all-in-one per organizer, artisti e promoter. <br />
            Booking, analytics e chat in un unico ecosistema.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link href="/register" className="bg-[#ff5a00] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#e04e00] transition shadow-xl shadow-orange-500/20">
              Inizia gratis
            </Link>
            <Link href="/login" className="bg-white text-[#111] border border-gray-200 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition">
              Accedi
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition duration-300">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl mb-6">🚀</div>
              <h3 className="text-2xl font-black mb-3">Booking Smart</h3>
              <p className="text-gray-500">Crea eventi, gestisci artisti e invia richieste in pochi click. Tutto automatico.</p>
            </div>

            {/* Card 2 */}
            <div className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition duration-300">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl mb-6">💬</div>
              <h3 className="text-2xl font-black mb-3">Chat Integrata</h3>
              <p className="text-gray-500">Comunica direttamente con organizer e artisti senza uscire dalla piattaforma.</p>
            </div>

            {/* Card 3 */}
            <div className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition duration-300">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl mb-6">📊</div>
              <h3 className="text-2xl font-black mb-3">Analytics</h3>
              <p className="text-gray-500">Monitora incassi, margini e performance in tempo reale.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-12 text-center text-gray-400 text-sm">
        <p>© 2026 TuttoEvento. Tutti i diritti riservati.</p>
      </footer>
    </main>
  );
}