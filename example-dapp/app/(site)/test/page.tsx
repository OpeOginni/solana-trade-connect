"use client";
import AssetGallery from "@/components/AssetGallery";
import { useWallet } from "@solana/wallet-adapter-react";

export default function TestPage() {
  const { publicKey } = useWallet();

  if (!publicKey) return <div>Connect Wallet</div>;

  return (
    <div className="flex items-center justify-center h-screen">
      <AssetGallery publicKey={publicKey} />
    </div>
  );
}
