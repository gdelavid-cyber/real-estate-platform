import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Your Personal Real Estate",
  description:
    "Autonomous AI real estate system: cinematic listing films, an AI marketing team, a buyer scraping swarm, and live seller-vault call transfers.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Cabinet Grotesk + Satoshi via Fontshare */}
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@700,800&f[]=satoshi@400,500,700&display=swap"
        />
        {/* Cursive brand wordmark */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Italianno&family=Great+Vibes&display=swap"
        />
      </head>
      <body className="bg-[#FDFCF9] text-[#1A1A1A] antialiased selection:bg-[#D4AF37]/25 selection:text-[#1A1A1A]">
        {children}
      </body>
    </html>
  );
}
