import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trade Connect",
  description: "Integrate NFT Swap Feature easily in you Solana Dapps",
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
