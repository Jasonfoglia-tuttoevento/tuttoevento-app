"use client";
import { useState, useEffect } from "react";

const O = "#ff5a00", INK = "#0a0a0b", MUTED = "#6b6b73";

const TYPE_LABEL = { artist:"Artista", organizer:"Locale", external:"Esterno" };
const TYPE_COLOR = { artist:"#7c3aed", organizer:"#2563eb", external:"#6b7280" };

function ContactCard({ c, onEdit, onDelete }) {
  const [editing, setEditing]   = useState(false);
  const [notes, setNotes]       = useState(c.notes || "");
  const [tagsInput, setTagsInput] = useState((c.tags || []).join(", "));
  const [saving, setSaving]     = useState(false);

  async function save() {
    setSaving(true);
    await onEdit(c.id, {
      notes,
      tags: tagsInput.split(",").map(t => t.trim()).filter(Boolean),
    });
    setSaving(false); setEditing(false);
  }

  return (
    <div style={{ background:"#fbfaf8", border:"1px solid rgba(0,0,0,.06)", borderRadius:16, padding:"14px 16px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:`${TYPE_COLOR[c.contact_type]||MUTED}18`,
          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
          fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:15, color:TYPE_COLOR[c.contact_type]||MUTED }}>
          {(c.contact_name || c.email || "?")[0].toUpperCase()}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontWeight:800, fontSize:14, margin:0, color:INK, fontFamily:"'Sora',sans-serif",
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {c.contact_name || "Senza nome"}
          </p>
          <p style={{ fontSize:11.5, color:MUTED, margin:"2px 0 0" }}>
            {[c.email, c.phone].filter(Boolean).join(" · ") || "Nessun contatto"}
          </p>
        </div>
        <span style={{ fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:100, flexShrink:0,
          background:`${TYPE_COLOR[c.contact_type]||MUTED}18`, color:TYPE_COLOR[c.contact_type]||MUTED }}>
          {TYPE_LABEL[c.contact_type] || "Esterno"}
        </span>
      </div>

      {/* Tags */}
      {!editing && c.tags?.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:8 }}>
          {c.tags.map(t => (
            <span key={t} style={{ fontSize:11, fontWeight:600, color:O, background:`${O}10`, borderRadius:100, padding:"2px 9px" }}>{t}</span>
          ))}
        </div>
      )}

      {/* Note */}
      {editing ? (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2}
            placeholder="Note private su questo contatto…"
            style={{ width:"100%", boxSizing:"border-box", background:"white", border:"1px solid rgba(0,0,0,.1)",
              borderRadius:10, padding:"8px 10px", fontSize:13, fontFamily:"'Manrope',system-ui,sans-serif", outline:"none", resize:"vertical" }} />
          <input value={tagsInput} onChange={e=>setTagsInput(e.target.value)}
            placeholder="Tag separati da virgola (es. affidabile, top cachet)"
            style={{ width:"100%", boxSizing:"border-box", background:"white", border:"1px solid rgba(0,0,0,.1)",
              borderRadius:10, padding:"8px 10px", fontSize:12, fontFamily:"'Manrope',system-ui,sans-serif", outline:"none" }} />
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={save} disabled={saving}
              style={{ fontSize:12, fontWeight:700, padding:"6px 14px", borderRadius:100, border:"none",
                background:O, color:"white", cursor:"pointer", fontFamily:"inherit", opacity:saving?.6:1 }}>
              {saving ? "Salvo…" : "✓ Salva"}
            </button>
            <button onClick={()=>setEditing(false)}
              style={{ fontSize:12, fontWeight:700, padding:"6px 14px", borderRadius:100,
                border:"1px solid rgba(0,0,0,.1)", background:"white", color:MUTED, cursor:"pointer", fontFamily:"inherit" }}>
              Annulla
            </button>
          </div>
        </div>
      ) : (
        <>
          {c.notes && <p style={{ fontSize:12.5, color:"#333", margin:"0 0 10px", lineHeight:1.5 }}>{c.notes}</p>}
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>setEditing(true)}
              style={{ fontSize:12, fontWeight:700, padding:"6px 14px", borderRadius:100,
                border:"1px solid rgba(0,0,0,.1)", background:"white", color:INK, cursor:"pointer", fontFamily:"inherit" }}>
              Modifica
            </button>
            <button onClick={()=>onDelete(c.id)}
              style={{ fontSize:12, fontWeight:700, padding:"6px 14px", borderRadius:100,
                border:"1px solid rgba(220,38,38,.2)", background:"rgba(220,38,38,.06)", color:"#dc2626", cursor:"pointer", fontFamily:"inherit" }}>
              Elimina
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function CRMContacts({ contactType = "artist" }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [showAdd, setShowAdd]   = useState(false);
  const [newName, setNewName]   = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [adding, setAdding]     = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/crm/contacts");
      const d = await res.json();
      setContacts(Array.isArray(d) ? d : []);
    } catch {} finally { setLoading(false); }
  }

  async function addContact() {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/crm/contacts", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ contactName:newName, email:newEmail, phone:newPhone, contactType:"external" }),
      });
      if (res.ok) {
        setNewName(""); setNewEmail(""); setNewPhone(""); setShowAdd(false);
        load();
      }
    } catch {} finally { setAdding(false); }
  }

  async function editContact(id, updates) {
    await fetch("/api/crm/contacts", {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ id, ...updates }),
    });
    load();
  }

  async function deleteContact(id) {
    if (!confirm("Eliminare questo contatto?")) return;
    await fetch(`/api/crm/contacts?id=${id}`, { method:"DELETE" });
    setContacts(prev => prev.filter(c => c.id !== id));
  }

  const filtered = search
    ? contacts.filter(c =>
        (c.contact_name||"").toLowerCase().includes(search.toLowerCase()) ||
        (c.email||"").toLowerCase().includes(search.toLowerCase()) ||
        (c.tags||[]).some(t => t.toLowerCase().includes(search.toLowerCase())))
    : contacts;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ background:"white", border:"1px solid rgba(0,0,0,.06)", borderRadius:20, padding:"20px 22px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:14, flexWrap:"wrap" }}>
          <div>
            <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:16, color:INK, margin:0 }}>La tua rubrica</h3>
            <p style={{ fontSize:12, color:MUTED, margin:"3px 0 0" }}>Contatti, note e tag privati — solo tuoi.</p>
          </div>
          <button onClick={()=>setShowAdd(p=>!p)}
            style={{ background: showAdd ? "rgba(0,0,0,.06)" : O, color: showAdd ? INK : "white", border:"none",
              borderRadius:100, padding:"9px 18px", fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif" }}>
            {showAdd ? "✕ Annulla" : "+ Aggiungi contatto"}
          </button>
        </div>

        {showAdd && (
          <div style={{ background:"#fbfaf8", borderRadius:14, padding:14, marginBottom:14, display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:8 }}>
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nome"
              style={{ background:"white", border:"1px solid rgba(0,0,0,.1)", borderRadius:10, padding:"9px 12px", fontSize:13, outline:"none", fontFamily:"'Manrope',system-ui,sans-serif" }} />
            <input value={newEmail} onChange={e=>setNewEmail(e.target.value)} placeholder="Email" type="email"
              style={{ background:"white", border:"1px solid rgba(0,0,0,.1)", borderRadius:10, padding:"9px 12px", fontSize:13, outline:"none", fontFamily:"'Manrope',system-ui,sans-serif" }} />
            <input value={newPhone} onChange={e=>setNewPhone(e.target.value)} placeholder="Telefono"
              style={{ background:"white", border:"1px solid rgba(0,0,0,.1)", borderRadius:10, padding:"9px 12px", fontSize:13, outline:"none", fontFamily:"'Manrope',system-ui,sans-serif" }} />
            <button onClick={addContact} disabled={adding || !newName.trim()}
              style={{ background:O, color:"white", border:"none", borderRadius:10, padding:"9px 18px",
                fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", opacity:(adding||!newName.trim())?.5:1 }}>
              {adding ? "…" : "Salva"}
            </button>
          </div>
        )}

        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Cerca per nome, email o tag…"
          style={{ width:"100%", boxSizing:"border-box", background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)",
            borderRadius:12, padding:"10px 14px", fontSize:13, outline:"none", fontFamily:"'Manrope',system-ui,sans-serif" }} />
      </div>

      {loading ? (
        <p style={{ fontSize:13, color:MUTED, textAlign:"center", padding:20 }}>Caricamento…</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"32px 0" }}>
          <p style={{ fontSize:28, margin:"0 0 8px" }}>📇</p>
          <p style={{ fontSize:14, fontWeight:700, color:INK, margin:"0 0 4px" }}>
            {search ? "Nessun risultato" : "Rubrica vuota"}
          </p>
          <p style={{ fontSize:12, color:MUTED, margin:0 }}>
            {search ? "Prova un'altra ricerca." : "Aggiungi i tuoi contatti per tenerli organizzati."}
          </p>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:10 }}>
          {filtered.map(c => (
            <ContactCard key={c.id} c={c} onEdit={editContact} onDelete={deleteContact} />
          ))}
        </div>
      )}
    </div>
  );
}