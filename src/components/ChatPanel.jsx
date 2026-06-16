"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import VerifiedBadge from "@/components/VerifiedBadge";

/* ─── Helpers ─────────────────────────────────────────────── */
function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const diffMin = Math.floor((Date.now() - d) / 60000);
  const diffH   = Math.floor(diffMin / 60);
  const diffD   = Math.floor(diffH   / 24);
  if (diffMin < 1)  return "Adesso";
  if (diffMin < 60) return `${diffMin} min fa`;
  if (diffH < 24)   return `${diffH}h fa`;
  if (diffD < 7)    return `${diffD}g fa`;
  return d.toLocaleDateString("it-IT", { day:"2-digit", month:"2-digit" });
}

function formatLastSeen(iso) {
  if (!iso) return null;
  const diffMin = Math.floor((Date.now() - new Date(iso)) / 60000);
  const diffH   = Math.floor(diffMin / 60);
  const diffD   = Math.floor(diffH   / 24);
  if (diffMin < 2)  return "Online";
  if (diffMin < 60) return `Attivo ${diffMin} min fa`;
  if (diffH < 24)   return `Attivo ${diffH}h fa`;
  if (diffD < 7)    return `Attivo ${diffD}g fa`;
  return `Attivo il ${new Date(iso).toLocaleDateString("it-IT", { day:"2-digit", month:"2-digit" })}`;
}

function isOnline(iso) {
  return iso && (Date.now() - new Date(iso)) < 120000;
}

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function getOtherName(title, myName) {
  if (!title) return "Conversazione";
  const parts = title.split(/[&·\-,]/).map(s => s.trim()).filter(Boolean);
  if (parts.length < 2) return title;
  const mine = (myName || "").toLowerCase();
  const other = parts.find(p => p.toLowerCase() !== mine);
  return other || parts[parts.length - 1];
}

/* ─── Avatar con foto e badge verificato ─────────────────── */
function Avatar({ name, photo, verified, size = 36, orange = false, online: onl = false }) {
  return (
    <div style={{ position:"relative", flexShrink:0, width:size, height:size }}>
      {photo ? (
        <img src={photo} alt={name} style={{
          width:size, height:size, borderRadius:"50%", objectFit:"cover",
          border:"1.5px solid rgba(255,255,255,.12)",
        }} />
      ) : (
        <div style={{
          width:size, height:size, borderRadius:"50%",
          background: orange ? "#ff5a00" : "#1e1e22",
          border:"1.5px solid rgba(255,255,255,.12)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"'Sora',sans-serif", fontWeight:800,
          fontSize:size * 0.36, color:"white", letterSpacing:"-.02em",
        }}>
          {initials(name)}
        </div>
      )}
      {/* Badge verificato */}
      {verified && (
        <div style={{ position:"absolute", bottom:-2, right:-2 }}>
          <VerifiedBadge size={size * 0.42} />
        </div>
      )}
      {/* Dot online (solo se non c'è badge) */}
      {onl && !verified && (
        <span style={{
          position:"absolute", bottom:0, right:0,
          width:size * 0.28, height:size * 0.28,
          borderRadius:"50%", background:"#22c55e",
          border:`${size * 0.06}px solid #111114`,
        }} />
      )}
    </div>
  );
}

/* ─── ConvItem ────────────────────────────────────────────── */
function ConvItem({ conv, isActive, onClick, myName, onlineMap, usersMap }) {
  const unread = Number(conv.unreadCount || 0);
  const otherName = getOtherName(conv.title, myName);
  const lastSeen = onlineMap?.[conv.otherUserId];
  const online = isOnline(lastSeen);
  const otherUser = usersMap?.[conv.otherUserId];

  return (
    <button onClick={onClick} style={{
      width:"100%", textAlign:"left", border:"none", cursor:"pointer",
      borderRadius:18, padding:"10px 12px", marginBottom:3,
      background: isActive ? "rgba(255,90,0,.15)" : unread > 0 ? "rgba(255,90,0,.06)" : "rgba(255,255,255,.03)",
      borderLeft: isActive ? "3px solid #ff5a00" : unread > 0 ? "3px solid rgba(255,90,0,.4)" : "3px solid transparent",
      transition:"background .15s",
      fontFamily:"'Manrope',system-ui,sans-serif",
      display:"flex", gap:10, alignItems:"center",
    }}>
      <Avatar name={otherName} photo={otherUser?.photo} verified={otherUser?.verified} size={38} online={online} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:6 }}>
          <p style={{ fontWeight:700, fontSize:13, color:"white", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {otherName}
          </p>
          {unread > 0 && !isActive && (
            <span style={{ background:"#ff5a00", color:"white", borderRadius:100, padding:"1px 7px", fontSize:10, fontWeight:800, flexShrink:0 }}>
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>
        <p style={{ fontSize:11, color: unread > 0 ? "rgba(255,255,255,.55)" : "rgba(255,255,255,.3)", margin:"3px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {conv.lastMessage || "Nessun messaggio ancora"}
        </p>
        {lastSeen && (
          <p style={{ fontSize:10, color: online ? "#22c55e" : "rgba(255,255,255,.25)", margin:"2px 0 0", fontWeight:600 }}>
            {formatLastSeen(lastSeen)}
          </p>
        )}
      </div>
    </button>
  );
}

/* ─── Bubble ──────────────────────────────────────────────── */
function Bubble({ msg, isMine, senderPhoto, senderVerified }) {
  return (
    <div style={{ display:"flex", justifyContent: isMine ? "flex-end" : "flex-start", marginBottom:6, gap:8, alignItems:"flex-end" }}>
      {!isMine && <Avatar name={msg.senderName || "?"} photo={senderPhoto} verified={senderVerified} size={28} />}
      <div style={{ maxWidth:"72%", minWidth:48 }}>
        {!isMine && (
          <p style={{ fontSize:10, fontWeight:700, color:"#ff5a00", marginBottom:3, marginLeft:2, fontFamily:"'Manrope',system-ui,sans-serif" }}>
            {msg.senderName || "Utente"}
          </p>
        )}
        <div style={{
          background: isMine ? "#ff5a00" : "rgba(255,255,255,.09)",
          border: isMine ? "none" : "1px solid rgba(255,255,255,.1)",
          borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          padding:"9px 13px",
        }}>
          <p style={{ fontSize:13, lineHeight:1.6, color:"white", margin:0, whiteSpace:"pre-wrap", wordBreak:"break-word", fontFamily:"'Manrope',system-ui,sans-serif" }}>
            {msg.body}
          </p>
        </div>
        <p style={{ fontSize:10, color:"rgba(255,255,255,.22)", marginTop:2, textAlign: isMine ? "right" : "left", marginLeft:2, marginRight:2, fontFamily:"'Manrope',system-ui,sans-serif" }}>
          {formatTime(msg.createdAt)}
        </p>
      </div>
      {isMine && <Avatar name="Tu" size={28} orange />}
    </div>
  );
}

/* ─── TypingIndicator ────────────────────────────────────── */
function TypingIndicator({ name }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 0 8px" }}>
      <div style={{ background:"rgba(255,255,255,.09)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"18px 18px 18px 4px", padding:"8px 13px", display:"flex", gap:3, alignItems:"center" }}>
        <span className="cp-dot" />
        <span className="cp-dot" />
        <span className="cp-dot" />
      </div>
      <span style={{ fontSize:11, color:"rgba(255,255,255,.3)", fontFamily:"'Manrope',system-ui,sans-serif" }}>
        {name} sta scrivendo...
      </span>
    </div>
  );
}

/* ─── ChatPanel ───────────────────────────────────────────── */
export default function ChatPanel({ user }) {
  const [isOpen, setIsOpen]               = useState(false);
  const [view, setView]                   = useState("list");
  const [users, setUsers]                 = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [messages, setMessages]           = useState([]);
  const [message, setMessage]             = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isSending, setIsSending]         = useState(false);
  const [showNewChat, setShowNewChat]     = useState(false);
  const [onlineMap, setOnlineMap]         = useState({});
  const [typingUsers, setTypingUsers]     = useState({}); // { convId: { userId: timestamp } }
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const pingRef    = useRef(null);
  const typingRef  = useRef(null);
  const supabaseRef     = useRef(null);
  const selectedConvRef = useRef(selectedConvId); // ref aggiornato per evitare stale closure
  const isOpenRef       = useRef(isOpen);

  const totalUnread = conversations.reduce((t, c) => t + Number(c.unreadCount || 0), 0);

  // Mantieni i ref sincronizzati con lo state (per closure nel canale realtime)
  useEffect(() => { selectedConvRef.current = selectedConvId; }, [selectedConvId]);
  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

  // Map userId → user info (photo, verified)
  const usersMap = Object.fromEntries(users.map(u => [u.id, u]));

  /* ── Presenza ── */
  useEffect(() => {
    if (!user?.id) return;
    async function ping() { try { await fetch("/api/presence", { method:"POST" }); } catch {} }
    ping();
    pingRef.current = setInterval(ping, 60000);
    return () => clearInterval(pingRef.current);
  }, [user?.id]);

  const loadPresence = useCallback(async (convList) => {
    if (!convList?.length) return;
    try {
      const res = await fetch("/api/presence");
      const d = await res.json();
      if (Array.isArray(d)) {
        const map = {};
        d.forEach(u => { map[u.id] = u.last_seen; });
        setOnlineMap(map);
      }
    } catch {}
  }, []);

  /* ── API ── */
  const loadUsers = useCallback(async () => {
    const res = await fetch("/api/chat/users");
    const d = await res.json();
    setUsers(Array.isArray(d) ? d : []);
  }, []);

  const loadConversations = useCallback(async () => {
    const res = await fetch("/api/chat/conversations");
    const d = await res.json();
    if (!Array.isArray(d)) return;
    setConversations(d);
    setSelectedConvId(prev => prev || (d.length > 0 ? d[0].id : null));
    loadPresence(d);
  }, [loadPresence]);

  const loadMessages = useCallback(async (convId) => {
    if (!convId) return;
    const res = await fetch(`/api/chat/messages?conversationId=${convId}`);
    const d = await res.json();
    setMessages(Array.isArray(d) ? d : []);
  }, []);

  const markAsRead = useCallback(async (convId) => {
    if (!convId) return;
    await fetch("/api/chat/conversations", {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ conversationId: convId }),
    });
    loadConversations();
  }, [loadConversations]);

  /* ── Realtime + fallback iOS background ── */
  useEffect(() => {
    if (!user?.id) return;
    const supabase = createSupabaseBrowserClient();
    supabaseRef.current = supabase;
    let channel = null;
    let pollTimer = null;

    function buildChannel() {
      // Rimuovi canale precedente se esiste
      if (channel) { try { supabase.removeChannel(channel); } catch {} }

      channel = supabase
        .channel(`chat-realtime-${user.id}-${Date.now()}`)
        .on("postgres_changes", { event:"INSERT", schema:"public", table:"chat_messages" }, (payload) => {
          const m = payload.new;
          // Usa selectedConvRef per evitare stale closure
          const activeConvId = selectedConvRef.current;
          if (Number(m.conversation_id) === Number(activeConvId)) {
            setMessages(prev => prev.some(x => x.id === m.id) ? prev : [...prev, {
              id:m.id, conversationId:m.conversation_id, senderId:m.sender_id,
              body:m.body, createdAt:m.created_at, senderName:"", senderRole:"",
            }]);
            if (isOpenRef.current) markAsRead(m.conversation_id);
          }
          loadConversations();
          if (m.sender_id !== user.id) {
            setTypingUsers(prev => {
              const next = { ...prev };
              if (next[m.conversation_id]) delete next[m.conversation_id][m.sender_id];
              return next;
            });
          }
        })
        .on("broadcast", { event:"typing" }, (payload) => {
          const { userId, convId, isTyping } = payload.payload || {};
          if (userId === user.id) return;
          setTypingUsers(prev => {
            const next = { ...prev };
            if (!next[convId]) next[convId] = {};
            if (isTyping) { next[convId][userId] = Date.now(); }
            else { delete next[convId][userId]; }
            return next;
          });
        })
        .subscribe((status) => {
          // Se la subscription fallisce, avvia polling di fallback
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            startPolling();
          } else {
            stopPolling();
          }
        });
    }

    /* ── Polling fallback (iOS background / Safari) ── */
    function startPolling() {
      if (pollTimer) return; // già attivo
      pollTimer = setInterval(() => {
        loadConversations();
        if (selectedConvId) loadMessages(selectedConvId);
      }, 15000); // ogni 15 secondi
    }

    function stopPolling() {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    }

    /* ── visibilitychange: riconnette quando l'app torna in foreground ── */
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        // Ricarica dati freschi
        loadConversations();
        if (selectedConvId) loadMessages(selectedConvId);
        // Ricostruisce il canale Realtime (era caduto in background su iOS)
        buildChannel();
        stopPolling();
      } else {
        // App in background → avvia polling leggero come fallback
        startPolling();
      }
    }

    buildChannel();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      stopPolling();
      if (channel) { try { supabase.removeChannel(channel); } catch {} }
    };
  }, [user?.id, selectedConvId, isOpen, loadConversations, markAsRead, loadMessages]);

  /* ── Init ── */
  useEffect(() => {
    if (!user?.id) return;
    loadUsers(); loadConversations();
  }, [user?.id, loadUsers, loadConversations]);

  useEffect(() => {
    if (!selectedConvId) return;
    loadMessages(selectedConvId);
    if (isOpen) markAsRead(selectedConvId);
  }, [selectedConvId, isOpen, loadMessages, markAsRead]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  useEffect(() => {
    if (isOpen && view === "chat") setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen, view]);

  useEffect(() => {
    if (!isOpen) return;
    const t = setInterval(() => loadPresence(conversations), 30000);
    return () => clearInterval(t);
  }, [isOpen, conversations, loadPresence]);

  // Pulizia typing stale ogni 5s
  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(convId => {
          Object.keys(next[convId]).forEach(uid => {
            if (now - next[convId][uid] > 5000) delete next[convId][uid];
          });
          if (!Object.keys(next[convId]).length) delete next[convId];
        });
        return next;
      });
    }, 5000);
    return () => clearInterval(t);
  }, []);

  /* ── Apertura da altri componenti ── */
  useEffect(() => {
    if (!user?.id) return;
    function handleOpenChat(e) {
      const d = e.detail;
      if (!d?.participantUserId) return;
      createOrOpenConversation({ participantUserId:d.participantUserId, bookingId:d.bookingId||null, eventId:d.eventId||null, title:d.title||"Conversazione" });
    }
    function handleOpenButton() {
      setIsOpen(true); setView("list");
      if (selectedConvId) markAsRead(selectedConvId);
    }
    window.addEventListener("tuttoevento:open-chat", handleOpenChat);
    window.addEventListener("tuttoevento:open-chat-button", handleOpenButton);
    return () => {
      window.removeEventListener("tuttoevento:open-chat", handleOpenChat);
      window.removeEventListener("tuttoevento:open-chat-button", handleOpenButton);
    };
  }, [user?.id, selectedConvId, markAsRead]);

  /* ── Typing broadcast ── */
  function broadcastTyping(isTyping) {
    if (!selectedConvId || !supabaseRef.current) return;
    supabaseRef.current.channel(`chat-realtime-${user.id}`)
      .send({ type:"broadcast", event:"typing", payload:{ userId:user.id, convId:selectedConvId, isTyping } })
      .catch(() => {});
  }

  function handleInputChange(e) {
    setMessage(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 110) + "px";
    // Broadcast typing start
    broadcastTyping(true);
    // Reset timer stop typing
    clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => broadcastTyping(false), 2500);
  }

  /* ── Azioni ── */
  async function createOrOpenConversation({ participantUserId, bookingId=null, eventId=null, title="Nuova conversazione" }) {
    const otherUser = users.find(u => String(u.id) === String(participantUserId));
    const cleanTitle = otherUser?.name || title;
    const res = await fetch("/api/chat/conversations", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ participantUserId:Number(participantUserId), bookingId, eventId, title:cleanTitle }),
    });
    const d = await res.json();
    if (!res.ok || !d.id) { alert("Errore apertura conversazione"); return; }
    setIsOpen(true); setSelectedConvId(d.id); setSelectedUserId(""); setShowNewChat(false); setView("chat");
    await loadConversations(); await loadMessages(d.id); await markAsRead(d.id);
  }

  async function handleSelectConv(convId) {
    setSelectedConvId(convId); setView("chat");
    await loadMessages(convId); await markAsRead(convId);
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!selectedConvId || !message.trim() || isSending) return;
    setIsSending(true);
    broadcastTyping(false);
    clearTimeout(typingRef.current);
    const text = message.trim(); setMessage("");
    if (inputRef.current) { inputRef.current.style.height = "auto"; }
    const res = await fetch("/api/chat/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ conversationId:selectedConvId, message:text }),
    });
    if (!res.ok) { setMessage(text); alert("Errore invio messaggio"); }
    setIsSending(false);
  }

  const selectedConv = conversations.find(c => c.id === selectedConvId);
  const otherName = selectedConv
    ? (usersMap[selectedConv.otherUserId]?.name || getOtherName(selectedConv.title, user?.name))
    : null;
  const otherLastSeen = selectedConv ? onlineMap?.[selectedConv.otherUserId] : null;
  const otherOnline = isOnline(otherLastSeen);
  const otherUser = selectedConv ? usersMap[selectedConv.otherUserId] : null;

  // Chi sta scrivendo nella conversazione attiva
  const activeTyping = selectedConvId ? Object.keys(typingUsers[selectedConvId] || {}) : [];
  const isOtherTyping = activeTyping.length > 0;

  if (!user?.id) return null;

  return (
    <>
      <style>{`
        .cp-btn {
          display:none; position:fixed; bottom:24px; right:24px; z-index:40;
          background:#0a0a0b; color:white; border:none; border-radius:100px;
          padding:13px 22px; font-family:'Manrope',system-ui,sans-serif; font-weight:800; font-size:.875rem;
          cursor:pointer; box-shadow:0 8px 32px rgba(0,0,0,.5); transition:transform .2s;
          align-items:center; gap:8px;
        }
        @media(min-width:1024px){ .cp-btn{display:flex;} }
        .cp-btn:hover{transform:scale(1.03);}
        .cp-badge{background:#ff5a00;color:white;border-radius:100px;padding:2px 8px;font-size:11px;font-weight:900;}

        .cp-overlay{position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.65);backdrop-filter:blur(8px);display:flex;justify-content:flex-end;animation:cpfi .2s ease;height:100%;height:100dvh;}
        @keyframes cpfi{from{opacity:0}to{opacity:1}}

        .cp-panel{
          width:100%;max-width:940px;height:100%;height:100dvh;background:#0a0a0b;
          display:grid;grid-template-columns:280px 1fr;
          animation:cpsi .25s cubic-bezier(.4,0,.2,1);
          border-left:1px solid rgba(255,255,255,.07);
          overflow:hidden;
        }
        @keyframes cpsi{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}

        .cp-sidebar{background:#111114;border-right:1px solid rgba(255,255,255,.07);display:flex;flex-direction:column;height:100%;overflow:hidden;}
        .cp-main{display:flex;flex-direction:column;height:100%;overflow:hidden;background:#0a0a0b;}

        @media(max-width:767px){
          .cp-overlay{align-items:flex-end;}
          .cp-panel{grid-template-columns:1fr;max-width:100%;width:100%;border-radius:20px 20px 0 0;height:92%;height:92dvh;border-left:none;}
          .cp-sidebar{display:none;}
          .cp-sidebar.mv{display:flex!important;}
          .cp-main{display:none;}
          .cp-main.mv{display:flex!important;}
          .cp-back{display:block!important;}
          .cp-form{padding-bottom:max(14px,env(safe-area-inset-bottom))!important;}
        }

        .cp-scroll::-webkit-scrollbar{width:3px;}
        .cp-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:2px;}

        .cp-input{
          flex:1;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);
          border-radius:14px;padding:11px 15px;color:white;font-size:13px;
          font-family:'Manrope',system-ui,sans-serif;outline:none;resize:none;
          min-height:42px;max-height:110px;transition:border-color .2s;line-height:1.5;
        }
        .cp-input::placeholder{color:rgba(255,255,255,.28);}
        .cp-input:focus{border-color:rgba(255,90,0,.45);}

        .cp-send{background:#ff5a00;color:white;border:none;border-radius:14px;padding:11px 18px;font-weight:800;font-size:.875rem;cursor:pointer;font-family:'Manrope',system-ui,sans-serif;transition:all .2s;flex-shrink:0;align-self:flex-end;}
        .cp-send:disabled{opacity:.35;cursor:not-allowed;}
        .cp-send:not(:disabled):hover{background:#e85100;transform:scale(1.03);}

        .cp-select{width:100%;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:10px 12px;color:white;font-size:13px;font-family:'Manrope',system-ui,sans-serif;outline:none;margin-bottom:10px;}
        .cp-select option{background:#1a1a1e;color:white;}

        .cp-start{width:100%;background:#ff5a00;color:white;border:none;border-radius:12px;padding:11px;font-weight:800;font-size:13px;cursor:pointer;font-family:'Manrope',system-ui,sans-serif;transition:all .2s;}
        .cp-start:disabled{opacity:.4;cursor:not-allowed;}
        .cp-start:not(:disabled):hover{background:#e85100;}

        .cp-back{display:none;background:rgba(255,255,255,.08);border:none;border-radius:10px;padding:7px 12px;color:white;font-weight:700;font-size:12px;cursor:pointer;font-family:'Manrope',system-ui,sans-serif;}

        @keyframes cp-blink{0%,80%,100%{opacity:.3}40%{opacity:1}}
        .cp-dot{display:inline-block;width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.6);margin:0 2px;animation:cp-blink 1.4s infinite;}
        .cp-dot:nth-child(2){animation-delay:.2s;}
        .cp-dot:nth-child(3){animation-delay:.4s;}
      `}</style>

      {/* Bottone apri */}
      <button className="cp-btn" onClick={() => { setIsOpen(true); setView("list"); }}>
        <span>💬</span><span>Chat</span>
        {totalUnread > 0 && <span className="cp-badge">{totalUnread > 99 ? "99+" : totalUnread}</span>}
      </button>

      {isOpen && (
        <div className="cp-overlay" onClick={e => { if (e.target === e.currentTarget) setIsOpen(false); }}>
          <div className="cp-panel">

            {/* ══ SIDEBAR ══ */}
            <aside className={`cp-sidebar${view === "list" ? " mv" : ""}`}>
              <div style={{ padding:"18px 14px 12px", borderBottom:"1px solid rgba(255,255,255,.07)", flexShrink:0 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                  <div>
                    <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".18em", color:"#ff5a00", margin:0, fontFamily:"'Manrope',system-ui,sans-serif" }}>Messaggi</p>
                    <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:"1.2rem", letterSpacing:"-.04em", color:"white", margin:"4px 0 0" }}>Chat</h2>
                  </div>
                  <button onClick={() => setIsOpen(false)} style={{ width:34, height:34, borderRadius:10, background:"rgba(255,255,255,.07)", border:"none", color:"white", fontSize:"1.2rem", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900 }}>×</button>
                </div>
                <button onClick={() => setShowNewChat(p => !p)} style={{
                  width:"100%", background: showNewChat ? "#ff5a00" : "rgba(255,255,255,.07)",
                  border:`1px solid ${showNewChat ? "#ff5a00" : "rgba(255,255,255,.1)"}`,
                  borderRadius:14, padding:"9px 14px", color:"white", fontSize:13, fontWeight:700,
                  cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif", textAlign:"left", transition:"all .2s",
                }}>
                  {showNewChat ? "✕ Annulla" : "+ Nuova conversazione"}
                </button>
              </div>

              {showNewChat && (
                <div style={{ margin:"10px 12px 0", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:18, padding:14, flexShrink:0 }}>
                  <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".12em", color:"rgba(255,255,255,.35)", marginBottom:10, fontFamily:"'Manrope',system-ui,sans-serif" }}>Scegli utente</p>
                  <select className="cp-select" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
                    <option value="">Seleziona...</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                  <button className="cp-start" disabled={!selectedUserId}
                    onClick={() => createOrOpenConversation({ participantUserId:Number(selectedUserId) })}>
                    Avvia chat →
                  </button>
                </div>
              )}

              <div className="cp-scroll" style={{ flex:1, overflowY:"auto", padding:"10px 10px 80px" }}>
                {conversations.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"48px 16px" }}>
                    <p style={{ fontSize:28, margin:"0 0 10px" }}>💬</p>
                    <p style={{ fontSize:13, color:"rgba(255,255,255,.3)", fontFamily:"'Manrope',system-ui,sans-serif", lineHeight:1.6 }}>Nessuna conversazione.</p>
                  </div>
                ) : conversations.map(c => (
                  <ConvItem key={c.id} conv={c} isActive={c.id === selectedConvId && view === "chat"}
                    onClick={() => handleSelectConv(c.id)}
                    myName={user?.name} onlineMap={onlineMap} usersMap={usersMap}
                  />
                ))}
              </div>
            </aside>

            {/* ══ CHAT ══ */}
            <section className={`cp-main${view === "chat" ? " mv" : ""}`}>

              {/* Header chat con foto + badge + stato */}
              <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,.07)", flexShrink:0, display:"flex", alignItems:"center", gap:10 }}>
                <button className="cp-back" onClick={() => setView("list")}>← Indietro</button>
                {selectedConv && otherName ? (
                  <>
                    <Avatar name={otherName} photo={otherUser?.photo} verified={otherUser?.verified} size={40} online={otherOnline} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:".95rem", color:"white", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", letterSpacing:"-.03em" }}>
                          {otherName}
                        </h3>
                        {otherUser?.verified && <VerifiedBadge size={14} />}
                      </div>
                      <p style={{ fontSize:11, margin:"2px 0 0", fontFamily:"'Manrope',system-ui,sans-serif", color: isOtherTyping ? "#ff5a00" : otherOnline ? "#22c55e" : "rgba(255,255,255,.35)", fontWeight:600, display:"flex", alignItems:"center", gap:4 }}>
                        {isOtherTyping ? (
                          <>
                            <span className="cp-dot" /><span className="cp-dot" /><span className="cp-dot" />
                            <span style={{ marginLeft:4 }}>sta scrivendo</span>
                          </>
                        ) : (
                          <>
                            {otherOnline && <span style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e", display:"inline-block" }} />}
                            {otherLastSeen ? formatLastSeen(otherLastSeen) : "Realtime · Live"}
                          </>
                        )}
                        {selectedConv.bookingId && <span style={{ marginLeft:8, color:"#ff5a00" }}>· Booking #{selectedConv.bookingId}</span>}
                      </p>
                    </div>
                  </>
                ) : (
                  <p style={{ color:"rgba(255,255,255,.3)", fontFamily:"'Manrope',system-ui,sans-serif", fontSize:13, flex:1 }}>Seleziona una conversazione</p>
                )}
                <button onClick={() => setIsOpen(false)} style={{ width:32, height:32, borderRadius:10, background:"rgba(255,255,255,.07)", border:"none", color:"white", fontSize:"1.1rem", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, flexShrink:0 }}>×</button>
              </div>

              {/* Messaggi */}
              <div className="cp-scroll" style={{ flex:1, overflowY:"auto", padding:"16px 14px" }}>
                {!selectedConvId ? (
                  <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10 }}>
                    <span style={{ fontSize:48 }}>💬</span>
                    <p style={{ color:"rgba(255,255,255,.3)", fontFamily:"'Manrope',system-ui,sans-serif", fontSize:13, textAlign:"center" }}>Seleziona o avvia una conversazione</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10 }}>
                    <span style={{ fontSize:48 }}>✉️</span>
                    <p style={{ color:"rgba(255,255,255,.3)", fontFamily:"'Manrope',system-ui,sans-serif", fontSize:13, textAlign:"center" }}>Nessun messaggio ancora.<br/>Scrivi il primo!</p>
                  </div>
                ) : (
                  <>
                    {messages.map(m => {
                      const sender = usersMap[m.senderId];
                      return (
                        <Bubble key={m.id} msg={m}
                          isMine={String(m.senderId) === String(user.id)}
                          senderPhoto={sender?.photo}
                          senderVerified={sender?.verified}
                        />
                      );
                    })}
                    {/* Sta scrivendo */}
                    {isOtherTyping && <TypingIndicator name={otherName} />}
                    {isSending && (
                      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:6 }}>
                        <div style={{ background:"rgba(255,90,0,.25)", borderRadius:"18px 18px 4px 18px", padding:"10px 14px" }}>
                          <span className="cp-dot"/><span className="cp-dot"/><span className="cp-dot"/>
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="cp-form" style={{ padding:"10px 14px 14px", borderTop:"1px solid rgba(255,255,255,.07)", display:"flex", gap:8, alignItems:"flex-end", flexShrink:0 }}>
                <textarea
                  ref={inputRef}
                  className="cp-input"
                  rows={1}
                  value={message}
                  onChange={handleInputChange}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
                  onBlur={() => broadcastTyping(false)}
                  placeholder={selectedConvId ? "Scrivi… (Invio per inviare)" : "Seleziona una conversazione"}
                  disabled={!selectedConvId}
                />
                <button className="cp-send" type="submit" disabled={!selectedConvId || !message.trim() || isSending}>
                  {isSending ? "…" : "↑"}
                </button>
              </form>
            </section>
          </div>
        </div>
      )}
    </>
  );
}