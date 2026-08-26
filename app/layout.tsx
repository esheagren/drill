import type { Metadata, Viewport } from "next";
import { PWAInstaller } from "@/components/PWAInstaller";
import "./globals.css";

export const metadata: Metadata = {
  title: "Magnitude",
  description: "Adult mental arithmetic trainer",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Magnitude",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
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
