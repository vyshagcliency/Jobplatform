import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Underdog Jobs — Fair Hiring for Tier-2 & Tier-3 Freshers",
  description:
    "A marketplace for non-elite college students with AI onboarding, paid-only jobs, and direct chat.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-warm-50 text-gray-900 antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
