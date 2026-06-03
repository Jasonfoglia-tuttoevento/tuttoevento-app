"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

const DOCS = {
  locali: { title: "Termini e Condizioni · Locali", subtitle: "Per i locali che utilizzano TuttoEvento", file: "/termini-locali.pdf" },
  artisti: { title: "Termini e Condizioni · Artisti", subtitle: "Per gli artisti che si registrano su TuttoEvento", file: "/termini-artisti.pdf" },
  promoter: { title: "Termini e Condizioni · Promoter", subtitle: "Per i promoter che gestiscono il proprio portfolio", file: "/termini-promoter.pdf" },
};

export default function TerminiPage() {
  const params = useParams();
  const role = String(params?.role || "").toLowerCase();
  const doc = DOCS[role];

  const s = {
    root: { minHeight: "100vh", background: "#fbfaf8", fontFamily: "'Manrope',system-ui,sans-serif", color: "#0a0a0b", display: "flex", flexDirection: "column" },
    header: { background: "#fff", borderBottom: "1px solid rgba(0,0,0,.06)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
    logo: { fontFamily: "'Sora',sans-serif", fontWeight: 900, fontSize: "1.1rem", letterSpacing: "-.04em", color: "#0a0a0b", textDecoration: "none" },
    back: { fontSize: ".875rem", fontWeight: 700, color: "#6b6b73", textDecoration: "none" },
    main: { flex: 1, maxWidth: 900, margin: "0 auto", padding: "40px 20px", width: "100%" },
    label: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".18em", color: "#ff5a00", marginBottom: 10, display: "block" },
    h1: { fontFamily: "'Sora',sans-serif", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, letterSpacing: "-.04em", color: "#0a0a0b", marginBottom: 8, lineHeight: 1.1 },
    sub: { color: "#6b6b73", fontSize: ".95rem", marginBottom: 24, lineHeight: 1.6 },
    btnRow: { display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" },
    btnDark: { background: "#0a0a0b", color: "#fff", padding: "11px 22px", borderRadius: 100, fontWeight: 700, fontSize: ".875rem", textDecoration: "none", display: "inline-block", transition: "all .2s" },
    btnLight: { background: "#fff", border: "1px solid rgba(0,0,0,.1)", color: "#0a0a0b", padding: "11px 22px", borderRadius: 100, fontWeight: 700, fontSize: ".875rem", textDecoration: "none", display: "inline-block" },
    pdfWrap: { background: "#fff", border: "1px solid rgba(0,0,0,.06)", borderRadius: 24, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,.06)" },
    notFound: { background: "#fff", border: "1px solid rgba(0,0,0,.06)", borderRadius: 24, padding: "48px 32px", textAlign: "center" },
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800;900&family=Manrope:wght@400;600;700;800&display=swap');`}</style>
      <main style={s.root}>
        <header style={s.header}>
          <Link href="/" style={s.logo}>
            TUTTO<span style={{ color: "#ff5a00" }}>EVENTO</span>
          </Link>
          <Link href="/register" style={s.back}>← Torna alla registrazione</Link>
        </header>

        <div style={s.main}>
          {!doc ? (
            <div style={s.notFound}>
              <p style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.5rem", fontWeight: 900, marginBottom: 12 }}>Documento non trovato</p>
              <p style={{ color: "#6b6b73", marginBottom: 24 }}>Seleziona la categoria corretta dalla pagina di registrazione.</p>
              <Link href="/register" style={{ background: "#ff5a00", color: "#fff", padding: "12px 24px", borderRadius: 100, fontWeight: 700, textDecoration: "none" }}>
                Vai alla registrazione
              </Link>
            </div>
          ) : (
            <>
              <span style={s.label}>Documento legale</span>
              <h1 style={s.h1}>{doc.title}</h1>
              <p style={s.sub}>{doc.subtitle}. Leggi il documento qui sotto prima di completare la registrazione.</p>
              <div style={s.btnRow}>
                <a href={doc.file} target="_blank" rel="noopener noreferrer" style={s.btnDark}>Apri a schermo intero ↗</a>
                <a href={doc.file} download style={s.btnLight}>⬇ Scarica PDF</a>
              </div>
              <div style={s.pdfWrap}>
                <object data={doc.file} type="application/pdf" style={{ width: "100%", height: "78vh", display: "block" }}>
                  <div style={{ padding: "40px 32px", textAlign: "center" }}>
                    <p style={{ color: "#6b6b73", marginBottom: 20, fontSize: ".95rem" }}>Il tuo browser non mostra il PDF inline.</p>
                    <a href={doc.file} target="_blank" rel="noopener noreferrer"
                      style={{ background: "#ff5a00", color: "#fff", padding: "12px 24px", borderRadius: 100, fontWeight: 700, textDecoration: "none" }}>
                      Apri il documento
                    </a>
                  </div>
                </object>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}