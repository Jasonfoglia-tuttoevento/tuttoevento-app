import Link from "next/link";

export const metadata = {
  title: "Cookie Policy | TuttoEvento",
  description: "Informativa sull'uso dei cookie ai sensi del GDPR",
};

const headerStyle = { borderBottom: "1px solid #e5e5e5", background: "#fff", padding: "16px 20px" };
const headerInner = { maxWidth: 780, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" };
const logoStyle = { fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "1rem", letterSpacing: "-.04em", textDecoration: "none", color: "#0a0a0b" };
const bodyStyle = { maxWidth: 780, margin: "0 auto", padding: "40px 20px 80px", fontFamily: "'Manrope',system-ui,sans-serif", color: "#0a0a0b" };
const h1Style = { fontFamily: "'Sora',sans-serif", fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-.03em", marginBottom: 8, marginTop: 0 };
const h2Style = { fontFamily: "'Sora',sans-serif", fontSize: "1.2rem", fontWeight: 700, margin: "2.5rem 0 .75rem", color: "#0a0a0b" };
const h3Style = { fontSize: "1rem", fontWeight: 700, margin: "1.5rem 0 .5rem" };
const pStyle = { lineHeight: 1.8, marginBottom: "1rem", color: "#333" };
const ulStyle = { paddingLeft: "1.5rem", marginBottom: "1rem" };
const liStyle = { lineHeight: 1.8, marginBottom: ".4rem", color: "#333" };
const tableStyle = { width: "100%", borderCollapse: "collapse", margin: "1rem 0 1.5rem", fontSize: ".875rem" };
const thStyle = { background: "#f0f0f0", padding: 10, textAlign: "left", fontWeight: 700, border: "1px solid #ddd" };
const tdStyle = { padding: 10, border: "1px solid #ddd", verticalAlign: "top" };
const metaBox = { background: "#fff", border: "1px solid #e5e5e5", borderRadius: 16, padding: "20px 24px", marginBottom: "2.5rem", fontSize: ".9rem", color: "#6b6b73" };

export default function CookiePolicyPage() {
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Manrope:wght@400;500;600;700&display=swap');`}</style>
      <main style={{ background: "#fbfaf8", minHeight: "100vh", fontFamily: "'Manrope',system-ui,sans-serif" }}>
        <header style={headerStyle}>
          <div style={headerInner}>
            <Link href="/" style={logoStyle}>TUTTO<span style={{ color: "#ff5a00" }}>EVENTO</span></Link>
            <Link href="/" style={{ fontSize: ".875rem", color: "#6b6b73", textDecoration: "none", fontWeight: 600 }}>← Home</Link>
          </div>
        </header>

        <div style={bodyStyle}>
          <p style={{ color: "#ff5a00", fontWeight: 700, fontSize: ".75rem", letterSpacing: ".15em", textTransform: "uppercase", marginBottom: ".5rem" }}>Documento legale</p>
          <h1 style={h1Style}>Cookie Policy</h1>
          <p style={{ color: "#6b6b73", marginBottom: "2rem" }}>Ai sensi dell'art. 122 D.Lgs. 196/2003 e delle Linee Guida cookie del Garante del 10 giugno 2021</p>

          <div style={metaBox}>
            <strong>Titolare:</strong> TuttoEvento — info@tuttoevento.it<br/>
            <strong>Ultimo aggiornamento:</strong> Giugno 2026
          </div>

          <h2 style={h2Style}>1. Cosa sono i Cookie</h2>
          <p style={pStyle}>I cookie sono piccoli file di testo che i siti web inviano al terminale dell'utente (computer, tablet, smartphone), dove vengono memorizzati per essere ritrasmessi agli stessi siti alla visita successiva. Consentono al sito di ricordare azioni e preferenze dell'utente.</p>

          <h2 style={h2Style}>2. Cookie Utilizzati da TuttoEvento</h2>

          <h3 style={h3Style}>2.1 Cookie Tecnici (non richiedono consenso)</h3>
          <table style={tableStyle}>
            <thead>
              <tr><th style={thStyle}>Nome</th><th style={thStyle}>Finalità</th><th style={thStyle}>Durata</th><th style={thStyle}>Tipo</th></tr>
            </thead>
            <tbody>
              {[
                ["sb-access-token", "Autenticazione utente — token sessione Supabase", "1 ora", "HttpOnly, Secure"],
                ["sb-refresh-token", "Rinnovo automatico sessione", "30 giorni", "HttpOnly, Secure"],
                ["supabase-auth-token", "Stato autenticazione lato client", "Sessione", "JavaScript"],
                ["cookie-consent", "Memorizzazione scelta consenso cookie", "12 mesi", "JavaScript"],
              ].map(([a, b, c, d]) => (
                <tr key={a}><td style={tdStyle}>{a}</td><td style={tdStyle}>{b}</td><td style={tdStyle}>{c}</td><td style={tdStyle}>{d}</td></tr>
              ))}
            </tbody>
          </table>
          <p style={pStyle}>I cookie <em>sb-access-token</em> e <em>sb-refresh-token</em> sono impostati con flag <strong>HttpOnly</strong> e <strong>Secure</strong>: non accessibili via JavaScript e trasmessi solo su HTTPS.</p>

          <h3 style={h3Style}>2.2 Cookie Analitici</h3>
          <p style={pStyle}>Attualmente TuttoEvento non utilizza cookie analitici di terze parti. Qualora venissero introdotti, la policy verrà aggiornata e verrà richiesto consenso.</p>

          <h3 style={h3Style}>2.3 Cookie di Profilazione e Marketing</h3>
          <p style={pStyle}>TuttoEvento non utilizza cookie di profilazione o marketing di terze parti.</p>

          <h3 style={h3Style}>2.4 Cookie di Terze Parti</h3>
          <table style={tableStyle}>
            <thead>
              <tr><th style={thStyle}>Terza Parte</th><th style={thStyle}>Finalità</th><th style={thStyle}>Privacy Policy</th></tr>
            </thead>
            <tbody>
              {[
                ["Google Fonts (Google LLC)", "Caricamento font tipografici", "policies.google.com/privacy"],
                ["Unsplash (Unsplash Inc.)", "Immagini stock (solo homepage)", "unsplash.com/privacy"],
              ].map(([a, b, c]) => (
                <tr key={a}><td style={tdStyle}>{a}</td><td style={tdStyle}>{b}</td><td style={tdStyle}>{c}</td></tr>
              ))}
            </tbody>
          </table>

          <h2 style={h2Style}>3. Web Storage</h2>
          <p style={pStyle}>TuttoEvento utilizza esclusivamente cookie sicuri (HttpOnly) per l'autenticazione. La piattaforma <strong>non utilizza</strong> localStorage o sessionStorage per dati personali o credenziali.</p>

          <h2 style={h2Style}>4. Notifiche Push</h2>
          <p style={pStyle}>Le notifiche push richiedono consenso esplicito dell'utente. Il token di dispositivo è conservato nel database e può essere revocato in qualsiasi momento dalle impostazioni del browser o dall'area personale.</p>

          <h2 style={h2Style}>5. Come Gestire i Cookie</h2>
          <p style={pStyle}>Al primo accesso viene mostrato un banner per accettare o rifiutare cookie non tecnici. Puoi anche gestire i cookie dal tuo browser:</p>
          <ul style={ulStyle}>
            <li style={liStyle}><strong>Chrome:</strong> Impostazioni → Privacy e sicurezza → Cookie</li>
            <li style={liStyle}><strong>Firefox:</strong> Opzioni → Privacy e sicurezza → Cookie</li>
            <li style={liStyle}><strong>Safari:</strong> Preferenze → Privacy → Gestisci dati siti</li>
            <li style={liStyle}><strong>Edge:</strong> Impostazioni → Cookie e autorizzazioni sito</li>
          </ul>
          <p style={pStyle}><strong>Attenzione:</strong> disabilitare i cookie tecnici può compromettere l'autenticazione e l'accesso alla piattaforma.</p>

          <h2 style={h2Style}>6. Durata del Consenso e Revoca</h2>
          <p style={pStyle}>Il consenso dura 12 mesi, al termine dei quali viene nuovamente richiesto. Puoi revocare in qualsiasi momento tramite il link "Gestisci preferenze cookie" nel footer o le impostazioni del browser.</p>

          <h2 style={h2Style}>7. Basi Giuridiche</h2>
          <p style={pStyle}>Cookie tecnici: esecuzione del contratto (art. 6.1.b GDPR) e legittimo interesse (art. 6.1.f GDPR). Cookie analitici/profilazione: consenso dell'utente (art. 6.1.a GDPR), revocabile in qualsiasi momento.</p>

          <h2 style={h2Style}>8. Aggiornamenti</h2>
          <p style={pStyle}>La Cookie Policy può essere aggiornata in qualsiasi momento. La data dell'ultimo aggiornamento è indicata in cima. Modifiche sostanziali vengono comunicate tramite banner sul sito.</p>

          <div style={{ borderTop: "1px solid #e5e5e5", marginTop: "3rem", paddingTop: "2rem", fontSize: ".85rem", color: "#6b6b73" }}>
            <p>
              <Link href="/privacy" style={{ color: "#ff5a00", fontWeight: 600, marginRight: 24 }}>Privacy Policy</Link>
              <Link href="/" style={{ color: "#6b6b73", fontWeight: 600 }}>Home</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}