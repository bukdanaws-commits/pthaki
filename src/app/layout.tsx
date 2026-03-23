import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gathering PT HKI 2025 - Event Management System",
  description: "Event management system untuk Gathering PT Harapan Kita Indonesia 2025. Registrasi, Check-in, dan Food Claim dalam satu platform terintegrasi.",
  keywords: ["Event Management", "PT HKI", "Gathering", "Registration", "Check-in", "Food Claim"],
  authors: [{ name: "PT Harapan Kita Indonesia" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Gathering PT HKI 2025",
    description: "Event management system untuk Gathering PT Harapan Kita Indonesia 2025",
    url: "http://pthki.eventku.co.id",
    siteName: "Gathering PT HKI 2025",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
