import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "🐋 PolyWhale - Whale Transaction Monitor",
  description: "Monitor whale transactions on Polymarket in real-time",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
