// src/app/landing-promoter/page.js
import LandingPromoter from "./LandingPromoter";

export const metadata = {
  title: "TuttoEvento per Promoter — Guadagna sulle tue relazioni",
  description: "Inserisci il tuo roster, monitora le trattative e incassa il 30% del margine su ogni booking confermato. Gratis per iniziare.",
};

export default function Page() {
  return <LandingPromoter />;
}