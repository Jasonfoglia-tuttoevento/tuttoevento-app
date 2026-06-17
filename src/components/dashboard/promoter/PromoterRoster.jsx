"use client";
import { useState, useEffect, useMemo } from "react";
import { Card, INK, Inp, KpiCard, MUTED, O, ProBadge, ProLock, SCard, STitle } from "./shared";
export default function PromoterRoster({ portfolio, users, plan, onAdd, onRemove, addingEntry, addMsg }) {
  const [newEntry, setNewEntry] = useState({ entityType:"artist", entityId:"" });
  const availableArtists = users.filter(u => u.role==="artist");
  const availableVenues  = users.filter(u => u.role==="organizer");
  const portfolioArtists = portfolio.filter(p => p.entity_type==="artist");
  const portfolioVenues  = portfolio.filter(p => p.entity_type==="venue");

  const maxArtists = plan==="pro" ? Infinity : 5;
  const maxVenues  = plan==="pro" ? Infinity : 3;
  const atMaxArtists = portfolioArtists.length >= maxArtists;
  const atMaxVenues  = portfolioVenues.length  >= maxVenues;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* Aggiungi al roster */}
      <Card>
        <STitle>Aggiungi al roster</STitle>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end" }}>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:MUTED, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:".1em", fontFamily:"'Manrope',system-ui,sans-serif" }}>Tipo</label>
            <select value={newEntry.entityType} onChange={e => setNewEntry(p=>({...p,entityType:e.target.value,entityId:""}))}
              style={{ background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)", borderRadius:12, padding:"10px 13px", fontSize:13, fontFamily:"'Manrope',system-ui,sans-serif", outline:"none" }}>
              <option value="artist">Artista</option>
              <option value="venue">Locale</option>
            </select>
          </div>
          <div style={{ flex:1, minWidth:180 }}>
            <label style={{ fontSize:11, fontWeight:700, color:MUTED, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:".1em", fontFamily:"'Manrope',system-ui,sans-serif" }}>
              {newEntry.entityType==="artist"?"Artista":"Locale"}
            </label>
            <select value={newEntry.entityId} onChange={e => setNewEntry(p=>({...p,entityId:e.target.value}))}
              style={{ background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)", borderRadius:12, padding:"10px 13px", fontSize:13, fontFamily:"'Manrope',system-ui,sans-serif", outline:"none", width:"100%" }}>
              <option value="">Seleziona...</option>
              {(newEntry.entityType==="artist"?availableArtists:availableVenues).map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <button
            disabled={addingEntry || !newEntry.entityId || (newEntry.entityType==="artist"&&atMaxArtists&&plan!=="pro") || (newEntry.entityType==="venue"&&atMaxVenues&&plan!=="pro")}
            onClick={() => onAdd(newEntry)}
            style={{ background:O, color:"white", border:"none", borderRadius:100, padding:"11px 22px", fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif", opacity:addingEntry?.5:1 }}>
            {addingEntry?"...":"+ Aggiungi"}
          </button>
        </div>
        {addMsg && <p style={{ fontSize:12, fontWeight:700, color:addMsg.includes("✓")?"#16a34a":"#dc2626", marginTop:8, fontFamily:"'Manrope',system-ui,sans-serif" }}>{addMsg}</p>}

        {/* Limiti piano Free */}
        {plan==="free" && (
          <div style={{ marginTop:14, background:"rgba(255,90,0,.05)", border:"1px solid rgba(255,90,0,.15)", borderRadius:14, padding:"10px 14px", fontSize:12, color:O, fontWeight:700, fontFamily:"'Manrope',system-ui,sans-serif" }}>
            🔒 Piano Free: max 5 artisti e 3 locali nel roster. <span style={{ color:INK }}>Con PRO: illimitati.</span>
          </div>
        )}
      </Card>

      {/* Griglia roster */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

        {/* Artisti */}
        <Card>
          <STitle>🎤 Artisti ({portfolioArtists.length}{plan==="free"?"/5":""})</STitle>
          {portfolioArtists.length===0 ? (
            <p style={{ fontSize:13, color:"rgba(0,0,0,.3)" }}>Nessun artista nel roster.</p>
          ) : portfolioArtists.map(p => (
            <div key={p.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid rgba(0,0,0,.05)" }}>
              <div>
                <p style={{ fontWeight:700, fontSize:13, margin:0 }}>{p.entity_name||"—"}</p>
                {p.notes && <p style={{ fontSize:11, color:MUTED, margin:"2px 0 0" }}>{p.notes}</p>}
              </div>
              <button onClick={()=>onRemove(p.id)}
                style={{ background:"transparent", border:"none", color:"#dc2626", fontWeight:700, fontSize:15, cursor:"pointer" }}>×</button>
            </div>
          ))}
        </Card>

        {/* Locali */}
        <Card>
          <STitle>🏛️ Locali ({portfolioVenues.length}{plan==="free"?"/3":""})</STitle>
          {portfolioVenues.length===0 ? (
            <p style={{ fontSize:13, color:"rgba(0,0,0,.3)" }}>Nessun locale nel roster.</p>
          ) : portfolioVenues.map(p => (
            <div key={p.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid rgba(0,0,0,.05)" }}>
              <div>
                <p style={{ fontWeight:700, fontSize:13, margin:0 }}>{p.entity_name||"—"}</p>
                {p.notes && <p style={{ fontSize:11, color:MUTED, margin:"2px 0 0" }}>{p.notes}</p>}
              </div>
              <button onClick={()=>onRemove(p.id)}
                style={{ background:"transparent", border:"none", color:"#dc2626", fontWeight:700, fontSize:15, cursor:"pointer" }}>×</button>
            </div>
          ))}
        </Card>
      </div>

      {/* Commissione per artista — solo PRO */}
      <ProLock feature="La commissione personalizzabile per artista" plan={plan}>
        <Card>
          <STitle>Commissione per artista <ProBadge /></STitle>
          <p style={{ fontSize:13, color:MUTED, marginBottom:14 }}>Imposta una % di commissione diversa per ogni artista che gestisci. Default: 50% del margine TuttoEvento.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {portfolioArtists.slice(0,3).map((a,i) => (
              <div key={a.id||i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#fbfaf8", borderRadius:14, padding:"10px 14px", gap:10 }}>
                <p style={{ fontWeight:700, fontSize:13, margin:0, flex:1 }}>{a.entity_name||"—"}</p>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <input type="number" min="0" max="50" defaultValue="30"
                    style={{ width:60, background:"white", border:"1px solid rgba(0,0,0,.1)", borderRadius:8, padding:"6px 8px", fontSize:13, textAlign:"right", fontFamily:"'Manrope',system-ui,sans-serif", outline:"none" }} />
                  <span style={{ fontSize:13, color:MUTED, fontWeight:700 }}>%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </ProLock>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB 3 — TRATTATIVE
═══════════════════════════════════════════════════════════ */