"use client";
export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="no-print"
      style={{ background:"#0a0a0b", color:"white", border:"none", borderRadius:100, padding:"10px 20px", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif" }}>
      🖨️ Stampa / Salva PDF
    </button>
  );
}