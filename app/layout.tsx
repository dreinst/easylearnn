import type { Metadata, Viewport } from "next";
import { Fredoka, Quicksand, Geist_Mono } from "next/font/google";
import "./globals.css";
import RegisterSW from "@/components/RegisterSW";

const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"] });
const quicksand = Quicksand({ variable: "--font-quicksand", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "EasyLearnn", template: "%s | EasyLearnn" },
  description: "Ruang belajar modular event organizing untuk crew D'Production: 6 fase, 24 minggu, 23 topik.",
  manifest: "/manifest.json",
  icons: { icon: "/favicon.png", apple: "/icons/icon-192.png" },
  appleWebApp: { capable: true, title: "EasyLearnn", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${fredoka.variable} ${quicksand.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
