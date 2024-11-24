"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function AdScript() {
  const pathname = usePathname();
  const initialized = useRef(false);
  const containerId = "container-a2ec5d29f1060455d67da23054ccb38b";
  const adScriptUrl =
    "//pl25046019.profitablecpmrate.com/a2ec5d29f1060455d67da23054ccb38b/invoke.js";

  const initializeAd = () => {
    // Clear existing container
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = "";
    }

    // Remove any existing ad scripts to prevent duplicates
    const existingScripts = document.querySelectorAll(
      `script[src="${adScriptUrl}"]`
    );
    existingScripts.forEach((script) => script.remove());

    // Create and append new script
    const script = document.createElement("script");
    script.src = adScriptUrl;
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    document.body.appendChild(script);

    // Track initialization
    initialized.current = true;
  };

  useEffect(() => {
    // Cleanup function to remove script on unmount
    return () => {
      const existingScripts = document.querySelectorAll(
        `script[src="${adScriptUrl}"]`
      );
      existingScripts.forEach((script) => script.remove());
      initialized.current = false;
    };
  }, []);

  useEffect(() => {
    // Wait a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeAd();
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <Script
        src={adScriptUrl}
        data-cfasync="false"
        async
        strategy="afterInteractive"
        onLoad={() => {
          if (!initialized.current) {
            initializeAd();
          }
        }}
      />
      <div id={containerId}></div>
    </>
  );
}
