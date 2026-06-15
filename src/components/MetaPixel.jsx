"use client";
import { useEffect, useState } from "react";
import Script from "next/script";

export default function MetaPixel() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    // Carica solo se il consenso è stato dato
    const check = () => {
      const val = localStorage.getItem("te_cookie_consent");
      setConsented(val === "accepted");
    };
    check();
    window.addEventListener("te:cookie-consent", check);
    return () => window.removeEventListener("te:cookie-consent", check);
  }, []);

  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  // Non caricare se non c'è consenso O se il Pixel ID non è configurato
  if (!consented || !pixelId) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">{`
        !function(f,b,e,v,n,t,s){
          if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)
        }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init','${pixelId}');
        fbq('track','PageView');
      `}</Script>
    </>
  );
}