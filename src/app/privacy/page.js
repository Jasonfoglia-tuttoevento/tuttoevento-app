import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | TuttoEvento",
  description: "Informativa sul trattamento dei dati personali ai sensi del GDPR",
};

export default function PrivacyPage() {
  return (
    <main className="te-legal-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Manrope:wght@400;500;600;700&display=swap');
        .te-legal-root { --orange:#ff5a00; --ink:#0a0a0b; --paper:#fbfaf8; --muted:#6b6b73; font-family:'Manrope',system-ui,sans-serif; color:var(--ink); background:var(--paper); min-height:100vh; }
        .te-legal-display { font-family:'Sora',sans-serif; letter-spacing:-0.03em; }
        .te-legal-body { max-width:780px; margin:0 auto; padding:40px 20px 80px; }
        .te-legal-body h1 { font-family:'Sora',sans-serif; font-size:2.2rem; font-weight:800; letter-spacing:-0.03em; margin-bottom:8px; }
        .te-legal-body h2 { font-family:'Sora',sans-serif; font-size:1.2rem; font-weight:700; margin:2.5rem 0 0.75rem; color:var(--ink); }
        .te-legal-body h3 { font-size:1rem; font-weight:700; margin:1.5rem 0 0.5rem; }
        .te-legal-body p { line-height:1.8; margin-bottom:1rem; color:#333; }
        .te-legal-body ul { padding-left:1.5rem; margin-bottom:1rem; }
        .te-legal-body li { line-height:1.8; margin-bottom:0.4rem; color:#333; }
        .te-legal-body table { width:100%; border-collapse:collapse; margin:1rem 0 1.5rem; font-size:0.9rem; }
        .te-legal-body th { background:#f0f0f0; padding:10px; text-align:left; font-weight:700; border:1px solid #ddd; }
        .te-legal-body td { padding:10px; border:1px solid #ddd; vertical-align:top; }
        .te-legal-meta { background:white; border:1px solid #e5e5e5; border-radius:16px; padding:20px 24px; margin-bottom:2.5rem; font-size:0.9rem; color:var(--muted); }
        .te-legal-meta strong { color:var(--ink); }
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
        <h1>Informativa sulla Privacy</h1>
        <p style={{ color:"#6b6b73", marginBottom:"2rem" }}>Ai sensi degli artt. 13 e 14 del Regolamento UE 2016/679 (GDPR) e del D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018</p>

        <div className="te-legal-meta">
          <strong>Titolare del Trattamento:</strong> TuttoEvento (in fase di costituzione societaria) — fogliapellegrinojason@gmail.com<br/>
          <strong>Data ultimo aggiornamento:</strong> Giugno 2026<br/>
          <strong>Versione:</strong> 1.0
        </div>

        <h2>1. Identità e Dati di Contatto del Titolare del Trattamento</h2>
        <p>Il Titolare del Trattamento dei dati personali raccolti attraverso la piattaforma TuttoEvento, accessibile all'indirizzo <strong>www.tuttoevento.it</strong>, è <strong>TuttoEvento</strong>, con sede operativa in Italia, raggiungibile all'indirizzo email: <strong>info@tuttoevento.it</strong>.</p>
        <p>Per qualsiasi richiesta relativa al trattamento dei Suoi dati personali, l'Utente può contattare il Titolare scrivendo a: <strong>privacy@tuttoevento.it</strong>.</p>

        <h2>2. Tipologie di Dati Raccolti</h2>
        <p>TuttoEvento raccoglie le seguenti categorie di dati personali:</p>

        <h3>2.1 Dati forniti direttamente dall'Utente</h3>
        <ul>
          <li><strong>Dati anagrafici:</strong> nome e cognome o nome d'arte/ragione sociale</li>
          <li><strong>Dati di contatto:</strong> indirizzo email, numero di telefono (ove fornito)</li>
          <li><strong>Dati del profilo professionale:</strong> tipologia di artista, generi musicali, cachet, disponibilità, biografia, foto, link ai profili social (Instagram, Spotify, YouTube, SoundCloud, TikTok)</li>
          <li><strong>Dati relativi agli eventi:</strong> titolo evento, data, luogo, artisti coinvolti, dettagli organizzativi</li>
          <li><strong>Dati relativi ai booking:</strong> richieste di prenotazione, stato della prenotazione, comunicazioni tra le parti</li>
          <li><strong>Comunicazioni:</strong> messaggi scambiati tramite il sistema di chat interno alla piattaforma</li>
          <li><strong>Credenziali di accesso:</strong> indirizzo email e password (quest'ultima conservata in forma cifrata tramite algoritmo bcrypt)</li>
        </ul>

        <h3>2.2 Dati raccolti automaticamente</h3>
        <ul>
          <li><strong>Dati di navigazione:</strong> indirizzo IP, tipo di browser, sistema operativo, pagine visitate, durata della visita</li>
          <li><strong>Cookie tecnici e di sessione:</strong> necessari al funzionamento della piattaforma (vedi Cookie Policy)</li>
          <li><strong>Dati di log:</strong> registrazioni delle attività effettuate sulla piattaforma per finalità di sicurezza</li>
          <li><strong>Notifiche push:</strong> token di dispositivo per l'invio di notifiche (solo previo consenso esplicito)</li>
        </ul>

        <h3>2.3 Dati di terze parti</h3>
        <p>TuttoEvento non acquista né ottiene dati personali da fonti terze. I dati di utenti menzionati da altri utenti (es. nome di un artista inserito da un organizzatore) vengono trattati nel rispetto del principio di minimizzazione dei dati.</p>

        <h2>3. Finalità e Basi Giuridiche del Trattamento</h2>
        <table>
          <thead>
            <tr><th>Finalità</th><th>Base Giuridica (art. 6 GDPR)</th><th>Periodo di Conservazione</th></tr>
          </thead>
          <tbody>
            <tr><td>Registrazione e gestione dell'account utente</td><td>Esecuzione del contratto (art. 6.1.b)</td><td>Fino alla cancellazione dell'account + 2 anni</td></tr>
            <tr><td>Erogazione dei servizi della piattaforma (marketplace, booking, chat)</td><td>Esecuzione del contratto (art. 6.1.b)</td><td>Durata del rapporto contrattuale</td></tr>
            <tr><td>Invio email transazionali (conferma registrazione, reset password)</td><td>Esecuzione del contratto (art. 6.1.b)</td><td>Necessario per l'erogazione del servizio</td></tr>
            <tr><td>Adempimento di obblighi legali e fiscali</td><td>Obbligo legale (art. 6.1.c)</td><td>10 anni (obblighi fiscali) o termine di legge</td></tr>
            <tr><td>Sicurezza della piattaforma e prevenzione frodi</td><td>Legittimo interesse (art. 6.1.f)</td><td>12 mesi dalla raccolta</td></tr>
            <tr><td>Analisi statistica aggregata e anonimizzata sull'utilizzo della piattaforma</td><td>Legittimo interesse (art. 6.1.f)</td><td>24 mesi in forma aggregata</td></tr>
            <tr><td>Invio di comunicazioni commerciali e newsletter</td><td>Consenso (art. 6.1.a)</td><td>Fino alla revoca del consenso</td></tr>
            <tr><td>Notifiche push</td><td>Consenso (art. 6.1.a)</td><td>Fino alla revoca del consenso o disinstallazione</td></tr>
          </tbody>
        </table>

        <h2>4. Modalità del Trattamento</h2>
        <p>Il trattamento dei dati personali viene effettuato con strumenti elettronici e informatici, adottando misure tecniche e organizzative adeguate a garantire un livello di sicurezza appropriato al rischio, ai sensi dell'art. 32 GDPR.</p>
        <p>In particolare, TuttoEvento adotta le seguenti misure di sicurezza:</p>
        <ul>
          <li>Cifratura delle password tramite algoritmo bcrypt con salt casuale</li>
          <li>Trasmissione dei dati tramite protocollo HTTPS/TLS</li>
          <li>Autenticazione sicura tramite token JWT con scadenza e cookie HttpOnly</li>
          <li>Accesso ai dati limitato al personale autorizzato secondo il principio del minimo privilegio</li>
          <li>Backup periodici dei dati con cifratura a riposo</li>
          <li>Monitoraggio continuo per la rilevazione di accessi non autorizzati</li>
        </ul>

        <h2>5. Responsabili del Trattamento e Sub-Responsabili</h2>
        <p>Per l'erogazione dei servizi, TuttoEvento si avvale di fornitori terzi che trattano i dati in qualità di Responsabili del Trattamento ai sensi dell'art. 28 GDPR. I principali fornitori sono:</p>
        <table>
          <thead>
            <tr><th>Fornitore</th><th>Servizio</th><th>Sede</th><th>Garanzie</th></tr>
          </thead>
          <tbody>
            <tr><td>Supabase Inc.</td><td>Database e autenticazione</td><td>USA (AWS eu-west-1)</td><td>Standard Contractual Clauses (SCC)</td></tr>
            <tr><td>Vercel Inc.</td><td>Hosting e deployment</td><td>USA (server EU disponibili)</td><td>Standard Contractual Clauses (SCC)</td></tr>
            <tr><td>Resend Inc.</td><td>Invio email transazionali</td><td>USA</td><td>Standard Contractual Clauses (SCC)</td></tr>
          </tbody>
        </table>
        <p>Il trasferimento di dati verso paesi terzi (USA) avviene nel rispetto delle garanzie di cui agli artt. 44-49 GDPR, tramite Clausole Contrattuali Standard approvate dalla Commissione Europea.</p>

        <h2>6. Comunicazione e Diffusione dei Dati</h2>
        <p>I dati personali degli Utenti non vengono venduti, ceduti o comunicati a terzi per finalità proprie di questi ultimi, salvo nei seguenti casi:</p>
        <ul>
          <li><strong>Dati di profilo pubblico degli artisti:</strong> nome d'arte, generi musicali, tipologia, disponibilità e foto sono visibili agli organizzatori registrati nella piattaforma per finalità di booking</li>
          <li><strong>Dati di contatto tra le parti:</strong> nell'ambito di un booking confermato, le parti coinvolte hanno accesso ai dati necessari all'esecuzione del servizio</li>
          <li><strong>Autorità competenti:</strong> su richiesta motivata delle autorità giudiziarie o di pubblica sicurezza, nei limiti consentiti dalla legge</li>
          <li><strong>Consulenti e professionisti:</strong> avvocati, commercialisti e altri professionisti che necessitano di accedere ai dati per l'esercizio del loro incarico, vincolati da obblighi di riservatezza</li>
        </ul>

        <h2>7. Diritti dell'Interessato</h2>
        <p>Ai sensi degli artt. 15-22 GDPR, l'Utente ha il diritto di:</p>
        <ul>
          <li><strong>Accesso (art. 15):</strong> ottenere conferma che sia in corso un trattamento di dati che lo riguardano e accedere a tali dati</li>
          <li><strong>Rettifica (art. 16):</strong> ottenere la rettifica dei dati personali inesatti o incompleti</li>
          <li><strong>Cancellazione ("diritto all'oblio", art. 17):</strong> ottenere la cancellazione dei propri dati personali, salvo che il trattamento sia necessario per l'adempimento di obblighi legali</li>
          <li><strong>Limitazione del trattamento (art. 18):</strong> ottenere la limitazione del trattamento in determinati casi previsti dalla legge</li>
          <li><strong>Portabilità dei dati (art. 20):</strong> ricevere i propri dati in formato strutturato, di uso comune e leggibile da dispositivo automatico</li>
          <li><strong>Opposizione (art. 21):</strong> opporsi in qualsiasi momento al trattamento dei propri dati per finalità di marketing diretto o basato su legittimo interesse</li>
          <li><strong>Revoca del consenso:</strong> revocare in qualsiasi momento il consenso prestato, senza pregiudicare la liceità del trattamento effettuato prima della revoca</li>
          <li><strong>Reclamo all'Autorità di controllo:</strong> proporre reclamo al Garante per la protezione dei dati personali (www.garanteprivacy.it)</li>
        </ul>
        <p>Per esercitare i propri diritti, l'Utente può inviare richiesta scritta a <strong>privacy@tuttoevento.it</strong>. Il Titolare risponderà entro 30 giorni dalla ricezione della richiesta, prorogabili di ulteriori 60 giorni in caso di particolare complessità.</p>

        <h2>8. Conservazione dei Dati</h2>
        <p>I dati personali vengono conservati per il tempo strettamente necessario al conseguimento delle finalità per cui sono stati raccolti, nel rispetto dei principi di minimizzazione e limitazione della conservazione (art. 5 GDPR).</p>
        <p>In caso di cancellazione dell'account, i dati personali dell'Utente vengono eliminati entro 30 giorni dalla richiesta, salvo quelli necessari per l'adempimento di obblighi legali (es. dati fiscali, conservati per 10 anni ai sensi del D.P.R. 633/1972).</p>
        <p>I log di sicurezza vengono conservati per 12 mesi. I messaggi della chat vengono conservati per la durata del rapporto contrattuale e cancellati entro 90 giorni dalla chiusura dell'account.</p>

        <h2>9. Cookie e Tecnologie di Tracciamento</h2>
        <p>TuttoEvento utilizza cookie e tecnologie analoghe per il funzionamento della piattaforma. Per informazioni dettagliate sui cookie utilizzati, le finalità e le modalità di gestione del consenso, si rimanda alla <Link href="/cookie-policy" style={{ color:"#ff5a00", fontWeight:700 }}>Cookie Policy</Link>.</p>

        <h2>10. Minori</h2>
        <p>I servizi di TuttoEvento sono destinati esclusivamente a persone maggiorenni (18 anni o più). TuttoEvento non raccoglie consapevolmente dati personali di minori di 18 anni. Qualora venisse rilevata la registrazione di un minore, i relativi dati verranno immediatamente cancellati. I genitori o tutori che ritenessero che un minore abbia fornito dati personali alla piattaforma sono invitati a contattare immediatamente privacy@tuttoevento.it.</p>

        <h2>11. Trattamento Automatizzato e Profilazione</h2>
        <p>TuttoEvento non effettua trattamenti basati unicamente su processi decisionali automatizzati, inclusa la profilazione, che producano effetti giuridici o che incidano in modo analogo significativamente sull'Utente, ai sensi dell'art. 22 GDPR.</p>
        <p>Vengono effettuate elaborazioni statistiche aggregate e anonimizzate per il miglioramento della piattaforma, che non comportano la profilazione individuale degli utenti.</p>

        <h2>12. Modifiche alla Presente Informativa</h2>
        <p>Il Titolare si riserva il diritto di apportare modifiche alla presente Informativa in qualsiasi momento, dandone pubblicità agli Utenti attraverso la piattaforma. Si invita pertanto l'Utente a consultare regolarmente questa pagina. Le modifiche sostanziali verranno comunicate via email agli utenti registrati con almeno 15 giorni di preavviso.</p>
        <p>La data dell'ultima modifica è indicata in cima al presente documento. L'utilizzo continuato della piattaforma successivamente alla pubblicazione delle modifiche costituisce accettazione delle stesse.</p>

        <h2>13. Norme Applicabili</h2>
        <p>La presente Informativa è redatta in conformità a:</p>
        <ul>
          <li>Regolamento (UE) 2016/679 del Parlamento Europeo e del Consiglio (GDPR)</li>
          <li>D.Lgs. 30 giugno 2003, n. 196 (Codice in materia di protezione dei dati personali)</li>
          <li>D.Lgs. 10 agosto 2018, n. 101 (adeguamento del Codice Privacy al GDPR)</li>
          <li>Provvedimenti del Garante per la protezione dei dati personali</li>
          <li>Linee guida dell'European Data Protection Board (EDPB)</li>
        </ul>

        <h2>14. Foro Competente</h2>
        <p>Per qualsiasi controversia relativa all'applicazione della presente Informativa, qualora non sia possibile una risoluzione amichevole, sarà competente il foro del luogo di residenza o domicilio dell'Utente consumatore, ai sensi dell'art. 66-bis del D.Lgs. 206/2005 (Codice del Consumo). In alternativa, l'Utente può proporre reclamo al Garante per la protezione dei dati personali.</p>

        <div style={{ borderTop:"1px solid #e5e5e5", marginTop:"3rem", paddingTop:"2rem", fontSize:"0.85rem", color:"#6b6b73" }}>
          <p><strong>TuttoEvento</strong> — info@tuttoevento.it — www.tuttoevento.it</p>
          <p>Documento generato e aggiornato in conformità al GDPR Reg. UE 2016/679 e al D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018.</p>
          <p style={{ marginTop:"1rem" }}>
            <Link href="/cookie-policy" style={{ color:"#ff5a00", fontWeight:600, marginRight:"1.5rem" }}>Cookie Policy</Link>
            <Link href="/" style={{ color:"#6b6b73", fontWeight:600 }}>Home</Link>
          </p>
        </div>
      </div>
    </main>
  );
}