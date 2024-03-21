"use client";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ConnectWalletButton = () => {
  const router = useRouter();

  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected, connecting } = useWallet();

  useEffect(() => {
    if (connected) {
      //   router.push("/dashboard");
      console.log("Connected");
      console.log(publicKey?.toString());
    }

    if (!connected && !connecting) {
      //   router.push("/");
      console.log("Not Connected");
    }
  }, [connecting, connected]);

  return (
    <div>
      <WalletMultiButton />
    </div>
  );
};

export default ConnectWalletButton;

// https://www.0xdev.co/how-to-connect-to-a-solana-wallet-to-your-react-app/
