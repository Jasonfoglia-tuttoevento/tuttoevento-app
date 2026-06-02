import LocaliLandingClient from "./LocaliLandingClient";

export const metadata = {
  title: "Trova artisti per il tuo locale | TuttoEvento",
  description:
    "Trova DJ, band, cantanti e performer per locali, eventi privati, ristoranti, hotel e serate live con TuttoEvento.",
};

export default function LocaliPage() {
  return <LocaliLandingClient />;
}