import type { Metadata } from "next";
import { PWAInstaller } from "@/components/PWAInstaller";
import "./globals.css";

export const metadata: Metadata = {
  title: "Magnitude",
  description: "Adult mental arithmetic trainer",
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Magnitude",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PWAInstaller />
        {children}
      </body>
    </html>
  );
}
