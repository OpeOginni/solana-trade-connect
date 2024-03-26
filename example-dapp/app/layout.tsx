import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import SolanaWalletProvider from "@/providers/solanaWallet.provider";

// require("@solana/wallet-adapter-react-ui/styles.css");
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Example DAPP",
  description: "Example Trade-Connect DAPP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SolanaWalletProvider>
        <body className={inter.className}>{children}</body>
      </SolanaWalletProvider>
    </html>
  );
}
