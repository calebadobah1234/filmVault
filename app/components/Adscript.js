"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AdScript() {
  const pathname = usePathname();

  useEffect(() => {
    // Reinitialize the ad on route change
    if (window.adsbygoogle) {
      try {
        // Clear the existing container
        const container = document.getElementById(
          "container-a2ec5d29f1060455d67da23054ccb38b"
        );
        if (container) {
          container.innerHTML = "";
        }

        // Reinvoke the ad script
        const script = document.createElement("script");
        script.src =
          "//pl25046019.profitablecpmrate.com/a2ec5d29f1060455d67da23054ccb38b/invoke.js";
        script.async = true;
        script.setAttribute("data-cfasync", "false");
        document.body.appendChild(script);
      } catch (error) {
        console.error("Error reinitializing ad:", error);
      }
    }
  }, [pathname]); // Re-run when the path changes

  return (
    <>
      <Script
        src="//pl25046019.profitablecpmrate.com/a2ec5d29f1060455d67da23054ccb38b/invoke.js"
        data-cfasync="false"
        async
        strategy="afterInteractive"
      />
      <div id="container-a2ec5d29f1060455d67da23054ccb38b"></div>
    </>
  );
}
