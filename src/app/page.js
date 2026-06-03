import HomePageClient from "@/components/home/HomePageClient";

export const metadata = {
  title: "TuttoEvento — Il marketplace per artisti, locali e promoter",
  description: "Trova artisti per il tuo locale o fatti trovare dai locali giusti. Chat realtime, booking semplice, CRM completo. Gratis per iniziare.",
  keywords: "artisti locali booking eventi dal vivo marketplace italiano promoter",
  openGraph: {
    title: "TuttoEvento — Marketplace eventi dal vivo",
    description: "La piattaforma italiana per artisti, locali e promoter.",
    url: "https://tuttoevento.it",
    siteName: "TuttoEvento",
    locale: "it_IT",
    type: "website",
  },
};

export default function HomePage() {
  return <HomePageClient />;
}