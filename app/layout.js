import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Oswald } from "next/font/google";
import GoogleAnalytics from "./components/GoogleAnalytics";
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
        <meta
          name="google-site-verification"
          content="ps810KLeW7uFSzGswdYtO8_kuYPF9W2f-WMO5NhnrZg"
        />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-XRQ23BL3CB"
        ></Script>
        <Script id="anal2" strategy="beforeInteractive">
          {`
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-XRQ23BL3CB');`}
        </Script>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9077918501356115"
          crossorigin="anonymous"
          strategy="beforeInteractive"
        ></Script>
      </head>
      <body className="text-black">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
