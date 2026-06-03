"use client";
export default function HomeMarquee() {
  const items = ["🎤 Artisti","🏛️ Locali","📣 Promoter","💬 Chat Realtime","📅 Booking","💶 Pagamenti Sicuri","📊 CRM","🎵 Marketplace","🔔 Notifiche Push","📈 Analitiche","🎪 Festival","🎹 DJ Set","🎸 Live Band","🎙️ Vocalist","🎷 Jazz","🥁 Percussionisti","🎻 Orchestra","🎺 Brass","🎤 Artisti","🏛️ Locali"];

  return (
    <>
      <style>{`
        .hm-root { background:#0a0a0b; border-top:1px solid rgba(255,255,255,.05); border-bottom:1px solid rgba(255,255,255,.05); padding:18px 0; overflow:hidden; }
        .hm-track { display:flex; gap:40px; width:max-content; animation:marquee 30s linear infinite; }
        .hm-root:hover .hm-track { animation-play-state:paused; }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .hm-item { display:flex; align-items:center; gap:10px; white-space:nowrap; color:rgba(255,255,255,.4); font-size:.875rem; font-weight:600; font-family:'Manrope',sans-serif; }
        .hm-dot { width:4px; height:4px; border-radius:50%; background:#ff5a00; flex-shrink:0; }
      `}</style>
      <div className="hm-root">
        <div className="hm-track">
          {[...items,...items].map((item, i) => (
            <div key={i} className="hm-item">
              <div className="hm-dot" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}