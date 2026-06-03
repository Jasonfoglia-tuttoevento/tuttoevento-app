"use client";
import { useState } from "react";

const FAQS = [
  { q: "TuttoEvento è gratuito?", a: "Sì, la registrazione e l'utilizzo della piattaforma sono completamente gratuiti per artisti, locali e promoter. TuttoEvento guadagna applicando un markup riservato sul prezzo dell'artista, che non è mai visibile all'utente." },
  { q: "Come funziona il marketplace per i locali?", a: "I locali possono sfogliare il roster di artisti verificati, filtrare per genere musicale, città e fascia di budget, e inviare una richiesta di contatto riservata con data, tipo evento e budget. Il team TuttoEvento gestisce la trattativa." },
  { q: "Gli artisti vedono il prezzo pubblicato?", a: "No. Gli artisti inseriscono il loro cachet netto nel profilo, visibile solo all'admin. Il prezzo pubblico viene impostato dal team TuttoEvento e non è mai mostrato all'artista. I locali vedono solo 'Su richiesta'." },
  { q: "Come vengono verificati gli artisti?", a: "Ogni artista che si registra viene revisionato manualmente dal team TuttoEvento prima di apparire nel marketplace. Verifichiamo l'identità, la qualità del profilo e la coerenza delle informazioni." },
  { q: "Come funzionano le notifiche push?", a: "TuttoEvento è una Progressive Web App (PWA). Puoi installarla sul tuo telefono e ricevere notifiche push native per ogni nuovo messaggio, booking o richiesta, esattamente come WhatsApp." },
  { q: "Posso usare TuttoEvento da mobile?", a: "Assolutamente sì. TuttoEvento è ottimizzato mobile-first. Puoi anche installarlo sulla schermata home del tuo telefono come una vera app (iOS e Android) senza passare dall'App Store." },
  { q: "Cosa succede dopo che invio una richiesta di contatto?", a: "Il team TuttoEvento riceve una notifica immediata, prende in carico la richiesta e ti contatta entro 48 ore con tutti i dettagli dell'artista, compreso il prezzo. Gestiamo noi la trattativa." },
  { q: "Come divento promoter su TuttoEvento?", a: "Registrati selezionando 'Promoter' come tipologia di account. Potrai costruire il tuo portfolio di artisti e locali, monitorare le trattative che ti coinvolgono e ricevere le tue commissioni." },
  { q: "I miei dati sono al sicuro?", a: "Sì. Utilizziamo Supabase Auth con cifratura bcrypt per le password, cookie HttpOnly per le sessioni, e HTTPS su tutta la piattaforma. Nessun dato viene venduto a terzi. Leggi la nostra Privacy Policy per tutti i dettagli." },
  { q: "Posso cancellare il mio account?", a: "Sì, in qualsiasi momento. Scrivi a info@tuttoevento.it e procederemo alla cancellazione di tutti i tuoi dati entro 30 giorni, come previsto dal GDPR." },
];

export default function HomeFAQ() {
  const [open, setOpen] = useState(null);
  return (
    <>
      <style>{`
        .hfq-root { background:#080808; padding:100px 20px; }
        .hfq-inner { max-width:800px; margin:0 auto; }
        .hfq-label { text-align:center; font-size:.75rem; font-weight:700; color:#ff5a00; text-transform:uppercase; letter-spacing:.2em; margin-bottom:12px; }
        .hfq-title { text-align:center; font-family:'Sora',sans-serif; font-size:clamp(2rem,5vw,3rem); font-weight:900; color:#fff; letter-spacing:-.04em; margin-bottom:48px; }
        .hfq-item { border-bottom:1px solid rgba(255,255,255,.07); }
        .hfq-q { width:100%; display:flex; justify-content:space-between; align-items:center; padding:20px 0; background:none; border:none; color:#fff; font-size:1rem; font-weight:700; cursor:pointer; text-align:left; gap:16px; font-family:'Manrope',sans-serif; }
        .hfq-icon { width:28px; height:28px; border-radius:50%; border:1px solid rgba(255,255,255,.15); display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,.5); font-size:1.1rem; flex-shrink:0; transition:all .2s; }
        .hfq-item.open .hfq-icon { background:#ff5a00; border-color:#ff5a00; color:#fff; transform:rotate(45deg); }
        .hfq-a { max-height:0; overflow:hidden; transition:max-height .35s ease, padding .35s ease; }
        .hfq-item.open .hfq-a { max-height:300px; padding-bottom:20px; }
        .hfq-a p { color:rgba(255,255,255,.55); font-size:.9rem; line-height:1.7; }
        .hfq-contact { text-align:center; margin-top:64px; }
        .hfq-contact p { color:rgba(255,255,255,.5); font-size:.95rem; margin-bottom:12px; }
        .hfq-contact a { color:#ff5a00; font-weight:700; text-decoration:none; }
        .hfq-contact a:hover { text-decoration:underline; }
      `}</style>
      <section className="hfq-root" id="faq">
        <div className="hfq-inner">
          <p className="hfq-label">FAQ</p>
          <h2 className="hfq-title">Domande frequenti.</h2>
          {FAQS.map((f, i) => (
            <div key={i} className={`hfq-item${open === i ? " open" : ""}`}>
              <button className="hfq-q" onClick={() => setOpen(open === i ? null : i)}>
                {f.q}
                <span className="hfq-icon">+</span>
              </button>
              <div className="hfq-a"><p>{f.a}</p></div>
            </div>
          ))}
          <div className="hfq-contact">
            <p>Non hai trovato risposta?</p>
            <a href="mailto:info@tuttoevento.it">Scrivici a info@tuttoevento.it →</a>
          </div>
        </div>
      </section>
    </>
  );
}