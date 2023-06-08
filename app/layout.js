import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Roboto } from "next/font/google";
import GoogleAnalytics from "./components/GoogleAnalytics";

const font = Roboto({ subsets: ["latin"], weight: ["400"] });

export const metadata = {
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={font.className}>
      <GoogleAnalytics GA_MEASUREMENT_ID="G-XRQ23BL3CB" />
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
