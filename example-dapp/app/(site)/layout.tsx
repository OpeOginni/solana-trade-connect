"use client";
import { useRouter } from "next/navigation";

import MainHeader from "@/components/MainHeader";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import { getWebsocketJWT } from "@/actions";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { publicKey, sendTransaction, connected, connecting } = useWallet();
  const router = useRouter();

  useEffect(() => {
    async function checkConnectedWallet() {
      if (!connected || !publicKey) {
        router.push("/");
        console.log("Not Connected");
        return;
      }

      // await getWebsocketJWT(publicKey.toBase58()!);
    }
    checkConnectedWallet();
  }, [connected]);

  return (
    <main>
      <MainHeader />

      {children}
    </main>
  );
}
