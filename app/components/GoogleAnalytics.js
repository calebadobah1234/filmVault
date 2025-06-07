"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/router";

const GoogleAnalytics = ({ gaId }) => {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      window.gtag("config", gaId, {
        page_path: url,
      });
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [gaId, router.events]);

  useEffect(() => {
    window.gtag =
      window.gtag ||
      function () {
        window.dataLayer.push(arguments);
      };
    window.dataLayer = window.dataLayer || [];
    window.gtag("js", new Date());
    window.gtag("config", gaId);
  }, [gaId]);

  return null;
};

export default GoogleAnalytics;
