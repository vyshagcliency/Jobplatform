import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
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
        className={`${jakarta.variable} min-h-screen bg-[#0C0E13] text-[#EDEAE4] antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
