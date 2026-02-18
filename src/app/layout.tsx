import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
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
        className={`${syne.variable} ${dmSans.variable} min-h-screen bg-[#0C0E13] text-[#EDEAE4] antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
