"use client";
import { getNFTFromMint } from "@/actions";
import { cn } from "@/lib/utils";
import { NewMessageDto } from "@/types/websocket.types";
import { DigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import { ArrowLeftRight } from "lucide-react";
import { useEffect, useState } from "react";
import NFTImage from "./NftImage";

export default function MessageBox({
  message,
  userAddress,
}: {
  message: NewMessageDto;
  userAddress?: string;
}) {
  const [creatorAsset, setCreatorAsset] = useState<DigitalAsset | null>(null);
  const [recieverAsset, setRecieverAsset] = useState<DigitalAsset | null>(null);

  useEffect(() => {
    async function getAssets() {
      const creatorAsset = await getNFTFromMint(
        message.tradeDetails?.tradeCreatorSwapItems[0]!
      );
      const recieverAsset = await getNFTFromMint(
        message.tradeDetails?.tradeRecipientSwapItems[0]!
      );
      setCreatorAsset(creatorAsset!);
      setRecieverAsset(recieverAsset!);
    }
    getAssets();
  }, []);

  if (message.isTrade) {
    return (
      <div
        className={cn(
          "flex w-auto ",
          message.fromAddress === userAddress ? "justify-end" : "justify-start"
        )}
      >
        <div
          className={cn(
            "p-2 rounded-lg my-2",
            message.fromAddress === userAddress
              ? "bg-green-500 text-white self-start"
              : "bg-blue-500 text-white self-start"
          )}
        >
          <div className="flex flex-col gap-2">
            <NFTImage uri={creatorAsset?.metadata.uri!} />
            <ArrowLeftRight />
            <NFTImage uri={recieverAsset?.metadata.uri!} />
          </div>
          {message.tradeDetails?.status}
        </div>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex w-auto ",
        message.fromAddress === userAddress ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "p-2 rounded-lg my-2",
          message.fromAddress === userAddress
            ? "bg-green-500 text-white self-start"
            : "bg-blue-500 text-white self-start"
        )}
      >
        <p>{message.message}</p>
      </div>
    </div>
  );
}
