import type { Metadata } from "next";
import { Caveat, Playfair_Display, Special_Elite } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

const specialElite = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-special-elite",
});

export const metadata: Metadata = {
  title: "dear diary ♡",
  description: "A cozy vintage typewriter journal — intimate, beautiful, and entirely yours.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${caveat.variable} ${specialElite.variable}`}>
      <body>{children}</body>
    </html>
  );
}