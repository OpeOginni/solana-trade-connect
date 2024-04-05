"use client";

import { getUserNFTs } from "@/actions";
import { DigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import { PublicKey } from "@solana/web3.js";
import { Ghost } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import NFTImage from "./NftImage";

export default function AssetGallery({ publicKey }: { publicKey: PublicKey }) {
  const [assets, setAssets] = useState<DigitalAsset[]>([]);
  useEffect(() => {
    async function getAssets() {
      try {
        const _asset = await getUserNFTs(publicKey.toBase58()!);
        console.log("_asset");

        console.log(_asset);
        setAssets(_asset!);
      } catch (err) {
        console.log(err);
      }
    }
    getAssets();
  }, [publicKey]);

  if (assets.length === 0)
    return (
      <div className="flex flex-col items-center justify-center">
        <Ghost />
        <p>No Asset Found</p>
      </div>
    );

  return (
    <div className="grid grid-cols-5 gap-4 p-3 mx-40">
      {assets.map((asset) => (
        <div key={asset.metadata.mint} className="flex flex-col items-center justify-center text-center">
          <NFTImage uri={asset.metadata.uri} />
          <p className="text-sm">{asset.metadata.name}</p>
        </div>
      ))}
    </div>
  );
}
