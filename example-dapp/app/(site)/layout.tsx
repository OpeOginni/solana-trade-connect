"use client";
import { useRouter } from "next/navigation";

import MainHeader from "@/components/MainHeader";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { publicKey, sendTransaction, connected, connecting } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!connected) {
      router.push("/");
      console.log("Not Connected");
    }
  }, [connected]);

  return (
    <main>
      <MainHeader />

      {children}
    </main>
  );
}
