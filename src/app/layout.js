import GdprBanner from "@/components/dashboard/GdprBanner";
import PWAInstaller from "@/components/PWAInstaller";
import MetaPixel from "@/components/MetaPixel";

export const metadata = {
  title: "TuttoEvento - Piattaforma Gestione Eventi",
  description: "CRM all-in-one per organizer, artisti e promoter.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "TuttoEvento" },
  icons: { apple: "/icons/icon-180x180.png" },
  openGraph: {
    title: "TuttoEvento — Il marketplace per artisti, locali e promoter",
    description: "Trova artisti per il tuo locale o fatti trovare dai locali giusti. Chat realtime, booking semplice, CRM completo. Gratis per iniziare.",
    url: "https://tuttoevento.it",
    siteName: "TuttoEvento",
    locale: "it_IT",
    type: "website",
    images: [{ url: "https://tuttoevento.it/og-image.jpg", width: 1200, height: 630, alt: "TuttoEvento" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TuttoEvento — Marketplace eventi dal vivo",
    description: "La piattaforma italiana per artisti, locali e promoter.",
    images: ["https://tuttoevento.it/og-image.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" style={{ margin: 0, padding: 0, overflowX: "hidden" }}>
      <head>
        {/* Font globali — Sora per titoli, Manrope per testi */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#ff5a00" />
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="TuttoEvento" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          html, body {
            margin: 0;
            padding: 0;
            overflow-x: hidden;
            width: 100%;
            max-width: 100vw;
            background: #0a0a0b;
          }
          body {
            font-family: 'Manrope', system-ui, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          h1, h2, h3, h4, h5, h6 {
            font-family: 'Sora', sans-serif;
            letter-spacing: -0.03em;
          }
          /* Animazioni scroll globali */
          @keyframes te-fade-up {
            from { opacity: 0; transform: translateY(28px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes te-fade-in {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes te-logo-glow {
            0%,100% { text-shadow: 0 0 0px rgba(255,90,0,0); }
            50%     { text-shadow: 0 0 24px rgba(255,90,0,0.5); }
          }
          .te-animate-up {
            opacity: 0;
            animation: te-fade-up 0.7s cubic-bezier(.4,0,.2,1) forwards;
          }
          .te-animate-in {
            opacity: 0;
            animation: te-fade-in 0.6s ease forwards;
          }
          .te-logo-animate {
            animation: te-logo-glow 3s ease-in-out infinite;
          }
          /* Delay utility */
          .te-d1 { animation-delay: .1s; }
          .te-d2 { animation-delay: .2s; }
          .te-d3 { animation-delay: .3s; }
          .te-d4 { animation-delay: .4s; }
          .te-d5 { animation-delay: .5s; }
          .te-d6 { animation-delay: .6s; }
          /* Reveal on scroll */
          .te-reveal {
            opacity: 0;
            transform: translateY(24px);
            transition: opacity 0.65s cubic-bezier(.4,0,.2,1), transform 0.65s cubic-bezier(.4,0,.2,1);
          }
          .te-reveal.visible {
            opacity: 1;
            transform: translateY(0);
          }
        `}</style>
        {/* Script per il reveal on scroll */}
        <script dangerouslySetInnerHTML={{ __html: `
          if (typeof window !== 'undefined') {
            document.addEventListener('DOMContentLoaded', function() {
              var els = document.querySelectorAll('.te-reveal');
              if (!els.length) return;
              var obs = new IntersectionObserver(function(entries) {
                entries.forEach(function(e) {
                  if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
                });
              }, { threshold: 0.12 });
              els.forEach(function(el) { obs.observe(el); });
            });
          }
        `}} />
      </head>
      <body>
        {children}
        <GdprBanner />
        <PWAInstaller />
        <MetaPixel />
      </body>
    </html>
  );
}