import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Roboto } from "next/font/google";

const font = Roboto({ subsets: ["latin"], weight: ["400"] });

export const metadata = {
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={font.className}>
      <body>
        <Navbar />

        {children}
        <Footer />
      </body>
    </html>
  );
}
