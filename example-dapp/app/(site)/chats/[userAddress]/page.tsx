"use client";
import { getUserChat, getUserNFTs } from "@/actions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import MessageBox from "@/components/MessageBox";
import { useSocketContext } from "@/providers/useSocketContext";
import { DigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import NFTImage from "@/components/NftImage";
import { Ghost } from "lucide-react";
import { NewMessageDto, TransactionChannelDto } from "@/types/websocket.types";
import base58 from "bs58";
import { Transaction } from "@solana/web3.js";

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID as string;

const USER_NEW_MESSAGE_CHANNEL = (companyId: string, userAddress: string) =>
  `chat:new-message:${companyId}:${userAddress}`;
const USER_TRANSACTION_CHANNEL = (companyId: string, userAddress: string) =>
  `transaction:new:${companyId}:${userAddress}`;

function formatSolanaAddress(address: string): string {
  if (address.length <= 10) {
    return address;
  }
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
}

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

  const [myTrade, setMyTrade] = useState<DigitalAsset[]>([]);
  const [otherUserTrade, setOtherUserTrade] = useState<DigitalAsset[]>([]);

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

  function handleAddNFT(asset: DigitalAsset, myAsset: boolean) {
    const tradeBox = myAsset ? myTrade : otherUserTrade;

    const alreadyExists = tradeBox.some(
      (existingAsset) => existingAsset.metadata.mint === asset.metadata.mint
    );

    if (alreadyExists) return alert("You already added this NFT");

    if (myAsset) {
      setMyTrade([...myTrade, asset]);
    } else {
      setOtherUserTrade([...otherUserTrade, asset]);
    }
  }

  function handleRemoveNFT(asset: DigitalAsset, myAsset: boolean) {
    if (myAsset) {
      setMyTrade(
        myTrade.filter((a) => a.metadata.mint !== asset.metadata.mint)
      );
    } else {
      setOtherUserTrade(
        otherUserTrade.filter((a) => a.metadata.mint !== asset.metadata.mint)
      );
    }
  }
  const handleSendTrade = () => {
  //   socket?.emit("create_trade", {
  //     companyId: COMPANY_ID,
  //     tradeCreatorAddress: publicKey?.toBase58(),
  //     tradeCreatorSwapItems: myTrade.map((asset) => asset.metadata.mint),
  //     tradeRecipientAddress: params.userAddress,
  //     tradeRecipientSwapItems: otherUserAssets.map(
  //       (asset) => asset.metadata.mint
  //     ),
  //   });

    alert("Trade Sent");
    socket?.emit(
      "create_trade",
      {
        companyId: COMPANY_ID,
        tradeCreatorAddress: publicKey?.toBase58(),
        tradeCreatorSwapItems: myTrade.map((asset) => asset.metadata.mint),
        tradeRecipientAddress: params.userAddress,
        tradeRecipientSwapItems: otherUserAssets.map(
          (asset) => asset.metadata.mint
        ),
      },
      (returnedMessage: NewMessageDto) => {
        console.log(returnedMessage);
        setMessages((prevMessages) => [...prevMessages, returnedMessage]);
      }
    );
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    console.log("Sent Message");
    if (message.trim() !== "") {
      socket?.emit(
        "new_message",
        {
          message: message,
          toAddress: params.userAddress,
          fromAddress: publicKey?.toBase58(),
        },
        (returnedMessage: NewMessageDto) => {
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
        const response = await getUserChat(
          publicKey?.toBase58()!,
          params.userAddress
        );

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
    const channel = USER_NEW_MESSAGE_CHANNEL(
      COMPANY_ID,
      publicKey?.toBase58()!
    );

    const transactionChannel = USER_TRANSACTION_CHANNEL(
      COMPANY_ID,
      publicKey?.toBase58()!
    );

    const handleTransaction = async (dto: TransactionChannelDto) => {
      const transaction = Transaction.from(
        base58.decode(dto.serializedTransaction)
      );

      const signature = await signTransaction(transaction);
      console.log(signature);
    };

    const handleMessage = (messageObject: NewMessageDto) => {
      console.log("RECIVED MESSAGE");

      if (messageObject.fromAddress === params.userAddress)
        setMessages((prevMessages) => [...prevMessages, messageObject]);
    };

    socket?.on(transactionChannel, handleTransaction);
    socket?.on(channel, handleMessage);
  }, []);

  return (
    <div className="flex h-[90vh]">
      {/* Left column for chat window */}
      <div className="flex flex-col h-full w-1/3 p-4 border-r">
        {/* Chat window content */}
        <ScrollArea className="flex-grow border rounded-lg overflow-y-auto">
          {messages.map((message) => (
            <MessageBox
              key={message.message}
              message={message}
              userAddress={publicKey?.toBase58()!}
            />
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
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
          >
            Send
          </button>
        </form>
      </div>
      <div className="h-full w-2/3 flex flex-col ">
        <div className="grid grid-cols-2 p-4 w-full  flex-grow">
          <div className="border border-black col-span-1 w-full ">
            {myTrade.length === 0 ? (
              <div className="flex flex-col h-full items-center justify-center">
                <Ghost />
              </div>
            ) : (
              <ScrollArea id="my-trades" className=" w-full ">
                <div className="grid grid-cols-4 gap-4 p-3">
                  {myTrade.map((asset) => (
                    <div
                      key={asset.metadata.mint}
                      className="flex flex-col items-center justify-center text-center border hover:cursor-pointer"
                      onClick={() => handleRemoveNFT(asset, true)}
                    >
                      <NFTImage uri={asset.metadata.uri} />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
          <div className="border border-black col-span-1 w-full ">
            {otherUserTrade.length === 0 ? (
              <div className="flex flex-col h-full items-center justify-center ">
                <Ghost />
              </div>
            ) : (
              <ScrollArea id="other-user-trades" className=" w-full h-full">
                <div className="grid grid-cols-4 gap-4 p-3">
                  {otherUserTrade.map((asset) => (
                    <div
                      key={asset.metadata.mint}
                      className="flex flex-col items-center justify-center text-center border hover:cursor-pointer"
                      onClick={() => handleRemoveNFT(asset, false)}
                    >
                      <NFTImage uri={asset.metadata.uri} />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <ScrollArea className="border border-black col-span-2 w-full">
            {searchParams.get("suggestNFTs") == null ? (
              myAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center">
                  <Ghost />
                  <p>No Asset Found</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4 p-3">
                  {myAssets.map((asset) => (
                    <div
                      key={asset.metadata.mint}
                      className="flex flex-col items-center justify-center text-center border hover:cursor-pointer"
                      onClick={() => handleAddNFT(asset, true)}
                    >
                      <NFTImage uri={asset.metadata.uri} />
                      <p className="text-sm">{asset.metadata.name}</p>
                    </div>
                  ))}
                </div>
              )
            ) : otherUserAssets.length === 0 ? (
              <div className="flex flex-col items-center justify-center">
                <Ghost />
                <p>No Asset Found</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4 p-3">
                {otherUserAssets.map((asset) => (
                  <div
                    key={asset.metadata.mint}
                    className="flex flex-col items-center justify-center text-center border hover:cursor-pointer"
                    onClick={() => handleAddNFT(asset, false)}
                  >
                    <NFTImage uri={asset.metadata.uri} />
                    <p className="text-sm">{asset.metadata.name}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        <div className="flex items-center justify-between col-span-2 pt-4 px-14">
          <button
            type="button"
            onClick={toggleNFTs}
            className="rounded-xl p-3 bg-purple-400 text-white hover:bg-purple-600 focus:outline-none focus:bg-purple-600"
          >
            {searchParams.get("suggestNFTs") == null
              ? `${formatSolanaAddress(params.userAddress)} NFTs`
              : "Your NFTs"}
          </button>
          {myTrade.length > 0 && otherUserTrade.length > 0 && (
            <button
              type="button"
              className="rounded-xl p-3 bg-purple-400 text-white hover:bg-purple-600 focus:outline-none focus:bg-purple-600"
              onClick={() => {
                handleSendTrade();
              }}
            >
              Send Trade
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
