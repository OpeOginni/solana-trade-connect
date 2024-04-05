"use client";
import { NewMessageDto, getUserChat, getUserNFTs } from "@/actions";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import MessageBox from "@/components/MessageBox";
import useSocket from "@/providers/socket.provider";
import { useSocketContext } from "@/providers/useSocketContext";
import NFTBox from "@/components/NftBox";
import { DigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import NFTImage from "@/components/NftImage";
import { Ghost } from "lucide-react";
import { TransactionChannelDto } from "@/types/websocket.types";
import base58 from "bs58";
import { Transaction } from "@solana/web3.js";

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID as string;

const USER_NEW_MESSAGE_CHANNEL = (companyId: string, userAddress: string) => `chat:new-message:${companyId}:${userAddress}`;
const USER_TRANSACTION_CHANNEL = (companyId: string, userAddress: string) => `transaction:new:${companyId}:${userAddress}`;

export default function ChatSessionPage() {
  const params = useParams<{ userAddress: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { publicKey, signTransaction } = useWallet();

  const socket = useSocketContext();

  const [messages, setMessages] = useState<NewMessageDto[]>([]);
  const [message, setMessage] = useState("");

  const [myAssets, setMyAssets] = useState<DigitalAsset[]>([]);
  const [otherUserAssets, setOtherUserAssets] = useState<DigitalAsset[]>([]);

  const [myNFTBox, setMyNFTBox] = useState<{ index: number; label: string }[]>([]);
  const [otherNFTBox, setOtherNFTBox] = useState<{ index: number; label: string }[]>([]);

  useEffect(() => {
    async function getAssets() {
      try {
        const _asset = await getUserNFTs(publicKey?.toBase58()!);

        setMyAssets(_asset!);

        const _otherUserAssets = await getUserNFTs(params.userAddress);

        setOtherUserAssets(_otherUserAssets!);
      } catch (err) {
        console.log(err);
      }
    }
    getAssets();
  }, [publicKey, params.userAddress]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    console.log("Sent Message");
    if (message.trim() !== "") {
      socket?.emit(
        "new_message",
        { message: message, toAddress: params.userAddress, fromAddress: publicKey?.toBase58() },
        (returnedMessage: { message: string; fromAddress: string; toAddress: string; timestamp: string }) => {
          console.log(returnedMessage);
          setMessages((prevMessages) => [...prevMessages, returnedMessage]);
        }
      );
      setMessage("");
    }
  };

  const toggleNFTs = () => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("suggestNFTs") == null) {
      searchParams.set("suggestNFTs", "true");
    } else {
      searchParams.delete("suggestNFTs");
    }
    router.push(`${window.location.pathname}?${searchParams.toString()}`);
  };

  useEffect(() => {
    async function getChat() {
      try {
        const response = await getUserChat(publicKey?.toBase58()!, params.userAddress);

        if (!response) throw new Error("No response");

        setMessages(response.chats);
      } catch (err) {
        console.log(err);
      }
    }
    getChat();
  }, [params.userAddress]);

  useEffect(() => {
    if (!signTransaction) return;
    const channel = USER_NEW_MESSAGE_CHANNEL(COMPANY_ID, publicKey?.toBase58()!);

    const transactionChannel = USER_TRANSACTION_CHANNEL(COMPANY_ID, publicKey?.toBase58()!);

    socket?.on(transactionChannel, async (dto: TransactionChannelDto) => {
      const transaction = Transaction.from(base58.decode(dto.serializedTransaction));

      const signature = await signTransaction(transaction);
      console.log(signature);
    });

    socket?.on(channel, (messageObject: NewMessageDto) => {
      console.log("RECIVED MESSAGE");

      if (messageObject.fromAddress === params.userAddress) setMessages((prevMessages) => [...prevMessages, messageObject]);
    });
  }, [publicKey, socket]);

  return (
    <div className="flex h-[80vh]">
      {/* Left column for chat window */}
      <div className="w-1/3 p-4 border-r">
        {/* Chat window content */}
        <ScrollArea className="h-full border rounded-lg overflow-y-auto">
          {messages.map((message) => (
            <MessageBox key={message.message} message={message} userAddress={publicKey?.toBase58()!} />
          ))}
        </ScrollArea>
        {/* Message input form */}
        <form className="pt-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Type your message..."
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
            Send
          </button>
        </form>
      </div>
      <div className="grid grid-cols-2 p-4 w-2/3">
        <ScrollArea className="border border-black col-span-1 w-full ">
          <div id="your-trades" className="grid grid-cols-4 gap-4 p-3"></div>
        </ScrollArea>
        <ScrollArea className="border border-black col-span-1 w-full">
          <div id="other-user-trades" className="grid grid-cols-4 gap-4 p-3"></div>
        </ScrollArea>

        <ScrollArea className="border border-black col-span-2 w-full">
          <div className="grid grid-cols-5 gap-4 p-3">
            {searchParams.get("suggestNFTs") == null ? (
              myAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center">
                  <Ghost />
                  <p>No Asset Found</p>
                </div>
              ) : (
                myAssets.map((asset) => (
                  <div key={asset.metadata.mint} className="flex flex-col items-center justify-center text-center">
                    <NFTImage uri={asset.metadata.uri} />
                    <p className="text-sm">{asset.metadata.name}</p>
                  </div>
                ))
              )
            ) : otherUserAssets.length === 0 ? (
              <div className="flex flex-col items-center justify-center">
                <Ghost />
                <p>No Asset Found</p>
              </div>
            ) : (
              otherUserAssets.map((asset) => (
                <div key={asset.metadata.mint} className="flex flex-col items-center justify-center text-center">
                  <NFTImage uri={asset.metadata.uri} />
                  <p className="text-sm">{asset.metadata.name}</p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="flex items-center justify-center col-span-2 pt-4">
          <button onClick={toggleNFTs} className="rounded-xl p-3 bg-purple-400 text-white hover:bg-purple-600 focus:outline-none focus:bg-purple-600">
            {searchParams.get("suggestNFTs") == null ? `${params.userAddress} NFTs` : "Your NFTs"}
          </button>
        </div>
      </div>
    </div>
  );
}
