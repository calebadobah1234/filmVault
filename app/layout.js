import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Oswald } from "next/font/google";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";

const oswald = Oswald({ subsets: ["latin"] });

export const metadata = {
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={oswald.className}>
      {/* <GoogleAnalytics GA_MEASUREMENT_ID="G-XRQ23BL3CB" /> */}

      <body className="text-black">
        <GoogleAnalytics gaId={"G-G5F92NBCCE"} />
        <Analytics />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
