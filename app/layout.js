import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Oswald } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";

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
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-G5F92NBCCE"
        ></Script>
        <Script id="google-analytics">
          {`window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-G5F92NBCCE');`}
        </Script>
      </head>
      <body className="text-black">
        {/* <GoogleAnalytics gaId={"G-G5F92NBCCE"} /> */}
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
