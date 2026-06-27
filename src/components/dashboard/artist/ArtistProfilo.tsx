"use client";
import React from "react";
import { SCard, STitle, ProBadge, ProLock, Inp, SelectField, PhotoUploader, GenreMultiSelect, EventTypeMultiSelect, O, MUTED, inp, ARTIST_TYPES } from "./shared";

interface ArtistProfiloProps {
  plan?: string;
  stageName?: string;
  setStageName: (v: string) => void;
  artistType?: string;
  setArtistType: (v: string) => void;
  bio?: string;
  setBio: (v: string) => void;
  city?: string;
  setCity: (v: string) => void;
  musicGenres?: string[];
  setMusicGenres: React.Dispatch<React.SetStateAction<string[]>>;
  eventTypes?: string[];
  setEventTypes: React.Dispatch<React.SetStateAction<string[]>>;
  photo?: string;
  setPhoto: (v: string) => void;
  instagram?: string;
  setInstagram: (v: string) => void;
  spotify?: string;
  setSpotify: (v: string) => void;
  youtube?: string;
  setYoutube: (v: string) => void;
  soundcloud?: string;
  setSoundcloud: (v: string) => void;
  tiktok?: string;
  setTiktok: (v: string) => void;
  rider?: string;
  setRider: (v: string) => void;
  saveArtistProfile: (e: React.FormEvent) => void;
  artistMessage?: string;
  highlightCard?: string;
}

export default function ArtistProfilo({
  plan, stageName, setStageName, artistType, setArtistType,
  bio, setBio, city, setCity,
  musicGenres, setMusicGenres, eventTypes, setEventTypes,
  photo, setPhoto, instagram, setInstagram, spotify, setSpotify,
  youtube, setYoutube, soundcloud, setSoundcloud, tiktok, setTiktok,
  rider, setRider, saveArtistProfile, artistMessage, highlightCard,
}: ArtistProfiloProps) {
  const isPro = plan === "pro";
  const safeGenres = Array.isArray(musicGenres) ? musicGenres : [];
  const safeEvents = Array.isArray(eventTypes)  ? eventTypes  : [];

  function toggleGenre(g: string) {
    if (!isPro && safeGenres.length >= 3 && !safeGenres.includes(g)) return;
    setMusicGenres(prev => {
      const s = Array.isArray(prev) ? prev : [];
      return s.includes(g) ? s.filter(x => x !== g) : [...s, g];
    });
  }
  function toggleEvent(e: string) {
    setEventTypes(prev => {
      const s = Array.isArray(prev) ? prev : [];
      return s.includes(e) ? s.filter(x => x !== e) : [...s, e];
    });
  }

  return (
    <form onSubmit={saveArtistProfile} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Identità */}
      <SCard highlight={highlightCard === "identity"}>
        <STitle sub="Nome d'arte, tipo e città — le info base per essere trovato">Identità artistica</STitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
          <Inp label="Nome d'arte *" value={stageName} onChange={e => setStageName(e.target.value)} placeholder="Es. Marco DJ" />
          <SelectField label="Tipo artista" value={artistType} onChange={e => setArtistType(e.target.value)} options={ARTIST_TYPES} placeholder="Seleziona..." />
          <Inp label="Città" value={city} onChange={e => setCity(e.target.value)} placeholder="Es. Milano" />
        </div>
      </SCard>

      {/* Foto profilo — upload diretto */}
      <SCard>
        <STitle sub="Scatta, scegli dalla galleria o carica un PDF">Foto profilo</STitle>
        <PhotoUploader photo={photo} onPhotoChange={setPhoto} />
      </SCard>

      {/* Bio */}
      <SCard>
        <STitle sub={isPro ? "Racconta la tua storia senza limiti" : "Max 150 caratteri · illimitata con PRO"}>
          Bio {!isPro && <ProBadge />}
        </STitle>
        <textarea value={bio || ""} onChange={e => setBio(e.target.value)} maxLength={isPro ? undefined : 150} rows={4}
          placeholder="Descrivi il tuo stile, la tua esperienza e cosa ti rende unico..."
          style={{ ...inp, resize: "vertical", lineHeight: 1.65 }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          {!isPro && <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>{(bio || "").length}/150</p>}
          {!isPro && <a href="/pricing" style={{ fontSize: 11, color: O, fontWeight: 700, textDecoration: "none" }}>Bio illimitata con Pro →</a>}
        </div>
      </SCard>

      {/* Generi — dropdown multiselect */}
      <SCard>
        <STitle sub={isPro ? "Tutti i generi che suoni" : "Max 3 con Free — illimitati con PRO"}>
          Generi musicali {!isPro && <ProBadge />}
        </STitle>
        <GenreMultiSelect selected={safeGenres} onToggle={toggleGenre} isPro={isPro} />
        {!isPro && safeGenres.length >= 3 && <ProLock feature="Più di 3 generi" plan={plan} />}
      </SCard>

      {/* Tipi evento — dropdown multiselect */}
      <SCard>
        <STitle sub="In quali contesti suoni — i locali ti trovano per tipo di evento">Tipi di evento</STitle>
        <EventTypeMultiSelect selected={safeEvents} onToggle={toggleEvent} />
      </SCard>

      {/* Social */}
      <SCard>
        <STitle sub={isPro ? "Tutti i link attivi contemporaneamente" : "Max 1 social attivo con Free"}>
          Link social {!isPro && <ProBadge />}
        </STitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Inp label="Instagram"  value={instagram}  onChange={e => setInstagram(e.target.value)}  placeholder="@username" />
          <Inp label="Spotify"    value={spotify}    onChange={e => setSpotify(e.target.value)}    placeholder="URL profilo"  disabled={!isPro && !instagram} />
          <Inp label="YouTube"    value={youtube}    onChange={e => setYoutube(e.target.value)}    placeholder="URL canale"   disabled={!isPro && (!instagram || !spotify)} />
          <Inp label="SoundCloud" value={soundcloud} onChange={e => setSoundcloud(e.target.value)} placeholder="URL profilo"  disabled={!isPro && (!instagram || !spotify || !youtube)} />
          <Inp label="TikTok"     value={tiktok}     onChange={e => setTiktok(e.target.value)}     placeholder="@username"   disabled={!isPro} />
        </div>
        {!isPro && <ProLock feature="Tutti i social attivi insieme" plan={plan} />}
      </SCard>

      {/* Rider */}
      {isPro ? (
        <SCard>
          <STitle sub="Specifiche tecniche condivise automaticamente con i locali">Rider tecnico</STitle>
          <textarea value={rider || ""} onChange={e => setRider(e.target.value)} rows={3}
            placeholder="Es. 2 casse frontali, mixer 4 canali, monitor..."
            style={{ ...inp, resize: "vertical" }} />
        </SCard>
      ) : (
        <SCard style={{ opacity: .65 }}>
          <STitle>Rider tecnico <ProBadge /></STitle>
          <ProLock feature="Il rider tecnico" plan={plan} />
        </SCard>
      )}

      {/* Salva */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, paddingTop: 4, flexWrap: "wrap" }}>
        <button type="submit"
          style={{ background: O, color: "white", border: "none", borderRadius: 100, padding: "12px 28px", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "'Manrope',system-ui,sans-serif", boxShadow: `0 8px 24px ${O}35`, transition: "all .2s" }}>
          Salva profilo
        </button>
        {artistMessage && (
          <p style={{ fontSize: 13, fontWeight: 700, color: artistMessage.includes("Errore") ? "#dc2626" : "#16a34a", margin: 0 }}>
            {artistMessage}
          </p>
        )}
      </div>
    </form>
  );
}
