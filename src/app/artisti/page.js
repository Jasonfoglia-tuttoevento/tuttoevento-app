import ArtistLandingClient from "./ArtistLandingClient";

export const metadata = {
  title: "Registrati come Artista su TuttoEvento - Trova Serate e Ingaggi",
  description: "Crea il tuo profilo artista gratis su TuttoEvento. Trova ingaggi per concerti, DJ set ed eventi. Ricevi pagamenti protetti e sicuri prima di salire sul palco.",
  keywords: ["artista", "booking musicisti", "trovare date dj", "concerti", "ingaggi eventi", "tuttoevento"],
  openGraph: {
    title: "Registrati come Artista su TuttoEvento - Trova Serate e Ingaggi",
    description: "Crea il tuo profilo artista gratis su TuttoEvento. Trova ingaggi per concerti, DJ set ed eventi. Ricevi pagamenti protetti e sicuri prima di salire sul palco.",
    type: "website",
    locale: "it_IT",
    url: "https://tuttoevento.it/artisti",
  }
};

export default function ArtistLandingPage() {
  return <ArtistLandingClient />;
}
