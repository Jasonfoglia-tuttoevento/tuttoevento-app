// src/lib/contract-template.js
// Genera il testo del contratto digitale (snapshot salvato alla creazione booking).

export const TERMS_VERSION = "v1";

export function generateContractText({ artistName, organizerName, eventDate, eventType, venue, publicPrice, artistCachet, startTime, endTime }) {
  const dataEvento = eventDate
    ? new Date(eventDate).toLocaleDateString("it-IT", { day:"2-digit", month:"long", year:"numeric" })
    : "—";
  const orario = startTime && endTime ? `${startTime}–${endTime}` : "da concordare";

  return `CONTRATTO DI PRESTAZIONE ARTISTICA — TuttoEvento

Tra ${organizerName || "il Locale"} ("Committente") e ${artistName || "l'Artista"} ("Artista"),
tramite la piattaforma TuttoEvento ("Piattaforma").

1. OGGETTO
L'Artista si impegna a eseguire una prestazione artistica (${eventType || "evento"}) presso ${venue || "la sede del Committente"} in data ${dataEvento}, orario ${orario}.

2. COMPENSO
Il Committente corrisponde alla Piattaforma il compenso concordato di € ${publicPrice || 0} per la prestazione. La Piattaforma corrisponde all'Artista il cachet concordato${artistCachet ? ` di € ${artistCachet}` : ""}. La differenza costituisce il margine di intermediazione gestito dalla Piattaforma, secondo gli accordi tra le parti.

3. PAGAMENTI
I pagamenti sono tracciati tramite la Piattaforma. Il Committente versa l'importo dovuto; la Piattaforma provvede alla ripartizione verso Artista e promoter secondo gli accordi.

4. OBBLIGHI
L'Artista garantisce la propria presenza puntuale e la prestazione concordata. Il Committente garantisce le condizioni tecniche e logistiche necessarie. Eventuali cancellazioni seguono la policy della Piattaforma.

5. NON ELUSIONE
Le parti si impegnano a non aggirare la Piattaforma per eventi nati dal contatto qui generato, per la durata di 12 mesi.

6. ACCETTAZIONE
L'accettazione avviene in forma elettronica (click-wrap), con registrazione di data, ora e indirizzo IP di ciascuna parte, ai sensi degli artt. 1341-1342 c.c.

Versione termini: ${TERMS_VERSION}`;
}