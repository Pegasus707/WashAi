import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WashAI | Premium Laundry POS",
    template: "%s | WashAI"
  },
  description: "Enterprise-grade AI-powered Laundry Point of Sale management system for modern businesses.",
  keywords: ["Laundry POS", "WashAI", "Laundry Management", "AI POS", "SaaS", "Wash & Fold Software"],
  authors: [{ name: "WashAI Team" }],
  creator: "WashAI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://wash-ai.vercel.app/",
    title: "WashAI | Premium Laundry POS",
    description: "Enterprise-grade AI-powered Laundry Point of Sale management system.",
    siteName: "WashAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "WashAI | Premium Laundry POS",
    description: "Enterprise-grade AI-powered Laundry Point of Sale management system.",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WashAI",
  },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="flex h-screen overflow-hidden bg-background text-foreground">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden relative">
          {/* Subtle background glow effect */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
          
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 z-10">
            <div className="mx-auto max-w-6xl w-full h-full">
              {children}
            </div>
          </main>
        </div>
        <Toaster theme="dark" position="top-center" className="font-sans" expand={false} richColors />
      </body>
    </html>
  );
}
