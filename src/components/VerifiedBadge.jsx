// src/components/VerifiedBadge.jsx
// Badge verificato stile Meta — usalo ovunque con <VerifiedBadge />

export default function VerifiedBadge({ size = 18, style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
      aria-label="Verificato"
    >
      {/* Sfondo blu */}
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
        fill="#1877F2"
      />
      {/* Spunta bianca */}
      <path
        d="M9.5 16.5L5.5 12.5L6.91 11.09L9.5 13.67L17.09 6.08L18.5 7.5L9.5 16.5Z"
        fill="white"
      />
    </svg>
  );
}