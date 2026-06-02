import Link from "next/link";

export const metadata = {
  title: "Cookie Policy | TuttoEvento",
  description: "Informativa sull'uso dei cookie ai sensi del GDPR",
};

export default function CookiePolicyPage() {
  return (
    <main className="te-legal-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Manrope:wght@400;500;600;700&display=swap');
        .te-legal-root { --orange:#ff5a00; --ink:#0a0a0b; --paper:#fbfaf8; --muted:#6b6b73; font-family:'Manrope',system-ui,sans-serif; color:var(--ink); background:var(--paper); min-height:100vh; }
        .te-legal-display { font-family:'Sora',sans-serif; letter-spacing:-0.03em; }
        .te-legal-body { max-width:780px; margin:0 auto; padding:40px 20px 80px; }
        .te-legal-body h1 { font-family:'Sora',sans-serif; font-size:2.2rem; font-weight:800; letter-spacing:-0.03em; margin-bottom:8px; }
        .te-legal-body h2 { font-family:'Sora',sans-serif; font-size:1.2rem; font-weight:700; margin:2.5rem 0 0.75rem; }
        .te-legal-body h3 { font-size:1rem; font-weight:700; margin:1.5rem 0 0.5rem; }
        .te-legal-body p { line-height:1.8; margin-bottom:1rem; color:#333; }
        .te-legal-body ul { padding-left:1.5rem; margin-bottom:1rem; }
        .te-legal-body li { line-height:1.8; margin-bottom:0.4rem; color:#333; }
        .te-legal-body table { width:100%; border-collapse:collapse; margin:1rem 0 1.5rem; font-size:0.875rem; }
        .te-legal-body th { background:#f0f0f0; padding:10px; text-align:left; font-weight:700; border:1px solid #ddd; }
        .te-legal-body td { padding:10px; border:1px solid #ddd; vertical-align:top; }
        .te-legal-meta { background:white; border:1px solid #e5e5e5; border-radius:16px; padding:20px 24px; margin-bottom:2.5rem; font-size:0.9rem; color:var(--muted); }
      `}</style>

      <header style={{ borderBottom:"1px solid #e5e5e5", background:"white", padding:"16px 20px" }}>
        <div style={{ maxWidth:780, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Link href="/" className="te-legal-display" style={{ fontWeight:800, fontSize:"1rem", textDecoration:"none", color:"#0a0a0b" }}>
            TUTTO<span style={{ color:"#ff5a00" }}>EVENTO</span>
          </Link>
          <Link href="/" style={{ fontSize:"0.875rem", color:"#6b6b73", textDecoration:"none", fontWeight:600 }}>← Home</Link>
        </div>
      </header>

      <div className="te-legal-body">
        <p style={{ color:"#ff5a00", fontWeight:700, fontSize:"0.75rem", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:"0.5rem" }}>Documento legale</p>
        <h1>Cookie Policy</h1>
        <p style={{ color:"#6b6b73", marginBottom:"2rem" }}>Ai sensi dell'art. 122 D.Lgs. 196/2003, del Provvedimento del Garante dell'8 maggio 2014 e delle Linee Guida cookie del Garante del 10 giugno 2021</p>

        <div className="te-legal-meta">
          <strong>Titolare del Trattamento:</strong> TuttoEvento — info@tuttoevento.it<br/>
          <strong>Data ultimo aggiornamento:</strong> Giugno 2026
        </div>

        <h2>1. Cosa sono i Cookie</h2>
        <p>I cookie sono piccoli file di testo che i siti web visitati dall'utente inviano al suo terminale (computer, tablet, smartphone), dove vengono memorizzati per essere poi ritrasmessi agli stessi siti alla visita successiva. Grazie ai cookie, un sito web ricorda le azioni e le preferenze dell'utente (come, ad esempio, i dati di login, la lingua prescelta, le dimensioni dei caratteri, ecc.) in modo che non debbano essere indicate nuovamente.</p>
        <p>I cookie vengono utilizzati per diverse finalità: esecuzione di autenticazioni informatiche, monitoraggio delle sessioni e memorizzazione di informazioni specifiche sugli utenti che accedono al server.</p>

        <h2>2. Tipologie di Cookie Utilizzati da TuttoEvento</h2>

        <h3>2.1 Cookie Tecnici (non richiedono consenso)</h3>
        <p>I cookie tecnici sono quelli utilizzati al solo fine di effettuare la trasmissione di una comunicazione su una rete di comunicazione elettronica, o nella misura strettamente necessaria al fornitore di un servizio della società dell'informazione esplicitamente richiesto dall'abbonato o dall'utente a erogare tale servizio.</p>

        <table>
          <thead>
            <tr><th>Nome Cookie</th><th>Finalità</th><th>Durata</th><th>Tipo</th></tr>
          </thead>
          <tbody>
            <tr><td>sb-access-token</td><td>Autenticazione utente — token di sessione Supabase Auth</td><td>Sessione (1 ora)</td><td>HttpOnly, Secure</td></tr>
            <tr><td>sb-refresh-token</td><td>Rinnovo automatico della sessione di autenticazione</td><td>30 giorni</td><td>HttpOnly, Secure</td></tr>
            <tr><td>supabase-auth-token</td><td>Stato di autenticazione lato client</td><td>Sessione</td><td>JavaScript</td></tr>
            <tr><td>cookie-consent</td><td>Memorizzazione della scelta dell'utente sul consenso cookie</td><td>12 mesi</td><td>JavaScript</td></tr>
          </tbody>
        </table>

        <p>I cookie tecnici di autenticazione (<em>sb-access-token</em> e <em>sb-refresh-token</em>) sono impostati con i flag <strong>HttpOnly</strong> e <strong>Secure</strong>, il che significa che non sono accessibili tramite JavaScript lato client e vengono trasmessi esclusivamente su connessioni HTTPS cifrate, garantendo un elevato livello di sicurezza contro attacchi XSS e man-in-the-middle.</p>

        <h3>2.2 Cookie Analitici (richiedono consenso)</h3>
        <p>Attualmente TuttoEvento non utilizza cookie analitici di terze parti. Qualora venissero introdotti strumenti di analisi (es. Google Analytics con IP anonimizzato), la presente Cookie Policy verrà aggiornata e verrà richiesto il consenso dell'utente.</p>

        <h3>2.3 Cookie di Profilazione e Marketing (richiedono consenso)</h3>
        <p>TuttoEvento non utilizza attualmente cookie di profilazione o marketing di terze parti.</p>

        <h3>2.4 Cookie di Terze Parti</h3>
        <p>La piattaforma può caricare risorse da domini terzi (es. Google Fonts per i caratteri tipografici). Queste risorse possono impostare cookie tecnici propri, soggetti alle rispettive privacy policy:</p>
        <table>
          <thead>
            <tr><th>Terza Parte</th><th>Finalità</th><th>Privacy Policy</th></tr>
          </thead>
          <tbody>
            <tr><td>Google Fonts (Google LLC)</td><td>Caricamento font tipografici</td><td>policies.google.com/privacy</td></tr>
            <tr><td>Unsplash (Unsplash Inc.)</td><td>Immagini stock (solo homepage)</td><td>unsplash.com/privacy</td></tr>
          </tbody>
        </table>

        <h2>3. Web Storage (localStorage e sessionStorage)</h2>
        <p>TuttoEvento utilizza esclusivamente meccanismi di autenticazione basati su cookie sicuri (HttpOnly). La piattaforma non utilizza localStorage o sessionStorage per conservare dati personali o credenziali di accesso degli utenti.</p>

        <h2>4. Notifiche Push</h2>
        <p>TuttoEvento offre la possibilità di ricevere notifiche push sul proprio dispositivo. Le notifiche push utilizzano le Web Push API e richiedono il consenso esplicito dell'utente attraverso il browser. Il token di dispositivo generato per l'invio delle notifiche è conservato nel database di TuttoEvento e può essere revocato in qualsiasi momento dall'utente attraverso le impostazioni del browser o dall'area personale della piattaforma.</p>

        <h2>5. Come Gestire i Cookie</h2>
        <p>Al primo accesso alla piattaforma, all'utente viene presentato un banner informativo che consente di accettare o rifiutare i cookie non tecnici. La scelta viene memorizzata per 12 mesi.</p>
        <p>L'utente può inoltre gestire, disabilitare o eliminare i cookie direttamente dal proprio browser:</p>
        <ul>
          <li><strong>Google Chrome:</strong> Impostazioni → Privacy e sicurezza → Cookie e altri dati dei siti</li>
          <li><strong>Mozilla Firefox:</strong> Opzioni → Privacy e sicurezza → Cookie e dati dei siti</li>
          <li><strong>Safari:</strong> Preferenze → Privacy → Gestisci dati siti web</li>
          <li><strong>Microsoft Edge:</strong> Impostazioni → Cookie e autorizzazioni sito → Cookie e dati archiviati</li>
        </ul>
        <p><strong>Attenzione:</strong> la disabilitazione dei cookie tecnici potrebbe compromettere il corretto funzionamento della piattaforma, in particolare le funzionalità di autenticazione e accesso all'area riservata.</p>

        <h2>6. Durata del Consenso e Revoca</h2>
        <p>Il consenso prestato dall'utente per i cookie non tecnici ha una durata di 12 mesi, al termine dei quali verrà nuovamente richiesto. L'utente può revocare il consenso in qualsiasi momento cliccando sul link "Gestisci preferenze cookie" presente nel footer del sito o nelle impostazioni del proprio browser.</p>

        <h2>7. Basi Giuridiche</h2>
        <p>Il trattamento dei dati effettuato tramite cookie tecnici si basa sulla base giuridica dell'<strong>esecuzione del contratto</strong> (art. 6.1.b GDPR) e del <strong>legittimo interesse</strong> (art. 6.1.f GDPR) del Titolare a garantire il corretto funzionamento della piattaforma.</p>
        <p>Il trattamento dei dati effettuato tramite cookie analitici e di profilazione (ove presenti) si basa sul <strong>consenso</strong> dell'utente (art. 6.1.a GDPR), liberamente prestato, specifico, informato e revocabile in qualsiasi momento.</p>

        <h2>8. Aggiornamenti</h2>
        <p>La presente Cookie Policy può essere aggiornata in qualsiasi momento per riflettere modifiche tecniche, normative o operative. La data dell'ultimo aggiornamento è indicata in cima al documento. Modifiche sostanziali verranno comunicate tramite banner sul sito.</p>

        <div style={{ borderTop:"1px solid #e5e5e5", marginTop:"3rem", paddingTop:"2rem", fontSize:"0.85rem", color:"#6b6b73" }}>
          <p><Link href="/privacy" style={{ color:"#ff5a00", fontWeight:600, marginRight:"1.5rem" }}>Privacy Policy</Link>
          <Link href="/" style={{ color:"#6b6b73", fontWeight:600 }}>Home</Link></p>
        </div>
      </div>
    </main>
  );
}