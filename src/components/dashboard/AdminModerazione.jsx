"use client";
import { useState, useEffect } from "react";

const O    = "#ff5a00";
const INK  = "#0a0a0b";
const MUTED= "#6b6b73";

export default function AdminModerazione() {
  const [tab, setTab]             = useState("artists");
  const [artists, setArtists]     = useState([]);
  const [photos, setPhotos]       = useState([]);
  const [videos, setVideos]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [msg, setMsg]             = useState("");

  useEffect(() => { load(); }, [tab]);

  async function load() {
    setLoading(true);
    try {
      if (tab === "artists") {
        const r = await fetch("/api/artists?approved=false");
        const d = await r.json();
        setArtists(Array.isArray(d) ? d.filter(a=>a.approvalStatus==="pending") : []);
      }
      if (tab === "photos") {
        const r = await fetch("/api/admin/media?type=photo");
        const d = await r.json();
        setPhotos(Array.isArray(d)?d:[]);
      }
      if (tab === "videos") {
        const r = await fetch("/api/admin/media?type=video");
        const d = await r.json();
        setVideos(Array.isArray(d)?d:[]);
      }
    } catch {}
    setLoading(false);
  }

  async function approveArtist(artistId) {
    const res = await fetch("/api/admin/user-plan", {
      method: "PATCH",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ userId: artistId, approvalStatus: "approved" }),
    });
    if (res.ok) { setMsg("✓ Artista approvato"); load(); }
    else setMsg("Errore");
  }

  async function rejectArtist(artistId) {
    const res = await fetch("/api/admin/user-plan", {
      method: "PATCH",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ userId: artistId, approvalStatus: "rejected" }),
    });
    if (res.ok) { setMsg("Artista rifiutato"); load(); }
  }

  async function moderateMedia(type, id, action) {
    const res = await fetch("/api/admin/media", {
      method: "PATCH",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ type, id, action }),
    });
    if (res.ok) { setMsg(`✓ ${action === "approve" ? "Approvato":"Rifiutato"}`); load(); }
  }

  const TABS = [
    { key:"artists", label:"Artisti da approvare" },
    { key:"photos",  label:"Foto in attesa"       },
    { key:"videos",  label:"Video in attesa"       },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16, fontFamily:"'Manrope',system-ui,sans-serif" }}>
      <div>
        <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:20, color:INK, margin:"0 0 4px", letterSpacing:"-.03em" }}>Moderazione</h2>
        <p style={{ fontSize:13, color:MUTED, margin:0 }}>Approva artisti e contenuti prima che appaiano nel marketplace</p>
      </div>

      {/* Tab bar */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {TABS.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)}
            style={{ padding:"7px 16px", borderRadius:100, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif", border:tab===t.key?"none":"1px solid rgba(0,0,0,.1)", background:tab===t.key?INK:"white", color:tab===t.key?"white":MUTED, transition:"all .15s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {msg && <p style={{ fontSize:12, fontWeight:700, color:msg.startsWith("✓")?"#16a34a":"#dc2626", margin:0 }}>{msg}</p>}

      {loading ? <p style={{ color:MUTED, fontSize:13 }}>Caricamento...</p> : (

        /* ── Artisti ── */
        tab === "artists" ? (
          artists.length === 0 ? (
            <div style={{ background:"white", border:"1px solid rgba(0,0,0,.06)", borderRadius:20, padding:"32px", textAlign:"center" }}>
              <p style={{ color:MUTED, fontSize:13, margin:0 }}>Nessun artista in attesa di approvazione.</p>
            </div>
          ) : artists.map(a => (
            <div key={a.id} style={{ background:"white", border:"1px solid rgba(0,0,0,.07)", borderRadius:20, padding:"16px 20px", display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
              {a.photo ? (
                <img src={a.photo} alt={a.stageName} style={{ width:56, height:56, borderRadius:12, objectFit:"cover", border:"1px solid rgba(0,0,0,.08)", flexShrink:0 }} />
              ) : (
                <div style={{ width:56, height:56, borderRadius:12, background:`${O}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:900, color:O, flexShrink:0 }}>
                  {(a.stageName||a.name||"?")[0].toUpperCase()}
                </div>
              )}
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontWeight:700, fontSize:15, color:INK, margin:"0 0 2px" }}>{a.stageName||a.name}</p>
                <p style={{ fontSize:12, color:MUTED, margin:0 }}>
                  {a.artistType&&`${a.artistType} · `}{a.city&&`${a.city} · `}
                  {a.musicGenres?.slice?.(0,2).join(", ")}
                </p>
                {a.bio && <p style={{ fontSize:12, color:MUTED, margin:"4px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:400, fontStyle:"italic" }}>"{a.bio}"</p>}
              </div>
              <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                <button onClick={()=>approveArtist(a.id)}
                  style={{ background:"#16a34a", color:"white", border:"none", borderRadius:100, padding:"8px 18px", fontWeight:800, fontSize:13, cursor:"pointer" }}>
                  ✓ Approva
                </button>
                <button onClick={()=>rejectArtist(a.id)}
                  style={{ background:"transparent", border:"1px solid rgba(220,38,38,.3)", color:"#dc2626", borderRadius:100, padding:"8px 14px", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                  Rifiuta
                </button>
              </div>
            </div>
          ))
        ) :

        /* ── Foto ── */
        tab === "photos" ? (
          photos.length === 0 ? (
            <div style={{ background:"white", border:"1px solid rgba(0,0,0,.06)", borderRadius:20, padding:"32px", textAlign:"center" }}>
              <p style={{ color:MUTED, fontSize:13, margin:0 }}>Nessuna foto in attesa.</p>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
              {photos.map(p=>(
                <div key={p.id} style={{ background:"white", border:"1px solid rgba(0,0,0,.07)", borderRadius:16, overflow:"hidden" }}>
                  <img src={p.photo_pending||p.photo} alt={p.stage_name} style={{ width:"100%", aspectRatio:"1", objectFit:"cover" }} />
                  <div style={{ padding:"10px 12px" }}>
                    <p style={{ fontWeight:700, fontSize:13, color:INK, margin:"0 0 8px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.stage_name||"Artista"}</p>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={()=>moderateMedia("photo", p.id, "approve")}
                        style={{ flex:1, background:"#16a34a", color:"white", border:"none", borderRadius:100, padding:"6px", fontWeight:700, fontSize:12, cursor:"pointer" }}>✓</button>
                      <button onClick={()=>moderateMedia("photo", p.id, "reject")}
                        style={{ flex:1, background:"transparent", border:"1px solid rgba(220,38,38,.3)", color:"#dc2626", borderRadius:100, padding:"6px", fontWeight:700, fontSize:12, cursor:"pointer" }}>✗</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) :

        /* ── Video ── */
        videos.length === 0 ? (
          <div style={{ background:"white", border:"1px solid rgba(0,0,0,.06)", borderRadius:20, padding:"32px", textAlign:"center" }}>
            <p style={{ color:MUTED, fontSize:13, margin:0 }}>Nessun video in attesa.</p>
          </div>
        ) : videos.map(v=>(
          <div key={v.id} style={{ background:"white", border:"1px solid rgba(0,0,0,.07)", borderRadius:20, padding:"16px 20px", display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
            <div style={{ width:80, height:56, background:"#0a0a0b", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, cursor:"pointer" }}
              onClick={()=>window.open(v.url,"_blank")}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontWeight:700, fontSize:14, color:INK, margin:"0 0 2px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{v.title||"Video dimostrativo"}</p>
              <p style={{ fontSize:12, color:MUTED, margin:0 }}>{v.artist_name||"—"} · {v.size_bytes?`${(v.size_bytes/1024/1024).toFixed(1)} MB`:""}</p>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>moderateMedia("video", v.id, "approve")}
                style={{ background:"#16a34a", color:"white", border:"none", borderRadius:100, padding:"8px 18px", fontWeight:800, fontSize:13, cursor:"pointer" }}>✓ Approva</button>
              <button onClick={()=>moderateMedia("video", v.id, "reject")}
                style={{ background:"transparent", border:"1px solid rgba(220,38,38,.3)", color:"#dc2626", borderRadius:100, padding:"8px 14px", fontWeight:700, fontSize:13, cursor:"pointer" }}>Rifiuta</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}