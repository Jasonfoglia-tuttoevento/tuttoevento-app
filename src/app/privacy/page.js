import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | TuttoEvento",
  description: "Informativa sul trattamento dei dati personali ai sensi del GDPR",
};

const headerStyle = {
  borderBottom: "1px solid #e5e5e5", background: "#fff", padding: "16px 20px",
};
const headerInner = {
  maxWidth: 780, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between",
};
const logoStyle = {
  fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "1rem",
  letterSpacing: "-.04em", textDecoration: "none", color: "#0a0a0b",
};
const backStyle = {
  fontSize: ".875rem", color: "#6b6b73", textDecoration: "none", fontWeight: 600,
};
const bodyStyle = {
  maxWidth: 780, margin: "0 auto", padding: "40px 20px 80px",
  fontFamily: "'Manrope',system-ui,sans-serif", color: "#0a0a0b",
};
const h1Style = {
  fontFamily: "'Sora',sans-serif", fontSize: "2.2rem", fontWeight: 800,
  letterSpacing: "-.03em", marginBottom: 8, marginTop: 0,
};
const h2Style = {
  fontFamily: "'Sora',sans-serif", fontSize: "1.2rem", fontWeight: 700,
  margin: "2.5rem 0 .75rem", color: "#0a0a0b",
};
const h3Style = { fontSize: "1rem", fontWeight: 700, margin: "1.5rem 0 .5rem" };
const pStyle = { lineHeight: 1.8, marginBottom: "1rem", color: "#333" };
const ulStyle = { paddingLeft: "1.5rem", marginBottom: "1rem" };
const liStyle = { lineHeight: 1.8, marginBottom: ".4rem", color: "#333" };
const tableStyle = { width: "100%", borderCollapse: "collapse", margin: "1rem 0 1.5rem", fontSize: ".9rem" };
const thStyle = { background: "#f0f0f0", padding: 10, textAlign: "left", fontWeight: 700, border: "1px solid #ddd" };
const tdStyle = { padding: 10, border: "1px solid #ddd", verticalAlign: "top" };
const metaBox = {
  background: "#fff", border: "1px solid #e5e5e5", borderRadius: 16,
  padding: "20px 24px", marginBottom: "2.5rem", fontSize: ".9rem", color: "#6b6b73",
};

export default function PrivacyPage() {
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Manrope:wght@400;500;600;700&display=swap');`}</style>
      <main style={{ background: "#fbfaf8", minHeight: "100vh", fontFamily: "'Manrope',system-ui,sans-serif" }}>
        <header style={headerStyle}>
          <div style={headerInner}>
            <Link href="/" style={logoStyle}>TUTTO<span style={{ color: "#ff5a00" }}>EVENTO</span></Link>
            <Link href="/" style={backStyle}>← Home</Link>
          </div>
        </header>

        <div style={bodyStyle}>
          <p style={{ color: "#ff5a00", fontWeight: 700, fontSize: ".75rem", letterSpacing: ".15em", textTransform: "uppercase", marginBottom: ".5rem" }}>Documento legale</p>
          <h1 style={h1Style}>Informativa sulla Privacy</h1>
          <p style={{ color: "#6b6b73", marginBottom: "2rem" }}>Ai sensi degli artt. 13 e 14 del Regolamento UE 2016/679 (GDPR) e del D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018</p>

          <div style={metaBox}>
            <strong>Titolare del Trattamento:</strong> TuttoEvento — fogliapellegrinojason@gmail.com<br/>
            <strong>Data ultimo aggiornamento:</strong> Giugno 2026<br/>
            <strong>Versione:</strong> 1.0
          </div>

          <h2 style={h2Style}>1. Identità e Dati di Contatto del Titolare</h2>
          <p style={pStyle}>Il Titolare del Trattamento è <strong>TuttoEvento</strong>, con sede operativa in Italia, raggiungibile a: <strong>info@tuttoevento.it</strong>. Per richieste sui dati personali: <strong>privacy@tuttoevento.it</strong>.</p>

          <h2 style={h2Style}>2. Tipologie di Dati Raccolti</h2>
          <h3 style={h3Style}>2.1 Dati forniti direttamente dall'Utente</h3>
          <ul style={ulStyle}>
            <li style={liStyle}><strong>Dati anagrafici:</strong> nome e cognome o nome d'arte/ragione sociale</li>
            <li style={liStyle}><strong>Dati di contatto:</strong> indirizzo email, numero di telefono (ove fornito)</li>
            <li style={liStyle}><strong>Profilo professionale:</strong> tipologia, generi musicali, cachet, disponibilità, biografia, foto, link social</li>
            <li style={liStyle}><strong>Dati eventi e booking:</strong> titolo, data, luogo, artisti, dettagli organizzativi</li>
            <li style={liStyle}><strong>Comunicazioni:</strong> messaggi scambiati tramite chat interna</li>
            <li style={liStyle}><strong>Credenziali:</strong> email e password (cifrata con bcrypt)</li>
          </ul>
          <h3 style={h3Style}>2.2 Dati raccolti automaticamente</h3>
          <ul style={ulStyle}>
            <li style={liStyle}><strong>Dati di navigazione:</strong> IP, browser, sistema operativo, pagine visitate</li>
            <li style={liStyle}><strong>Cookie tecnici:</strong> necessari al funzionamento (vedi Cookie Policy)</li>
            <li style={liStyle}><strong>Log di sicurezza:</strong> azioni sulla piattaforma</li>
            <li style={liStyle}><strong>Token push:</strong> solo previo consenso esplicito</li>
          </ul>

          <h2 style={h2Style}>3. Finalità e Basi Giuridiche</h2>
          <table style={tableStyle}>
            <thead>
              <tr><th style={thStyle}>Finalità</th><th style={thStyle}>Base Giuridica</th><th style={thStyle}>Conservazione</th></tr>
            </thead>
            <tbody>
              {[
                ["Gestione account", "Esecuzione contratto (art. 6.1.b)", "Fino a cancellazione + 2 anni"],
                ["Erogazione servizi", "Esecuzione contratto (art. 6.1.b)", "Durata rapporto"],
                ["Email transazionali", "Esecuzione contratto (art. 6.1.b)", "Necessario"],
                ["Obblighi legali/fiscali", "Obbligo legale (art. 6.1.c)", "10 anni"],
                ["Sicurezza e anti-frode", "Legittimo interesse (art. 6.1.f)", "12 mesi"],
                ["Analisi statistica anonima", "Legittimo interesse (art. 6.1.f)", "24 mesi aggregati"],
                ["Newsletter/comunicazioni commerciali", "Consenso (art. 6.1.a)", "Fino a revoca"],
                ["Notifiche push", "Consenso (art. 6.1.a)", "Fino a revoca/disinstallazione"],
              ].map(([a, b, c]) => (
                <tr key={a}><td style={tdStyle}>{a}</td><td style={tdStyle}>{b}</td><td style={tdStyle}>{c}</td></tr>
              ))}
            </tbody>
          </table>

          <h2 style={h2Style}>4. Misure di Sicurezza</h2>
          <ul style={ulStyle}>
            <li style={liStyle}>Cifratura password tramite bcrypt con salt casuale</li>
            <li style={liStyle}>Trasmissione dati tramite HTTPS/TLS</li>
            <li style={liStyle}>Autenticazione con cookie HttpOnly e Secure</li>
            <li style={liStyle}>Accesso ai dati limitato al personale autorizzato</li>
            <li style={liStyle}>Backup periodici cifrati</li>
            <li style={liStyle}>Monitoraggio continuo per accessi non autorizzati</li>
          </ul>

          <h2 style={h2Style}>5. Responsabili del Trattamento</h2>
          <table style={tableStyle}>
            <thead>
              <tr><th style={thStyle}>Fornitore</th><th style={thStyle}>Servizio</th><th style={thStyle}>Sede</th><th style={thStyle}>Garanzie</th></tr>
            </thead>
            <tbody>
              {[
                ["Supabase Inc.", "Database e autenticazione", "USA (AWS eu-west-1)", "SCC"],
                ["Vercel Inc.", "Hosting e deployment", "USA (server EU)", "SCC"],
                ["Resend Inc.", "Email transazionali", "USA", "SCC"],
              ].map(([a, b, c, d]) => (
                <tr key={a}><td style={tdStyle}>{a}</td><td style={tdStyle}>{b}</td><td style={tdStyle}>{c}</td><td style={tdStyle}>{d}</td></tr>
              ))}
            </tbody>
          </table>

          <h2 style={h2Style}>6. Diritti dell'Interessato</h2>
          <ul style={ulStyle}>
            {[
              ["Accesso (art. 15)", "Ottenere conferma e accedere ai propri dati"],
              ["Rettifica (art. 16)", "Correggere dati inesatti o incompleti"],
              ["Cancellazione (art. 17)", "Ottenere la cancellazione dei propri dati"],
              ["Limitazione (art. 18)", "Limitare il trattamento in determinati casi"],
              ["Portabilità (art. 20)", "Ricevere i dati in formato strutturato"],
              ["Opposizione (art. 21)", "Opporsi al trattamento per marketing"],
              ["Revoca consenso", "Revocare il consenso in qualsiasi momento"],
              ["Reclamo al Garante", "Proporre reclamo a www.garanteprivacy.it"],
            ].map(([k, v]) => (
              <li key={k} style={liStyle}><strong>{k}:</strong> {v}</li>
            ))}
          </ul>
          <p style={pStyle}>Per esercitare i diritti: <strong>privacy@tuttoevento.it</strong>. Risposta entro 30 giorni.</p>

          <h2 style={h2Style}>7. Conservazione dei Dati</h2>
          <p style={pStyle}>Dati cancellati entro 30 giorni dalla richiesta, salvo obblighi legali (dati fiscali: 10 anni). Log di sicurezza: 12 mesi. Messaggi chat: 90 giorni dalla chiusura account.</p>

          <h2 style={h2Style}>8. Cookie</h2>
          <p style={pStyle}>Per i dettagli sui cookie, consulta la <Link href="/cookie-policy" style={{ color: "#ff5a00", fontWeight: 700 }}>Cookie Policy</Link>.</p>

          <h2 style={h2Style}>9. Minori</h2>
          <p style={pStyle}>I servizi sono riservati a maggiorenni (18+). In caso di registrazione di minori, i dati vengono immediatamente cancellati. Segnalazioni: privacy@tuttoevento.it.</p>

          <h2 style={h2Style}>10. Modifiche</h2>
          <p style={pStyle}>Il Titolare può modificare questa Informativa in qualsiasi momento. Modifiche sostanziali verranno comunicate via email con almeno 15 giorni di preavviso.</p>

          <div style={{ borderTop: "1px solid #e5e5e5", marginTop: "3rem", paddingTop: "2rem", fontSize: ".85rem", color: "#6b6b73" }}>
            <p style={{ marginBottom: 8 }}><strong>TuttoEvento</strong> — info@tuttoevento.it — www.tuttoevento.it</p>
            <p>
              <Link href="/cookie-policy" style={{ color: "#ff5a00", fontWeight: 600, marginRight: 24 }}>Cookie Policy</Link>
              <Link href="/" style={{ color: "#6b6b73", fontWeight: 600 }}>Home</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}