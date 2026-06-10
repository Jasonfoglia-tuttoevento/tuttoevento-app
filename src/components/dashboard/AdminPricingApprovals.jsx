"use client";
import { useState, useEffect } from "react";

const O      = "#ff5a00";
const BG     = "#0a0a0b";
const CARD   = "#111114";
const BORDER = "rgba(255,255,255,.08)";
const MUTED  = "rgba(255,255,255,.38)";
const W      = "#ffffff";

const DURATIONS = [
  { key:"1h",      label:"1h"       },
  { key:"2h",      label:"2h"       },
  { key:"3h",      label:"3h"       },
  { key:"fullday", label:"Full day" },
];

const inp = {
  background:"rgba(255,255,255,.06)", border:`1px solid ${BORDER}`,
  borderRadius:10, padding:"8px 12px", fontSize:13, color:W,
  fontFamily:"'Manrope',system-ui,sans-serif", outline:"none", width:"100%",
  transition:"border-color .15s",
};

export default function AdminPricingApprovals() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(null); // { id, cachet_pricing, public_pricing }
  const [msg, setMsg]           = useState("");
  const [filter, setFilter]     = useState("pending");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/pricing-approval");
    const d   = await res.json();
    setRequests(Array.isArray(d) ? d : []);
    setLoading(false);
  }

  function startEdit(req) {
    // Inizializza public_pricing copiando cachet come base (admin lo modifica)
    const cachet = req.cachet_pricing || {};
    const base   = req.public_pricing || {};
    // Merge: per ogni evento/durata, usa public_pricing se esiste, altrimenti vuoto
    const init = {};
    Object.keys(cachet).forEach(ev => {
      init[ev] = {};
      Object.keys(cachet[ev]||{}).forEach(dur => {
        init[ev][dur] = base[ev]?.[dur] || "";
      });
    });
    setEditing({ id: req.id, artistName: req.artist_name, cachet_pricing: cachet, public_pricing: init });
    setMsg("");
  }

  function setPublicPrice(ev, dur, value) {
    setEditing(prev => ({
      ...prev,
      public_pricing: {
        ...prev.public_pricing,
        [ev]: { ...(prev.public_pricing[ev]||{}), [dur]: value },
      },
    }));
  }

  async function approve() {
    setMsg("Approvazione...");
    const res = await fetch("/api/pricing-approval", {
      method: "PATCH",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({
        id: editing.id,
        action: "approve",
        publicPricing: editing.public_pricing,
      }),
    });
    const d = await res.json();
    if (!res.ok) { setMsg(d.error || "Errore"); return; }
    setMsg("✓ Approvato e pubblicato");
    setEditing(null);
    await load();
  }

  async function reject(id, note="") {
    const res = await fetch("/api/pricing-approval", {
      method: "PATCH",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ id, action:"reject", adminNote:note }),
    });
    const d = await res.json();
    if (!res.ok) { setMsg(d.error||"Errore"); return; }
    setMsg("Richiesta rifiutata");
    await load();
  }

  const filtered = requests.filter(r => filter==="all" ? true : r.status===filter);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16, fontFamily:"'Manrope',system-ui,sans-serif" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
        <div>
          <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:20, color:W, margin:0, letterSpacing:"-.03em" }}>
            Approvazione prezzi
          </h2>
          <p style={{ fontSize:13, color:MUTED, margin:"4px 0 0" }}>
            {requests.filter(r=>r.status==="pending").length} richieste in attesa
          </p>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {["pending","approved","rejected","all"].map(f => (
            <button key={f} onClick={()=>setFilter(f)}
              style={{ padding:"6px 14px", borderRadius:100, fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif", border:filter===f?"none":`1px solid ${BORDER}`, background:filter===f?O:"transparent", color:filter===f?W:MUTED, transition:"all .15s" }}>
              {f==="pending"?"In attesa":f==="approved"?"Approvati":f==="rejected"?"Rifiutati":"Tutti"}
            </button>
          ))}
        </div>
      </div>

      {msg && <p style={{ fontSize:13, fontWeight:700, color:msg.includes("Errore")?"#f87171":"#4ade80", margin:0 }}>{msg}</p>}

      {loading ? (
        <p style={{ color:MUTED, fontSize:13 }}>Caricamento...</p>
      ) : filtered.length===0 ? (
        <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:20, padding:"32px", textAlign:"center" }}>
          <p style={{ color:MUTED, fontSize:13, margin:0 }}>Nessuna richiesta {filter==="all"?"":"con questo filtro"}.</p>
        </div>
      ) : filtered.map(req => (
        <div key={req.id} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:20, padding:"18px 20px" }}>

          {/* Header richiesta */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap", marginBottom:14 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:16, color:W, margin:0 }}>{req.artist_name||"Artista"}</h3>
                <span style={{
                  fontSize:10, fontWeight:700, padding:"2px 10px", borderRadius:100,
                  background: req.status==="pending"?"rgba(245,158,11,.15)":req.status==="approved"?"rgba(74,222,128,.15)":"rgba(248,113,113,.15)",
                  color: req.status==="pending"?"#f59e0b":req.status==="approved"?"#4ade80":"#f87171",
                }}>
                  {req.status==="pending"?"In attesa":req.status==="approved"?"Approvato":"Rifiutato"}
                </span>
              </div>
              {req.promoter_name && (
                <p style={{ fontSize:12, color:MUTED, margin:0 }}>
                  📣 Promoter: <strong style={{ color:W }}>{req.promoter_name}</strong>
                </p>
              )}
              <p style={{ fontSize:11, color:MUTED, margin:"4px 0 0" }}>
                {new Date(req.created_at).toLocaleDateString("it-IT",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}
              </p>
            </div>
            {req.status==="pending" && (
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>startEdit(req)}
                  style={{ background:O, color:W, border:"none", borderRadius:100, padding:"8px 18px", fontWeight:800, fontSize:13, cursor:"pointer" }}>
                  Imposta prezzi pubblici
                </button>
                <button onClick={()=>reject(req.id)}
                  style={{ background:"transparent", border:"1px solid rgba(248,113,113,.35)", color:"#f87171", borderRadius:100, padding:"8px 16px", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                  Rifiuta
                </button>
              </div>
            )}
          </div>

          {/* Cachet netto artista */}
          <div style={{ marginBottom:12 }}>
            <p style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".1em", margin:"0 0 8px" }}>Cachet netto dichiarato</p>
            <div style={{ overflowX:"auto" }}>
              <table style={{ borderCollapse:"collapse", fontSize:12 }}>
                <thead>
                  <tr>
                    <th style={{ padding:"4px 12px 4px 0", textAlign:"left", color:MUTED, fontWeight:600, whiteSpace:"nowrap" }}>Evento</th>
                    {DURATIONS.map(d=><th key={d.key} style={{ padding:"4px 8px", textAlign:"center", color:MUTED, fontWeight:600, whiteSpace:"nowrap" }}>{d.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(req.cachet_pricing||{}).map(([ev,durations])=>(
                    <tr key={ev}>
                      <td style={{ padding:"4px 12px 4px 0", color:W, fontWeight:600, whiteSpace:"nowrap" }}>{ev}</td>
                      {DURATIONS.map(d=>(
                        <td key={d.key} style={{ padding:"4px 8px", textAlign:"center", color:durations?.[d.key]?O:MUTED, fontWeight:700 }}>
                          {durations?.[d.key]?`€${durations[d.key]}`:"—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Prezzi pubblici approvati (se già approvato) */}
          {req.status==="approved" && req.public_pricing && (
            <div style={{ background:"rgba(74,222,128,.06)", border:"1px solid rgba(74,222,128,.2)", borderRadius:12, padding:"12px 14px" }}>
              <p style={{ fontSize:11, fontWeight:700, color:"#4ade80", textTransform:"uppercase", letterSpacing:".1em", margin:"0 0 8px" }}>Prezzi pubblici approvati</p>
              <div style={{ overflowX:"auto" }}>
                <table style={{ borderCollapse:"collapse", fontSize:12 }}>
                  <tbody>
                    {Object.entries(req.public_pricing||{}).map(([ev,durations])=>(
                      <tr key={ev}>
                        <td style={{ padding:"3px 12px 3px 0", color:W, fontWeight:600, whiteSpace:"nowrap" }}>{ev}</td>
                        {DURATIONS.map(d=>(
                          <td key={d.key} style={{ padding:"3px 8px", textAlign:"center", color:durations?.[d.key]?"#4ade80":MUTED, fontWeight:700 }}>
                            {durations?.[d.key]?`€${durations[d.key]}`:"—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Modal impostazione prezzi pubblici */}
      {editing && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", backdropFilter:"blur(8px)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
          onClick={e=>{if(e.target===e.currentTarget)setEditing(null)}}>
          <div style={{ background:"#111114", border:`1px solid ${BORDER}`, borderRadius:24, padding:"24px 28px", width:"100%", maxWidth:640, maxHeight:"85vh", overflowY:"auto" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <div>
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:18, color:W, margin:0 }}>Imposta prezzi pubblici</h3>
                <p style={{ fontSize:13, color:MUTED, margin:"4px 0 0" }}>{editing.artistName}</p>
              </div>
              <button onClick={()=>setEditing(null)}
                style={{ width:34, height:34, borderRadius:10, background:"rgba(255,255,255,.08)", border:"none", color:W, fontSize:18, cursor:"pointer" }}>×</button>
            </div>

            <p style={{ fontSize:12, color:MUTED, margin:"0 0 16px", lineHeight:1.6 }}>
              I prezzi pubblici sono quelli che vedranno i locali nel marketplace. Imposta un markup rispetto al cachet netto. Lascia vuoto per non pubblicare quella combinazione.
            </p>

            {/* Griglia cachet vs prezzo pubblico */}
            <div style={{ overflowX:"auto", marginBottom:20 }}>
              <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:"0 8px", fontSize:13 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign:"left", padding:"0 12px 4px 0", fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".1em" }}>Evento</th>
                    {DURATIONS.map(d=>(
                      <th key={d.key} style={{ textAlign:"center", padding:"0 6px 4px", fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".1em", whiteSpace:"nowrap" }}>{d.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(editing.cachet_pricing||{}).map(([ev,durations])=>(
                    <tr key={ev}>
                      <td style={{ padding:"4px 12px 4px 0", whiteSpace:"nowrap" }}>
                        <span style={{ fontSize:13, fontWeight:700, color:W }}>{ev}</span>
                      </td>
                      {DURATIONS.map(d=>{
                        const cachetVal = durations?.[d.key];
                        const pubVal    = editing.public_pricing?.[ev]?.[d.key];
                        const margin    = cachetVal && pubVal ? Math.round(((Number(pubVal)-Number(cachetVal))/Number(cachetVal))*100) : null;
                        return (
                          <td key={d.key} style={{ padding:"4px 6px" }}>
                            {cachetVal ? (
                              <div>
                                <p style={{ fontSize:10, color:MUTED, margin:"0 0 3px", textAlign:"center" }}>
                                  cachet: <span style={{ color:O }}>€{cachetVal}</span>
                                  {margin!==null && <span style={{ color:margin>0?"#4ade80":"#f87171", marginLeft:4 }}> +{margin}%</span>}
                                </p>
                                <div style={{ position:"relative" }}>
                                  <span style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)", fontSize:12, color:MUTED, pointerEvents:"none" }}>€</span>
                                  <input type="number" min="0" placeholder="—"
                                    value={pubVal||""}
                                    onChange={e=>setPublicPrice(ev,d.key,e.target.value)}
                                    style={{ ...inp, paddingLeft:20, textAlign:"right", width:80, fontSize:12 }} />
                                </div>
                              </div>
                            ) : (
                              <span style={{ fontSize:12, color:"rgba(255,255,255,.15)", display:"block", textAlign:"center" }}>—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={approve}
                style={{ flex:1, background:O, color:W, border:"none", borderRadius:100, padding:"12px", fontWeight:800, fontSize:14, cursor:"pointer", boxShadow:`0 8px 24px ${O}40` }}>
                ✓ Approva e pubblica
              </button>
              <button onClick={()=>reject(editing.id,"Prezzi rivisti")}
                style={{ background:"transparent", border:"1px solid rgba(248,113,113,.35)", color:"#f87171", borderRadius:100, padding:"12px 20px", fontWeight:700, fontSize:14, cursor:"pointer" }}>
                Rifiuta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}