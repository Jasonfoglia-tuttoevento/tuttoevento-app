"use client";
import { useState, useEffect, useRef } from "react";
import { SCard, STitle, O, INK, MUTED, inp } from "./shared";

const STORAGE_KEY = "te_scalette_v2";

/* ── Upload MP3 su Supabase Storage ── */
async function uploadTrackFile(file, userId, showId, trackId) {
  const ext  = file.name.split(".").pop().toLowerCase();
  const path = `scalette/${userId}/${showId}/${trackId}.${ext}`;
  const res  = await fetch("/api/upload-track", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ path, contentType: file.type }),
  });
  if (!res.ok) throw new Error("Errore generazione upload URL");
  const { uploadUrl, publicUrl } = await res.json();
  await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
  return publicUrl;
}

/* ── Mini player audio ── */
function AudioPlayer({ url }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  function toggle() {
    if (!ref.current) return;
    if (playing) { ref.current.pause(); setPlaying(false); }
    else         { ref.current.play();  setPlaying(true);  }
  }

  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:6 }}>
      <audio ref={ref} src={url} onEnded={()=>setPlaying(false)}
        onTimeUpdate={()=>ref.current && setProgress(ref.current.currentTime/(ref.current.duration||1)*100)} />
      <button type="button" onClick={toggle}
        style={{ width:30, height:30, borderRadius:"50%", border:"none",
          background:O, color:"white", cursor:"pointer", fontSize:13, display:"flex",
          alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        {playing ? "⏸" : "▶"}
      </button>
      <div style={{ flex:1, height:4, background:"rgba(0,0,0,.08)", borderRadius:4, overflow:"hidden" }}>
        <div style={{ width:`${progress}%`, height:"100%", background:O, borderRadius:4, transition:"width .1s" }} />
      </div>
    </div>
  );
}

/* ── Card singola traccia ── */
function TrackCard({ track, idx, total, userId, showId, onUpdate, onRemove, onMove }) {
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const fileRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["audio/mpeg","audio/mp3","audio/wav","audio/flac","audio/aac","audio/ogg"];
    if (!allowed.includes(file.type)) { setUploadErr("Formato non supportato. Usa MP3, WAV, FLAC, AAC o OGG."); return; }
    if (file.size > 60*1024*1024) { setUploadErr("File troppo grande. Massimo 60MB."); return; }
    setUploading(true); setUploadErr("");
    try {
      const url = await uploadTrackFile(file, userId, showId, track.id);
      onUpdate({ audioUrl: url, fileName: file.name });
    } catch(err) {
      setUploadErr(err.message || "Errore upload");
    }
    setUploading(false);
  }

  return (
    <div style={{ background:"#fbfaf8", border:"1px solid rgba(0,0,0,.07)", borderRadius:14, padding:"12px 14px" }}>
      {/* Riga 1: numero + titolo + azioni */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
        <span style={{ fontSize:12, fontWeight:800, color:MUTED, minWidth:22, textAlign:"center" }}>{idx+1}</span>
        <input value={track.title} onChange={e=>onUpdate({title:e.target.value})}
          placeholder="Titolo brano"
          style={{ ...inp, flex:1, fontWeight:700, padding:"8px 12px" }} />
        <button type="button" onClick={()=>onMove(-1)} disabled={idx===0}
          style={{ background:"none", border:"none", cursor:idx===0?"default":"pointer", fontSize:14,
            color:idx===0?"rgba(0,0,0,.15)":MUTED, padding:"2px 5px" }}>▲</button>
        <button type="button" onClick={()=>onMove(1)} disabled={idx===total-1}
          style={{ background:"none", border:"none", cursor:idx===total-1?"default":"pointer", fontSize:14,
            color:idx===total-1?"rgba(0,0,0,.15)":MUTED, padding:"2px 5px" }}>▼</button>
        <button type="button" onClick={onRemove}
          style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(220,38,38,.5)", fontSize:18, padding:"2px 6px" }}>×</button>
      </div>

      {/* Riga 2: metadati */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:8 }}>
        <input value={track.artist} onChange={e=>onUpdate({artist:e.target.value})}
          placeholder="Artista / label"
          style={{ ...inp, flex:2, minWidth:110, padding:"7px 11px", fontSize:12 }} />
        <input value={track.bpm} onChange={e=>onUpdate({bpm:e.target.value})}
          placeholder="BPM"
          style={{ ...inp, flex:"0 0 64px", padding:"7px 11px", fontSize:12 }} />
        <input value={track.key} onChange={e=>onUpdate({key:e.target.value})}
          placeholder="Key"
          style={{ ...inp, flex:"0 0 64px", padding:"7px 11px", fontSize:12 }} />
        <input value={track.duration} onChange={e=>onUpdate({duration:e.target.value})}
          placeholder="Durata"
          style={{ ...inp, flex:"0 0 74px", padding:"7px 11px", fontSize:12 }} />
      </div>

      {/* Riga 3: note */}
      <input value={track.notes} onChange={e=>onUpdate({notes:e.target.value})}
        placeholder="Note (transizione, cue point, effetti...)"
        style={{ ...inp, fontSize:12, color:MUTED, padding:"7px 11px", marginBottom:8 }} />

      {/* Riga 4: upload audio */}
      {track.audioUrl ? (
        <div>
          <AudioPlayer url={track.audioUrl} />
          <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:6 }}>
            <p style={{ fontSize:11, color:MUTED, margin:0, fontStyle:"italic", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              🎵 {track.fileName || "Traccia caricata"}
            </p>
            <button type="button" onClick={()=>onUpdate({audioUrl:"",fileName:""})}
              style={{ fontSize:11, color:"rgba(220,38,38,.6)", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>
              Rimuovi
            </button>
          </div>
        </div>
      ) : (
        <div>
          <input ref={fileRef} type="file" accept=".mp3,.wav,.flac,.aac,.ogg,audio/*"
            style={{ display:"none" }} onChange={handleFile} />
          <button type="button" disabled={uploading} onClick={()=>fileRef.current?.click()}
            style={{ fontSize:12, fontWeight:600, padding:"7px 14px", borderRadius:10,
              border:"1px dashed rgba(0,0,0,.2)", background:"transparent", color:MUTED,
              cursor:uploading?"not-allowed":"pointer", fontFamily:"inherit", display:"flex",
              alignItems:"center", gap:6, opacity:uploading?.6:1 }}>
            {uploading ? "⏳ Caricamento..." : "🎵 Carica MP3 / WAV / FLAC"}
          </button>
          {uploadErr && <p style={{ fontSize:11, color:"#dc2626", margin:"5px 0 0" }}>{uploadErr}</p>}
        </div>
      )}
    </div>
  );
}

/* ── Componente principale ── */
export default function ArtistScalette({ bookings=[], currentUser }) {
  const [shows, setShows]       = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const userId = currentUser?.id || "anon";

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      if (saved) setShows(JSON.parse(saved));
    } catch {}
  }, [userId]);

  function persist(updated) {
    setShows(updated);
    try { localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(updated)); } catch {}
  }

  function createShow() {
    if (!newTitle.trim()) return;
    const show = { id: Date.now(), title: newTitle.trim(), bookingId: null,
      bpm: "", duration: "", notes: "", tracks: [] };
    persist([...shows, show]);
    setNewTitle(""); setCreating(false); setActiveId(show.id);
  }

  function deleteShow(id) {
    persist(shows.filter(s => s.id !== id));
    if (activeId === id) setActiveId(null);
  }

  function patchShow(id, patch) { persist(shows.map(s => s.id===id ? {...s,...patch} : s)); }

  function addTrack(showId) {
    const show = shows.find(s => s.id===showId);
    if (!show) return;
    const t = { id: Date.now(), title:"", artist:"", bpm:"", key:"", duration:"", notes:"", audioUrl:"", fileName:"" };
    patchShow(showId, { tracks: [...(show.tracks||[]), t] });
  }

  function patchTrack(showId, trackId, patch) {
    const show = shows.find(s => s.id===showId);
    if (!show) return;
    patchShow(showId, { tracks: show.tracks.map(t => t.id===trackId ? {...t,...patch} : t) });
  }

  function removeTrack(showId, trackId) {
    const show = shows.find(s => s.id===showId);
    if (!show) return;
    patchShow(showId, { tracks: show.tracks.filter(t => t.id!==trackId) });
  }

  function moveTrack(showId, idx, dir) {
    const show = shows.find(s => s.id===showId);
    if (!show) return;
    const tracks = [...show.tracks];
    const t = idx+dir;
    if (t<0||t>=tracks.length) return;
    [tracks[idx],tracks[t]] = [tracks[t],tracks[idx]];
    patchShow(showId, { tracks });
  }

  const current = shows.find(s => s.id===activeId);
  const upcoming = (Array.isArray(bookings)?bookings:[]).filter(b =>
    ["accepted","confirmed","pending"].includes(b.status) &&
    b.eventDate >= new Date().toISOString().slice(0,10)
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* Lista show */}
      <SCard>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <STitle sub="Organizza il tuo show traccia per traccia">Scalette</STitle>
          <button type="button" onClick={()=>setCreating(true)}
            style={{ background:O, color:"white", border:"none", borderRadius:100,
              padding:"9px 18px", fontWeight:700, fontSize:13, cursor:"pointer",
              fontFamily:"inherit", boxShadow:`0 4px 12px ${O}30`, whiteSpace:"nowrap" }}>
            + Nuovo show
          </button>
        </div>

        {creating && (
          <div style={{ background:"rgba(255,90,0,.04)", border:"1px solid rgba(255,90,0,.15)",
            borderRadius:14, padding:"14px 16px", marginBottom:14 }}>
            <p style={{ fontSize:13, fontWeight:700, color:INK, margin:"0 0 10px" }}>Nome del show</p>
            <div style={{ display:"flex", gap:8 }}>
              <input value={newTitle} onChange={e=>setNewTitle(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&createShow()}
                placeholder="Es. Set estivo 2026, Opening act..."
                style={{ ...inp, flex:1 }} autoFocus />
              <button type="button" onClick={createShow}
                style={{ background:O, color:"white", border:"none", borderRadius:10,
                  padding:"10px 18px", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                Crea
              </button>
              <button type="button" onClick={()=>{setCreating(false);setNewTitle("");}}
                style={{ background:"transparent", color:MUTED, border:"1px solid rgba(0,0,0,.1)",
                  borderRadius:10, padding:"10px 14px", fontWeight:700, fontSize:13,
                  cursor:"pointer", fontFamily:"inherit" }}>✕</button>
            </div>
          </div>
        )}

        {shows.length===0 && !creating ? (
          <div style={{ textAlign:"center", padding:"32px 0" }}>
            <p style={{ fontSize:32, margin:"0 0 8px" }}>🎧</p>
            <p style={{ fontSize:14, fontWeight:700, color:INK, margin:"0 0 4px" }}>Nessuna scaletta ancora</p>
            <p style={{ fontSize:12, color:MUTED, margin:0 }}>Crea il tuo primo show e organizza tracce, BPM e upload audio.</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {shows.map(s => (
              <div key={s.id} onClick={()=>setActiveId(activeId===s.id?null:s.id)}
                style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12,
                  background: activeId===s.id ? "rgba(255,90,0,.04)" : "white",
                  border: activeId===s.id ? `1px solid rgba(255,90,0,.2)` : "1px solid rgba(0,0,0,.07)",
                  borderRadius:14, padding:"12px 16px", cursor:"pointer", transition:"all .15s" }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:800, fontSize:14, margin:0, color:INK, fontFamily:"'Sora',sans-serif" }}>{s.title}</p>
                  <p style={{ fontSize:11, color:MUTED, margin:"3px 0 0" }}>
                    {s.tracks?.length||0} tracce
                    {s.tracks?.filter(t=>t.audioUrl).length>0 && ` · ${s.tracks.filter(t=>t.audioUrl).length} audio`}
                    {s.bpm ? ` · ${s.bpm} BPM` : ""}
                  </p>
                </div>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  <span style={{ fontSize:11, color:activeId===s.id?O:MUTED, fontWeight:700 }}>
                    {activeId===s.id?"▲":"▼"}
                  </span>
                  <button type="button" onClick={e=>{e.stopPropagation();deleteShow(s.id);}}
                    style={{ background:"transparent", border:"none", cursor:"pointer",
                      color:"rgba(220,38,38,.5)", fontSize:18, padding:"2px 6px", lineHeight:1 }}>×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SCard>

      {/* Editor show attivo */}
      {current && (
        <SCard>
          {/* Header show */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between",
            gap:12, marginBottom:16, flexWrap:"wrap" }}>
            <div>
              <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:16, margin:0, color:INK }}>
                {current.title}
              </p>
              <p style={{ fontSize:11, color:MUTED, margin:"3px 0 0" }}>
                {current.tracks?.length||0} tracce
              </p>
            </div>
            {upcoming.length>0 && (
              <select value={current.bookingId||""}
                onChange={e=>patchShow(current.id,{bookingId:e.target.value||null})}
                style={{ ...inp, fontSize:12, padding:"7px 12px", maxWidth:240, width:"auto" }}>
                <option value="">— Collega a una serata —</option>
                {upcoming.map(b=>(
                  <option key={b.id} value={b.id}>{b.eventDate} · {b.organizerName||"Locale"}</option>
                ))}
              </select>
            )}
          </div>

          {/* Info generali */}
          <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
            <div style={{ flex:1, minWidth:120 }}>
              <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase",
                letterSpacing:".08em", display:"block", marginBottom:5 }}>Durata totale</label>
              <input value={current.duration} onChange={e=>patchShow(current.id,{duration:e.target.value})}
                placeholder="Es. 1h 30min" style={{ ...inp }} />
            </div>
            <div style={{ flex:1, minWidth:120 }}>
              <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase",
                letterSpacing:".08em", display:"block", marginBottom:5 }}>BPM medio</label>
              <input value={current.bpm} onChange={e=>patchShow(current.id,{bpm:e.target.value})}
                placeholder="Es. 128" style={{ ...inp }} />
            </div>
          </div>

          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase",
              letterSpacing:".08em", display:"block", marginBottom:5 }}>Note generali</label>
            <textarea value={current.notes} onChange={e=>patchShow(current.id,{notes:e.target.value})} rows={2}
              placeholder="Setup tecnico, note per il fonico, intro, outro..."
              style={{ ...inp, resize:"vertical" }} />
          </div>

          {/* Tracce */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <p style={{ fontSize:12, fontWeight:700, color:INK, textTransform:"uppercase",
              letterSpacing:".08em", margin:0 }}>Tracce ({current.tracks?.length||0})</p>
            <button type="button" onClick={()=>addTrack(current.id)}
              style={{ background:INK, color:"white", border:"none", borderRadius:100,
                padding:"6px 16px", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
              + Traccia
            </button>
          </div>

          {(!current.tracks||current.tracks.length===0) ? (
            <p style={{ fontSize:12, color:MUTED, textAlign:"center", padding:"20px 0" }}>
              Nessuna traccia — clicca "+ Traccia" per iniziare.
            </p>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {current.tracks.map((track, idx) => (
                <TrackCard key={track.id}
                  track={track} idx={idx} total={current.tracks.length}
                  userId={userId} showId={current.id}
                  onUpdate={p=>patchTrack(current.id,track.id,p)}
                  onRemove={()=>removeTrack(current.id,track.id)}
                  onMove={dir=>moveTrack(current.id,idx,dir)} />
              ))}
            </div>
          )}

          {current.tracks?.length>0 && (
            <p style={{ fontSize:11, color:MUTED, margin:"12px 0 0", fontStyle:"italic", textAlign:"right" }}>
              Le scalette sono salvate sul tuo dispositivo. Gli audio sono su cloud.
            </p>
          )}
        </SCard>
      )}
    </div>
  );
}