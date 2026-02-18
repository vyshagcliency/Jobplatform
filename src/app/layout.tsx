import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-fraunces",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Culture Hires — Fair Hiring for Tier-2 & Tier-3 Freshers",
  description:
    "A hiring platform for non-elite college freshers with AI matching, paid-only jobs, and direct employer connections.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${dmSans.variable} min-h-screen bg-[#faf7f2] text-[#1C1917] antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
