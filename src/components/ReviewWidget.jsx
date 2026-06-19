"use client";
import { useState, useEffect } from "react";

const O = "#ff5a00", INK = "#0a0a0b", MUTED = "#6b6b73";

function Stars({ value, size = 16, onSelect }) {
  return (
    <div style={{ display: "inline-flex", gap: 2 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" disabled={!onSelect}
          onClick={() => onSelect?.(n)}
          style={{ background:"none", border:"none", padding:0,
            cursor: onSelect ? "pointer" : "default", lineHeight:1 }}>
          <svg width={size} height={size} viewBox="0 0 24 24"
            fill={n <= value ? O : "none"} stroke={n <= value ? O : "rgba(0,0,0,.2)"} strokeWidth="1.6">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      ))}
    </div>
  );
}

/* Riepilogo rating (per header pagina pubblica) */
export function RatingSummary({ avg = 0, count = 0, size = 18 }) {
  if (!count) return <span style={{ fontSize: 13, color: MUTED }}>Nessuna recensione</span>;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <Stars value={Math.round(avg)} size={size} />
      <span style={{ fontSize: 14, fontWeight: 800, color: INK, fontFamily: "'Sora',sans-serif" }}>{Number(avg).toFixed(1)}</span>
      <span style={{ fontSize: 13, color: MUTED }}>({count})</span>
    </div>
  );
}

/* Lista recensioni di un target (artista o locale) */
export function ReviewList({ targetId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!targetId) return;
    fetch(`/api/reviews?targetId=${targetId}`)
      .then(r => r.json())
      .then(d => setReviews(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [targetId]);

  if (loading) return <p style={{ fontSize: 13, color: MUTED }}>Caricamento recensioni…</p>;
  if (!reviews.length) return <p style={{ fontSize: 13, color: MUTED }}>Ancora nessuna recensione.</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {reviews.map(r => (
        <div key={r.id} style={{ background:"#fbfaf8", border:"1px solid rgba(0,0,0,.06)", borderRadius:14, padding:"12px 14px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom:6 }}>
            <span style={{ fontWeight:700, fontSize:13, color:INK, fontFamily:"'Sora',sans-serif" }}>{r.reviewerName}</span>
            <Stars value={r.rating} size={13} />
          </div>
          {r.comment && <p style={{ fontSize:13, color:"#333", margin:0, lineHeight:1.5 }}>{r.comment}</p>}
          <p style={{ fontSize:11, color:MUTED, margin:"6px 0 0" }}>
            {new Date(r.created_at).toLocaleDateString("it-IT",{day:"2-digit",month:"long",year:"numeric"})}
          </p>
        </div>
      ))}
    </div>
  );
}

/* Form per lasciare una recensione su un booking concluso */
export function ReviewForm({ bookingId, targetName, onDone }) {
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState("");
  const [done, setDone]       = useState(false);

  async function submit() {
    if (rating < 1) { setError("Seleziona una valutazione"); return; }
    setSending(true); setError("");
    try {
      const res = await fetch("/api/reviews", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ bookingId, rating, comment }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error || "Errore"); setSending(false); return; }
      setDone(true); onDone?.(d);
    } catch { setError("Errore di rete"); }
    setSending(false);
  }

  if (done) return (
    <div style={{ background:"rgba(22,163,74,.08)", border:"1px solid rgba(22,163,74,.25)", borderRadius:14, padding:"14px 16px" }}>
      <p style={{ fontSize:13, fontWeight:700, color:"#16a34a", margin:0 }}>✓ Recensione inviata, grazie!</p>
    </div>
  );

  return (
    <div style={{ background:"white", border:"1px solid rgba(0,0,0,.08)", borderRadius:16, padding:"16px 18px" }}>
      <p style={{ fontWeight:800, fontSize:14, color:INK, margin:"0 0 4px", fontFamily:"'Sora',sans-serif" }}>
        Com'è andata con {targetName || "il partner"}?
      </p>
      <p style={{ fontSize:12, color:MUTED, margin:"0 0 12px" }}>La tua recensione aiuta gli altri a fidarsi.</p>
      <div style={{ marginBottom:12 }}><Stars value={rating} size={28} onSelect={setRating} /></div>
      <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={3}
        placeholder="Racconta la tua esperienza (facoltativo)…"
        style={{ width:"100%", boxSizing:"border-box", background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)",
          borderRadius:12, padding:"10px 12px", fontSize:13, fontFamily:"'Manrope',system-ui,sans-serif",
          outline:"none", resize:"vertical", marginBottom:10 }} />
      {error && <p style={{ fontSize:12, color:"#dc2626", fontWeight:600, margin:"0 0 10px" }}>{error}</p>}
      <button onClick={submit} disabled={sending}
        style={{ background:O, color:"white", border:"none", borderRadius:100, padding:"9px 22px",
          fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif",
          opacity:sending?.6:1 }}>
        {sending ? "Invio…" : "Pubblica recensione"}
      </button>
    </div>
  );
}

export { Stars };