"use client";
import { useState, useEffect, useRef } from "react";
import { SCard, STitle, ProBadge, ProLock, O, INK, MUTED, MUTED2, BORDER, inp, DURATIONS } from "./shared";

export default function ArtistRichieste({ bookings=[], onRefreshBookings }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);

  const STATUS_LABEL = { pending:"In attesa", contacted:"Contattato", connected:"Connesso", rejected:"Rifiutato" };
  const STATUS_COLOR = { pending:"#d97706", contacted:"#2563eb", connected:"#16a34a", rejected:"#dc2626" };

  useEffect(() => {
    fetch("/api/contact-requests")
      .then(r => r.json())
      .then(d => setRequests(Array.isArray(d) ? d : []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  // Booking che richiedono conferma presenza (status attivo, conferma non ancora data)
  const toConfirm = (Array.isArray(bookings) ? bookings : []).filter(b =>
    ["pending","accepted","confirmed"].includes(b.status) &&
    (b.artistConfirmation === "pending" || !b.artistConfirmation)
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* Booking da confermare — priorità */}
      {toConfirm.length > 0 && (
        <SCard>
          <STitle sub="Booking creati dal team — confirma la tua presenza">
            Da confermare
          </STitle>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {toConfirm.map(b => (
              <BookingConfirmCard key={b.id} booking={b} onRefresh={onRefreshBookings} />
            ))}
          </div>
        </SCard>
      )}

      <SCard>
        <STitle sub="Richieste di contatto ricevute dai locali tramite il marketplace">
          Richieste
        </STitle>
        {loading ? (
          <p style={{ fontSize:13, color:MUTED }}>Caricamento...</p>
        ) : requests.length === 0 ? (
          <p style={{ fontSize:13, color:MUTED }}>Nessuna richiesta ricevuta ancora. Quando un locale ti contatta dal marketplace, la richiesta apparirà qui.</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {requests.map(r => (
              <div key={r.id} style={{ background:"#fbfaf8", borderRadius:16, padding:"14px 16px", border:"1px solid rgba(0,0,0,.06)" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:6 }}>
                  <p style={{ fontWeight:800, fontSize:14, margin:0, fontFamily:"'Sora',sans-serif" }}>{r.organizer_name || "Locale"}</p>
                  <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:100, flexShrink:0,
                    background:(STATUS_COLOR[r.status]||"#6b7280")+"18",
                    color:STATUS_COLOR[r.status]||"#6b7280" }}>
                    {STATUS_LABEL[r.status] || r.status || "—"}
                  </span>
                </div>
                <p style={{ fontSize:12, color:MUTED, margin:0, lineHeight:1.6 }}>
                  {r.event_date || "—"}{r.event_type ? ` · ${r.event_type}` : ""}{r.duration ? ` · ${r.duration}` : ""}
                </p>
                {r.notes && <p style={{ fontSize:12, color:INK, margin:"8px 0 0", lineHeight:1.6 }}>{r.notes}</p>}
                <p style={{ fontSize:11, color:MUTED, margin:"8px 0 0", fontStyle:"italic" }}>
                  {r.status === "connected"
                    ? "Booking creato — controlla la sezione \"Da confermare\" qui sopra."
                    : "Il team TuttoEvento gestirà la trattativa e ti aggiornerà via chat."}
                </p>
              </div>
            ))}
          </div>
        )}
      </SCard>
    </div>
  );
}

const TABS = [
  { key:"mediakit",   label:"Profilo"    },
  { key:"video",      label:"Video"      },
  { key:"cachet",     label:"Cachet"     },
  { key:"richieste",  label:"Richieste"  },
  { key:"calendario", label:"Calendario" },
  { key:"analitiche", label:"Analitiche" },
  { key:"estratto",   label:"Guadagni"   },
];

/* ─────────────────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────────────────── */
export default function ArtistArea(props) {
  const tabMapA = { profile:"mediakit", calendar:"calendario", analytics:"analitiche", earnings:"estratto" };
  const initialTab = tabMapA[props.tab] || props.tab || "mediakit";
  const plan = props.currentUser?.plan || "free";

  const [tab, setTab] = useState(initialTab);
  const [onboardStep, setOnboardStep] = useState(null);  // null = non attivo
  const [highlightCard, setHighlightCard] = useState(null);

  // Sincronizza il tab con la prop esterna (quando si clicca nella sidebar)
  useEffect(() => {
    const mapped = tabMapA[props.tab] || props.tab || "mediakit";
    setTab(mapped);
  }, [props.tab]);

  // Controlla se primo accesso (nessun profilo salvato)
  useEffect(() => {
    const key = `te_onboard_artist_${props.currentUser?.id}`;
    if (!localStorage.getItem(key)) {
      setOnboardStep(0);
    }
  }, [props.currentUser?.id]);

  function nextStep() {
    const next = onboardStep + 1;
    if (next >= ONBOARDING_STEPS_ARTIST.length) {
      // Fine onboarding
      const key = `te_onboard_artist_${props.currentUser?.id}`;
      localStorage.setItem(key, "done");
      setOnboardStep(null);
      setHighlightCard(null);
    } else {
      setOnboardStep(next);
      const s = ONBOARDING_STEPS_ARTIST[next];
      if (s.highlight) setHighlightCard(s.highlight);
    }
  }

  function skipOnboarding() {
    const key = `te_onboard_artist_${props.currentUser?.id}`;
    localStorage.setItem(key, "done");
    setOnboardStep(null);
    setHighlightCard(null);
  }

  function handleTabChange(newTab) {
    setTab(newTab);
  }

  const p = props;
  const setPricing = props.setPricing || (() => {});

  return (
    <div id="artist-area" style={{ fontFamily:"'Manrope',system-ui,sans-serif", color:INK, display:"flex", flexDirection:"column", gap:16, paddingBottom: onboardStep!==null ? 120 : 0 }}>
      <style>{GLOBAL_CSS}</style>

      {/* navigazione gestita dal DashboardShell */}

      {/* Contenuto tab */}
      {tab==="video"      && <VideoShowcase plan={plan} />}
      {tab==="mediakit"   && <TabProfilo    plan={plan} highlightCard={highlightCard} stageName={p.stageName} setStageName={p.setStageName} artistType={p.artistType} setArtistType={p.setArtistType} bio={p.bio} setBio={p.setBio} city={p.city} setCity={p.setCity} musicGenres={p.musicGenres} setMusicGenres={p.setMusicGenres} eventTypes={p.eventTypes} setEventTypes={p.setEventTypes} photo={p.photo} setPhoto={p.setPhoto} instagram={p.instagram} setInstagram={p.setInstagram} spotify={p.spotify} setSpotify={p.setSpotify} youtube={p.youtube} setYoutube={p.setYoutube} soundcloud={p.soundcloud} setSoundcloud={p.setSoundcloud} tiktok={p.tiktok} setTiktok={p.setTiktok} rider={p.rider} setRider={p.setRider} saveArtistProfile={p.saveArtistProfile} artistMessage={p.artistMessage} />}
      {tab==="cachet"     && <TabCachet     pricing={p.pricing} setPricing={setPricing} eventTypes={p.eventTypes} saveArtistProfile={p.saveArtistProfile} artistMessage={p.artistMessage} />}
      {tab==="richieste"  && <TabRichieste bookings={p.bookings||[]} onRefreshBookings={props.onRefreshBookings} />}
      {tab==="scalette"   && <TabScalette  bookings={p.bookings||[]} />}
      {tab==="calendario" && <TabCalendario availableDates={p.availableDates||[]} setAvailableDates={p.setAvailableDates} bookedSlots={p.bookedSlots||[]} plan={plan} />}
      {tab==="analitiche" && <AnalyticsWidget role="artist" userId={props.currentUser?.id} />}
      {tab==="estratto"   && <TabGuadagni   bookings={p.bookings||[]} />}

      {/* Onboarding toast — solo se attivo */}
      {onboardStep !== null && (
        <OnboardingToast
          step={onboardStep}
          totalSteps={ONBOARDING_STEPS_ARTIST.length}
          onNext={nextStep}
          onSkip={skipOnboarding}
          onTabChange={handleTabChange}
        />
      )}
    </div>
  );
}