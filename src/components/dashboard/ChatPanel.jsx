"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function ChatPanel({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef(null);
  const channelRef = useRef(null);

  const totalUnread = conversations.reduce((t, c) => t + Number(c.unreadCount || 0), 0);

  // ── Caricamento dati ──
  const loadUsers = useCallback(async () => {
    const res = await fetch("/api/chat/users");
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
  }, []);

  const loadConversations = useCallback(async () => {
    const res = await fetch("/api/chat/conversations");
    const data = await res.json();
    if (!Array.isArray(data)) return;
    setConversations(data);
    setSelectedConversationId(prev => prev || (data.length > 0 ? data[0].id : null));
  }, []);

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;
    const res = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
    const data = await res.json();
    setMessages(Array.isArray(data) ? data : []);
  }, []);

  const markAsRead = useCallback(async (conversationId) => {
    if (!conversationId) return;
    await fetch("/api/chat/conversations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId }),
    });
    loadConversations();
  }, [loadConversations]);

  // ── Supabase Realtime ──
  useEffect(() => {
    if (!user?.id) return;
    const supabase = createSupabaseBrowserClient();

    // Sottoscrive ai nuovi messaggi in tempo reale
    const channel = supabase
      .channel("chat-realtime")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
      }, (payload) => {
        const newMsg = payload.new;
        // Se il messaggio è nella conversazione aperta, aggiorna i messaggi
        if (Number(newMsg.conversation_id) === Number(selectedConversationId)) {
          setMessages(prev => {
            // Evita duplicati
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, {
              id: newMsg.id,
              conversationId: newMsg.conversation_id,
              senderId: newMsg.sender_id,
              body: newMsg.body,
              createdAt: newMsg.created_at,
              senderName: "",
              senderRole: "",
            }];
          });
          // Marca come letto se la chat è aperta
          if (isOpen) markAsRead(newMsg.conversation_id);
        }
        // Aggiorna sempre il contatore non letti
        loadConversations();
      })
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, selectedConversationId, isOpen, loadConversations, markAsRead]);

  // ── Init ──
  useEffect(() => {
    if (!user?.id) return;
    loadUsers();
    loadConversations();
  }, [user?.id, loadUsers, loadConversations]);

  // ── Cambia conversazione ──
  useEffect(() => {
    if (!selectedConversationId) return;
    loadMessages(selectedConversationId);
    if (isOpen) markAsRead(selectedConversationId);
  }, [selectedConversationId, isOpen, loadMessages, markAsRead]);

  // ── Evento apertura chat da altri componenti ──
  useEffect(() => {
    if (!user?.id) return;
    function handleOpenChat(event) {
      const detail = event.detail;
      if (!detail?.participantUserId) return;
      createOrOpenConversation({
        participantUserId: detail.participantUserId,
        bookingId: detail.bookingId || null,
        eventId: detail.eventId || null,
        title: detail.title || "Conversazione",
      });
    }
    function handleOpenChatButton() {
      setIsOpen(true);
      if (selectedConversationId) markAsRead(selectedConversationId);
    }
    window.addEventListener("tuttoevento:open-chat", handleOpenChat);
    window.addEventListener("tuttoevento:open-chat-button", handleOpenChatButton);
    return () => {
      window.removeEventListener("tuttoevento:open-chat", handleOpenChat);
      window.removeEventListener("tuttoevento:open-chat-button", handleOpenChatButton);
    };
  }, [user?.id, selectedConversationId, markAsRead]);

  // ── Scroll automatico ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function createOrOpenConversation({ participantUserId, bookingId = null, eventId = null, title = "Nuova conversazione" }) {
    const res = await fetch("/api/chat/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantUserId: Number(participantUserId), bookingId, eventId, title }),
    });
    const data = await res.json();
    if (!res.ok || !data.id) { alert("Errore apertura conversazione"); return; }
    setIsOpen(true);
    setSelectedConversationId(data.id);
    setSelectedUserId("");
    await loadConversations();
    await loadMessages(data.id);
    await markAsRead(data.id);
  }

  async function handleSelectConversation(conversationId) {
    setSelectedConversationId(conversationId);
    await loadMessages(conversationId);
    await markAsRead(conversationId);
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!selectedConversationId || !message.trim() || isSending) return;
    setIsSending(true);
    const text = message.trim();
    setMessage("");
    const res = await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: selectedConversationId, message: text }),
    });
    if (!res.ok) {
      setMessage(text);
      alert("Errore invio messaggio");
    }
    // Il Realtime aggiornerà i messaggi automaticamente
    setIsSending(false);
  }

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  return (
    <>
      <button type="button"
        onClick={() => { setIsOpen(true); if (selectedConversationId) markAsRead(selectedConversationId); }}
        className="hidden lg:block fixed bottom-6 right-6 z-40 bg-[#111] text-white rounded-full px-5 py-4 font-black shadow-lg hover:scale-[1.02] transition">
        <span className="relative inline-flex items-center gap-2">
          Chat
          {totalUnread > 0 && (
            <span className="absolute -top-7 -right-7 min-w-7 h-7 px-2 rounded-full bg-[#ff5a00] text-white text-xs flex items-center justify-center font-black border-2 border-white">
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex justify-end">
          <div className="w-full h-full bg-[#f5f5f6] shadow-2xl border-l border-black/10 grid grid-cols-1 md:grid-cols-[320px_1fr] md:max-w-[980px]">
            {/* Sidebar conversazioni */}
            <aside className="bg-white border-r border-black/5 p-4 md:p-5 flex flex-col min-h-0">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="min-w-0">
                  <p className="uppercase tracking-[3px] text-[#ff5a00] text-xs font-black mb-2">TuttoEvento</p>
                  <h2 className="text-2xl font-black tracking-[-0.04em]">Chat</h2>
                  <p className="text-sm text-black/45 mt-1">Conversazioni operative</p>
                </div>
                <button type="button" onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-2xl bg-[#f5f5f6] font-black shrink-0">×</button>
              </div>

              {/* Nuova chat */}
              <div className="rounded-3xl bg-[#f7f7f8] border border-black/5 p-4 mb-5">
                <p className="text-xs uppercase tracking-[2px] text-black/40 font-black mb-3">Nuova chat</p>
                <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}
                  className="w-full bg-white border border-black/10 rounded-2xl px-4 py-3 text-sm outline-none">
                  <option value="">Seleziona utente</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} · {u.role}</option>)}
                </select>
                <button type="button" disabled={!selectedUserId}
                  onClick={() => { const u = users.find(u => String(u.id) === String(selectedUserId)); createOrOpenConversation({ participantUserId: Number(selectedUserId), title: u ? `${user.name} · ${u.name}` : "Nuova conversazione" }); }}
                  className="w-full mt-3 bg-[#111] text-white rounded-2xl py-3 font-black text-sm disabled:opacity-40">
                  Avvia conversazione
                </button>
              </div>

              {/* Lista conversazioni */}
              <div className="flex-1 overflow-y-auto space-y-2 pb-24 md:pb-0">
                {conversations.length === 0 ? (
                  <p className="text-sm text-black/45">Nessuna conversazione ancora.</p>
                ) : conversations.map(c => {
                  const isActive = c.id === selectedConversationId;
                  const unread = Number(c.unreadCount || 0);
                  return (
                    <button key={c.id} type="button" onClick={() => handleSelectConversation(c.id)}
                      className={`relative w-full text-left rounded-3xl p-4 border transition ${isActive ? "bg-[#111] text-white border-[#111]" : unread > 0 ? "bg-[#fff7ed] text-black border-[#ff5a00]/30" : "bg-[#f7f7f8] text-black border-black/5 hover:bg-black/[0.04]"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-black text-sm">{c.title || "Conversazione"}</p>
                        {unread > 0 && <span className="min-w-6 h-6 px-2 rounded-full bg-[#ff5a00] text-white text-[11px] flex items-center justify-center font-black">{unread > 99 ? "99+" : unread}</span>}
                      </div>
                      <p className={`text-xs mt-2 line-clamp-2 ${isActive ? "text-white/60" : "text-black/45"}`}>{c.lastMessage || "Nessun messaggio ancora"}</p>
                      {c.bookingId && <p className={`text-[11px] mt-3 font-black uppercase tracking-[2px] ${isActive ? "text-white/35" : "text-[#ff5a00]"}`}>Booking collegato</p>}
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Area messaggi */}
            <section className="hidden md:flex flex-col min-h-0">
              <div className="bg-white border-b border-black/5 p-5">
                <p className="text-xs uppercase tracking-[2px] text-black/40 font-black">Conversazione</p>
                <h3 className="text-xl font-black tracking-[-0.03em] mt-1">{selectedConversation?.title || "Seleziona una conversazione"}</h3>
                {selectedConversation?.bookingId && <p className="text-sm text-[#ff5a00] font-black mt-2">Chat collegata al booking #{selectedConversation.bookingId}</p>}
                {/* Indicatore Realtime */}
                <p className="text-[10px] text-green-600 font-bold mt-1">● Live</p>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {!selectedConversationId ? (
                  <div className="h-full flex items-center justify-center"><p className="text-black/45 font-bold">Avvia o seleziona una chat.</p></div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center"><p className="text-black/45 font-bold">Nessun messaggio. Scrivi il primo.</p></div>
                ) : messages.map(item => {
                  const isMine = String(item.senderId) === String(user.id);
                  return (
                    <div key={item.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-[24px] px-4 py-3 ${isMine ? "bg-[#111] text-white" : "bg-white border border-black/5 text-black"}`}>
                        {!isMine && <p className="text-xs font-black text-[#ff5a00] mb-1">{item.senderName || "Utente"}</p>}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.body}</p>
                        <p className={`text-[11px] mt-2 ${isMine ? "text-white/45" : "text-black/35"}`}>
                          {new Date(item.createdAt).toLocaleString("it-IT", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={sendMessage} className="bg-white border-t border-black/5 p-4 flex gap-3">
                <input value={message} onChange={e => setMessage(e.target.value)}
                  placeholder={selectedConversationId ? "Scrivi un messaggio..." : "Seleziona una conversazione"}
                  disabled={!selectedConversationId}
                  className="flex-1 bg-[#f7f7f8] border border-black/10 rounded-2xl px-4 py-3 outline-none disabled:opacity-50" />
                <button disabled={!selectedConversationId || !message.trim() || isSending}
                  className="bg-[#ff5a00] text-white rounded-2xl px-5 font-black disabled:opacity-40">
                  {isSending ? "..." : "Invia"}
                </button>
              </form>
            </section>
          </div>
        </div>
      )}
    </>
  );
}