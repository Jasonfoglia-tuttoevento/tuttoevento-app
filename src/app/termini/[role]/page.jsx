"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

const DOCS = {
  locali: { title: "Termini e Condizioni · Locali", file: "/termini-locali.pdf" },
  artisti: { title: "Termini e Condizioni · Artisti", file: "/termini-artisti.pdf" },
  promoter: { title: "Termini e Condizioni · Promoter", file: "/termini-promoter.pdf" },
};

export default function TerminiPage() {
  const params = useParams();
  const role = String(params?.role || "").toLowerCase();
  const doc = DOCS[role];

  return (
    <main className="te-terms-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');
        .te-terms-root { --orange:#ff5a00; --ink:#0a0a0b; --paper:#fbfaf8; --muted:#6b6b73; font-family:'Manrope',system-ui,sans-serif; color:var(--ink); background:var(--paper); min-height:100vh; display:flex; flex-direction:column; }
        .te-terms-display { font-family:'Sora',sans-serif; letter-spacing:-0.03em; }
      `}</style>

      <header className="px-5 sm:px-8 py-5 flex items-center justify-between border-b border-black/5 bg-white">
        <Link href="/" className="te-terms-display font-extrabold text-base sm:text-lg tracking-tight">
          TUTTO<span style={{ color: "var(--orange)" }}>EVENTO</span>
        </Link>
        <Link href="/register" className="text-sm font-bold text-[var(--muted)] hover:text-[var(--orange)] transition">
          &larr; Torna alla registrazione
        </Link>
      </header>

      <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {!doc ? (
          <div className="bg-white border border-black/5 rounded-3xl p-8 text-center">
            <h1 className="te-terms-display text-2xl font-extrabold mb-3">Documento non trovato</h1>
            <p className="text-[var(--muted)] mb-6">Seleziona la categoria corretta dalla pagina di registrazione.</p>
            <Link href="/register" className="inline-block bg-[var(--orange)] text-white px-6 py-3 rounded-full font-bold">
              Vai alla registrazione
            </Link>
          </div>
        ) : (
          <>
            <p className="uppercase tracking-[0.2em] text-[var(--orange)] text-[11px] font-extrabold mb-3">Documento legale</p>
            <h1 className="te-terms-display text-3xl sm:text-4xl font-extrabold leading-tight mb-2">{doc.title}</h1>
            <p className="text-[var(--muted)] mb-6">Leggi il documento qui sotto. Puoi anche scaricarlo o aprirlo a schermo intero.</p>

            <div className="flex flex-wrap gap-3 mb-6">
              <a href={doc.file} target="_blank" rel="noopener noreferrer"
                 className="bg-[var(--ink)] text-white px-5 py-3 rounded-full font-bold text-sm hover:scale-[1.02] transition">
                Apri a schermo intero
              </a>
              <a href={doc.file} download
                 className="bg-white border border-black/10 px-5 py-3 rounded-full font-bold text-sm hover:border-[var(--orange)]/40 transition">
                Scarica PDF
              </a>
            </div>

            {/* PDF incorporato */}
            <div className="bg-white border border-black/5 rounded-3xl overflow-hidden shadow-sm">
              <object data={doc.file} type="application/pdf" className="w-full" style={{ height: "80vh" }}>
                {/* fallback se il browser (tipico mobile) non mostra il PDF inline */}
                <div className="p-8 text-center">
                  <p className="text-[var(--muted)] mb-4">Il tuo browser non mostra il PDF qui dentro.</p>
                  <a href={doc.file} target="_blank" rel="noopener noreferrer"
                     className="inline-block bg-[var(--orange)] text-white px-6 py-3 rounded-full font-bold">
                    Apri il documento
                  </a>
                </div>
              </object>
            </div>
          </>
        )}
      </div>
    </main>
  );
}