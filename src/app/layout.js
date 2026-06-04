import GdprBanner from "@/components/dashboard/GdprBanner";
import PWAInstaller from "@/components/PWAInstaller";
import MetaPixel from "@/components/MetaPixel";

export const metadata = {
  title: "TuttoEvento - Piattaforma Gestione Eventi",
  description: "CRM all-in-one per organizer, artisti e promoter.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TuttoEvento",
  },
  icons: {
    apple: "/icons/icon-180x180.png",
  },
  openGraph: {
    title: "TuttoEvento — Il marketplace per artisti, locali e promoter",
    description: "Trova artisti per il tuo locale o fatti trovare dai locali giusti. Chat realtime, booking semplice, CRM completo. Gratis per iniziare.",
    url: "https://tuttoevento.it",
    siteName: "TuttoEvento",
    locale: "it_IT",
    type: "website",
    images: [
      {
        url: "https://tuttoevento.it/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TuttoEvento — Marketplace eventi dal vivo",
      },
    ],
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
    <html lang="it">
      <head>
        <meta name="theme-color" content="#ff5a00" />
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="TuttoEvento" />
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