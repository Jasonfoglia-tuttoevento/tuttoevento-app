import PWAInstaller from "@/components/PWAInstaller";

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
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" className={`...`}>
      <head>
        <meta name="theme-color" content="#ff5a00" />
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="TuttoEvento" />
      </head>
      <body className="...">
        {children}
        <GdprBanner />
        <PWAInstaller />
      </body>
    </html>
  );
}