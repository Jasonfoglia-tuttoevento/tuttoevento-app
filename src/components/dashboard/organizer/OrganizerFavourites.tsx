"use client";

import { useState, useEffect } from "react";
import { INK, MUTED, O, SCard, STitle } from "./shared";

const STORAGE_KEY = "te_organizer_favourites_v1";

// ── Tipi ────────────────────────────────────────────────────────
interface FavouriteArtist {
  id?: string;
  user_id?: string;
  stageName?: string;
  stage_name?: string;
  name?: string;
  city?: string;
  musicGenres?: string[] | string;
  photo?: string;
  photo_url?: string;
  [key: string]: unknown;
}

interface OrganizerUser {
  id: string;
  [key: string]: unknown;
}

interface OrganizerFavouritesProps {
  artists?: FavouriteArtist[];
  currentUser: OrganizerUser | null;
}

// ── Componente ──────────────────────────────────────────────────
export default function OrganizerFavourites({
  artists = [],
  currentUser,
}: OrganizerFavouritesProps) {
  const userId = currentUser?.id || "anon";
  const [favIds, setFavIds] = useState<string[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      if (saved) setFavIds(JSON.parse(saved));
    } catch {}
  }, [userId]);

  function toggle(id: string) {
    const next = favIds.includes(id) ? favIds.filter((f) => f !== id) : [...favIds, id];
    setFavIds(next);
    try {
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(next));
    } catch {}
  }

  const favArtists = artists.filter((a) => favIds.includes(a.id || a.user_id || ""));
  const filtered = filter
    ? favArtists.filter((a) =>
        (a.stageName || a.stage_name || a.name || "").toLowerCase().includes(filter.toLowerCase())
      )
    : favArtists;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <SCard>
        <STitle>Artisti preferiti</STitle>
        <p style={{ fontSize: 12, color: MUTED, margin: "0 0 16px" }}>
          Salva gli artisti che ti interessano per ritrovarli facilmente. Aggiungi dal marketplace cliccando ★.
        </p>
        {favArtists.length > 0 && (
          <input
            value={filter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
            placeholder="Cerca tra i preferiti..."
            style={{
              width: "100%",
              background: "#fbfaf8",
              border: "1px solid rgba(0,0,0,.1)",
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 13,
              fontFamily: "'Manrope',system-ui,sans-serif",
              outline: "none",
              marginBottom: 14,
              boxSizing: "border-box",
            }}
          />
        )}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <p style={{ fontSize: 28, margin: "0 0 8px" }}>★</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: INK, margin: "0 0 4px" }}>
              Nessun artista preferito
            </p>
            <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>
              Vai su &quot;Trova artisti&quot; e clicca ★ per salvarne uno qui.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((a) => {
              const id = a.id || a.user_id || "";
              const name = a.stageName || a.stage_name || a.name || "Artista";
              const city = a.city || "";
              const genres = Array.isArray(a.musicGenres)
                ? a.musicGenres.join(", ")
                : a.musicGenres || "";
              const photo = a.photo || a.photo_url || null;
              return (
                <div
                  key={id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    background: "#fbfaf8",
                    border: "1px solid rgba(0,0,0,.06)",
                    borderRadius: 16,
                    padding: "12px 14px",
                  }}
                >
                  {photo ? (
                    <img
                      src={photo}
                      alt={name}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: `${O}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontWeight: 800,
                        color: O,
                        fontSize: 18,
                        fontFamily: "'Sora',sans-serif",
                      }}
                    >
                      {name[0]}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontWeight: 800,
                        fontSize: 14,
                        margin: 0,
                        fontFamily: "'Sora',sans-serif",
                        color: INK,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {name}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: MUTED,
                        margin: "3px 0 0",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {[city, genres].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() =>
                        window.dispatchEvent(
                          new CustomEvent("tuttoevento:open-chat", {
                            detail: { participantUserId: id },
                          })
                        )
                      }
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "7px 14px",
                        borderRadius: 100,
                        border: "1px solid rgba(0,0,0,.1)",
                        background: "white",
                        color: INK,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Contatta
                    </button>
                    <button
                      type="button"
                      onClick={() => toggle(id)}
                      style={{
                        fontSize: 16,
                        padding: "7px 10px",
                        borderRadius: 100,
                        border: "1px solid rgba(220,38,38,.2)",
                        background: "rgba(220,38,38,.06)",
                        color: "#dc2626",
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SCard>
    </div>
  );
}