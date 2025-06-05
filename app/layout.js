import "./globals.css";
import Navbar from "./components/NavbarWrapper";
import Footer from "./components/Footer";
import { Oswald } from "next/font/google";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import MobileNav from "./components/MobileNav";
import 'video.js/dist/video-js.css';
import GlobalPopunderScript from "./components/GlobalPopUnderScript.js";
import BookmarkPrompt from "./components/Bookmarkprompt";

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
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"></meta>
      <meta name="apple-mobile-web-app-capable" content="yes"></meta>
      <body className="text-black overflow-x-hidden">
        <GoogleAnalytics gaId={"G-G5F92NBCCE"} />
        <Analytics />
        
        {/* Global Popunder Script */}
        {/* <GlobalPopunderScript directLinkUrl="https://attendedlickhorizontally.com/jth75j6j5?key=1cc239cea6ecf5e6b20d0a992ab044c4" /> */}
        
        <Navbar />
        {children}
        <BookmarkPrompt />
        <Footer />
      </body>
    </html>
  );
}