import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GdprBanner from "@/components/GdprBanner";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "TuttoEvento - Piattaforma Gestione Eventi",
  description: "CRM all-in-one per organizer, artisti e promoter.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f5f5f6]">
        {children}
        <GdprBanner />
      </body>
    </html>
  );
}