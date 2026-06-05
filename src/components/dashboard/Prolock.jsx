// src/components/dashboard/ProLock.jsx
// Componente riutilizzabile per bloccare feature PRO

"use client";

const ORANGE = "#ff5a00";
const INK = "#0a0a0b";

export default function ProLock({ feature = "questa funzionalità", children, plan, inline = false }) {
  const isPro = plan === "pro";
  if (isPro) return children ?? null;

  if (inline) {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        background: "rgba(255,90,0,.1)", border: "1px solid rgba(255,90,0,.2)",
        borderRadius: 100, padding: "2px 10px",
        fontSize: 11, fontWeight: 700, color: ORANGE,
        fontFamily: "'Manrope',system-ui,sans-serif", cursor: "default",
        whiteSpace: "nowrap",
      }}>
        🔒 PRO
      </span>
    );
  }

  return (
    <div style={{
      position: "relative", borderRadius: 18, overflow: "hidden",
      border: "1px solid rgba(255,90,0,.2)",
    }}>
      {/* Contenuto sfocato sotto */}
      <div style={{ filter: "blur(3px)", pointerEvents: "none", userSelect: "none", opacity: .4 }}>
        {children}
      </div>
      {/* Overlay lock */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, rgba(255,90,0,.06), rgba(10,10,11,.85))",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 10, padding: 20, textAlign: "center",
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "rgba(255,90,0,.15)", border: "1px solid rgba(255,90,0,.3)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>🔒</div>
        <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 14, color: "white", margin: 0, letterSpacing: "-.02em" }}>
          Funzione PRO
        </p>
        <p style={{ fontFamily: "'Manrope',system-ui,sans-serif", fontSize: 12, color: "rgba(255,255,255,.55)", margin: 0, maxWidth: 220, lineHeight: 1.5 }}>
          {feature} è disponibile nel piano Pro. Sarà attivabile a breve.
        </p>
        <div style={{
          marginTop: 4,
          background: ORANGE, color: "white", borderRadius: 100,
          padding: "8px 20px", fontSize: 12, fontWeight: 800,
          fontFamily: "'Manrope',system-ui,sans-serif",
          opacity: .85, cursor: "default",
        }}>
          🚀 Disponibile presto · €9/mese
        </div>
      </div>
    </div>
  );
}

// Badge inline semplice da affiancare a label
export function ProBadge() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      background: "rgba(255,90,0,.12)", border: "1px solid rgba(255,90,0,.25)",
      borderRadius: 100, padding: "1px 8px",
      fontSize: 10, fontWeight: 800, color: ORANGE,
      fontFamily: "'Manrope',system-ui,sans-serif",
      verticalAlign: "middle", marginLeft: 6,
    }}>
      PRO
    </span>
  );
}