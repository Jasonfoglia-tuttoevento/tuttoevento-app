"use client";
import { useState, useRef, useEffect } from "react";

// Il system prompt è gestito lato server

const QUICK_REPLIES = [
  "Come mi registro?",
  "Come funziona per i locali?",
  "È gratis?",
  "Come vengono gestiti i prezzi?",
];

export default function HomeChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Ciao! 👋 Sono l'assistente di TuttoEvento. Come posso aiutarti?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setShowQuick(false);
    const newMessages = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat-public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (res.status === 429) {
        const reply = data.error || "Troppi messaggi. Riprova tra un po'!";
        setMessages(prev => [...prev, { role: "assistant", content: reply }]);
        setLoading(false);
        return;
      }
      const reply = data.reply || "Mi dispiace, non ho capito. Riprova!";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Ops, c'è stato un errore. Riprova tra poco o scrivi a info@tuttoevento.it 😊" }]);
    }
    setLoading(false);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap');
        .hcb-btn { position:fixed; bottom:24px; left:24px; z-index:200; width:56px; height:56px; border-radius:50%; background:#ff5a00; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 30px rgba(255,90,0,.5); transition:all .2s; }
        .hcb-btn:hover { transform:scale(1.08); }
        .hcb-btn svg { color:#fff; }
        .hcb-notif { position:absolute; top:-4px; right:-4px; width:16px; height:16px; border-radius:50%; background:#16a34a; border:2px solid #0a0a0b; animation:hcb-pulse 2s infinite; }
        @keyframes hcb-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
        .hcb-window { position:fixed; bottom:92px; left:24px; z-index:200; width:360px; max-width:calc(100vw - 32px); background:#0a0a0b; border:1px solid rgba(255,255,255,.1); border-radius:24px; overflow:hidden; box-shadow:0 30px 80px rgba(0,0,0,.7); display:flex; flex-direction:column; max-height:520px; font-family:'Manrope',sans-serif; transform-origin:bottom left; animation:hcb-open .25s cubic-bezier(.4,0,.2,1); }
        @keyframes hcb-open { from{opacity:0;transform:scale(.9) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .hcb-header { background:#ff5a00; padding:16px 18px; display:flex; align-items:center; justify-content:space-between; }
        .hcb-header-left { display:flex; align-items:center; gap:10px; }
        .hcb-avatar { width:36px; height:36px; border-radius:50%; background:rgba(255,255,255,.2); display:flex; align-items:center; justify-content:center; font-size:1.1rem; }
        .hcb-header-info p:first-child { font-weight:800; font-size:.9rem; color:#fff; }
        .hcb-header-info p:last-child { font-size:.72rem; color:rgba(255,255,255,.7); }
        .hcb-close { background:rgba(255,255,255,.15); border:none; border-radius:8px; width:28px; height:28px; cursor:pointer; color:#fff; font-size:1rem; display:flex; align-items:center; justify-content:center; }
        .hcb-msgs { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px; }
        .hcb-msg { max-width:85%; }
        .hcb-msg.user { align-self:flex-end; }
        .hcb-msg.assistant { align-self:flex-start; }
        .hcb-bubble { padding:10px 14px; border-radius:18px; font-size:.85rem; line-height:1.5; }
        .hcb-msg.user .hcb-bubble { background:#ff5a00; color:#fff; border-radius:18px 18px 4px 18px; }
        .hcb-msg.assistant .hcb-bubble { background:rgba(255,255,255,.07); color:rgba(255,255,255,.85); border-radius:18px 18px 18px 4px; }
        .hcb-typing { display:flex; gap:4px; padding:12px 14px; }
        .hcb-typing span { width:7px; height:7px; border-radius:50%; background:rgba(255,255,255,.4); animation:hcb-type .8s infinite; }
        .hcb-typing span:nth-child(2){animation-delay:.15s}
        .hcb-typing span:nth-child(3){animation-delay:.3s}
        @keyframes hcb-type { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        .hcb-quick { padding:0 16px 10px; display:flex; gap:6px; flex-wrap:wrap; }
        .hcb-quick-btn { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1); border-radius:100px; padding:5px 12px; font-size:.75rem; font-weight:700; color:rgba(255,255,255,.7); cursor:pointer; font-family:'Manrope',sans-serif; transition:all .2s; white-space:nowrap; }
        .hcb-quick-btn:hover { background:rgba(255,90,0,.15); border-color:rgba(255,90,0,.3); color:#ff5a00; }
        .hcb-input-wrap { border-top:1px solid rgba(255,255,255,.07); padding:12px 14px; display:flex; gap:8px; }
        .hcb-input { flex:1; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1); border-radius:12px; padding:9px 13px; color:#fff; font-size:.85rem; outline:none; font-family:'Manrope',sans-serif; }
        .hcb-input::placeholder { color:rgba(255,255,255,.3); }
        .hcb-input:focus { border-color:rgba(255,90,0,.4); }
        .hcb-send { width:36px; height:36px; background:#ff5a00; border:none; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all .2s; }
        .hcb-send:hover { background:#e85100; }
        .hcb-send:disabled { opacity:.4; cursor:not-allowed; }
      `}</style>

      {/* Bottone floating */}
      <button className="hcb-btn" onClick={() => setOpen(!open)} aria-label="Apri chat assistente">
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        )}
        {!open && <div className="hcb-notif" />}
      </button>

      {/* Finestra chat */}
      {open && (
        <div className="hcb-window">
          <div className="hcb-header">
            <div className="hcb-header-left">
              <div className="hcb-avatar">🎤</div>
              <div className="hcb-header-info">
                <p>Assistente TuttoEvento</p>
                <p>● Online — rispondo subito</p>
              </div>
            </div>
            <button className="hcb-close" onClick={() => setOpen(false)}>×</button>
          </div>

          <div className="hcb-msgs">
            {messages.map((m, i) => (
              <div key={i} className={`hcb-msg ${m.role}`}>
                <div className="hcb-bubble">{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="hcb-msg assistant">
                <div className="hcb-bubble hcb-typing">
                  <span/><span/><span/>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {showQuick && (
            <div className="hcb-quick">
              {QUICK_REPLIES.map(q => (
                <button key={q} className="hcb-quick-btn" onClick={() => send(q)}>{q}</button>
              ))}
            </div>
          )}

          <div className="hcb-input-wrap">
            <input className="hcb-input" placeholder="Scrivi un messaggio..."
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()} />
            <button className="hcb-send" onClick={() => send()} disabled={loading || !input.trim()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}