"use client";

import Script from "next/script";
import { pageView } from "./gtagHelper";
import { useSearchParams, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function GoogleAnalytics() {
  const pathName = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    const url = pathName + searchParams.toString();
    pageView("G-XRQ23BL3CB", url);
  }, [pathName, searchParams]);

  return (
    <>
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-XRQ23BL3CB"
      ></Script>
      <Script id="anal">
        {`
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-XRQ23BL3CB');`}
      </Script>
    </>
  );
}
