"use client";

import dynamic from "next/dynamic";
import HomeNav from "@/components/home/HomeNav";
import HomeHero from "@/components/home/HomeHero";
import HomeMarquee from "@/components/home/HomeMarquee";

// Lazy load tutto below-the-fold — ssr:false ok nei Client Components
const HomeForWho = dynamic(() => import("@/components/home/HomeForWho"));
const HomeStats = dynamic(() => import("@/components/home/HomeStats"));
const HomeFeatures = dynamic(() => import("@/components/home/HomeFeatures"));
const HomeHowItWorks = dynamic(() => import("@/components/home/HomeHowItWorks"));
const HomeMarketplace = dynamic(() => import("@/components/home/HomeMarketplace"));
const HomePricing = dynamic(() => import("@/components/home/HomePricing"));
const HomeTestimonials = dynamic(() => import("@/components/home/HomeTestimonials"));
const HomeFAQ = dynamic(() => import("@/components/home/HomeFAQ"));
const HomeCTA = dynamic(() => import("@/components/home/HomeCTA"));
const HomeFooter = dynamic(() => import("@/components/home/HomeFooter"));
const HomeChatbot = dynamic(() => import("@/components/home/HomeChatbot"));

export default function HomePageClient() {
  return (
    <main style={{ background: "#0a0a0b", minHeight: "100vh" }}>
      <HomeNav />
      <HomeHero />
      <HomeMarquee />
      <HomeForWho />
      <HomeStats />
      <HomeFeatures />
      <HomeHowItWorks />
      <HomeMarketplace />
      <HomePricing />
      <HomeTestimonials />
      <HomeFAQ />
      <HomeCTA />
      <HomeFooter />
      <HomeChatbot />
    </main>
  );
}