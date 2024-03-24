"use client";
import { getUserChat } from "@/actions";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import MessageBox from "@/components/MessageBox";
import useSocket from "@/providers/socket.provider";
import { useSocketContext } from "@/providers/useSocketContext";

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID as string;

const USER_NEW_MESSAGE_CHANNEL = (companyId: string, userAddress: string) => `chat:new-message:${companyId}:${userAddress}`;

export default function ChatSessionPage() {
  const params = useParams<{ userAddress: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { publicKey } = useWallet();

  const socket = useSocketContext();

  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  function newMessageObject(message: string) {
    return JSON.stringify({
      message,
      timestamp: new Date().toISOString(),
      fromAddress: publicKey?.toBase58(),
      toAddress: params.userAddress,
    });
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    console.log("Snet Messahe");
    if (message.trim() !== "") {
      socket?.emit(
        "new_message",
        { message: message, toAddress: params.userAddress },
        (returnedMessage: { message: string; fromAddress: string; toAddress: string; timestamp: string }) => {
          console.log(returnedMessage);
          setMessages((prevMessages) => [...prevMessages, JSON.stringify(returnedMessage)]);
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
    console.log("Listening to Received Message");

    const channel = USER_NEW_MESSAGE_CHANNEL(COMPANY_ID, publicKey?.toBase58()!);

    console.log(`Listening to ${channel}`);
    console.log(`Socket connected: ${socket?.connected}`);

    socket?.on(channel, ({ sender, message }: { sender: string; message: string }) => {
      console.log("RECIVED MESSAGE");
      const json = JSON.stringify({
        message,
        timestamp: new Date().toISOString(),
        fromAddress: params.userAddress,
        toAddress: publicKey?.toBase58(),
      });
      if (sender === params.userAddress) setMessages((prevMessages) => [...prevMessages, json]);
    });

    // return () => {
    //   socket?.off(channel);
    // };
  }, [publicKey, socket]);

  return (
    <div className="flex h-[80vh]">
      {/* Left column for chat window */}
      <div className="w-1/3 p-4 border-r">
        {/* Chat window content */}
        <ScrollArea className="h-full border rounded-lg overflow-y-auto">
          {messages.map((message) => (
            <MessageBox key={message} message={JSON.parse(message)} userAddress={publicKey?.toBase58()!} />
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
      {/* Right column (empty for now) */}
      <div className="grid grid-cols-2 p-4 w-2/3">
        <ScrollArea className="border border-black col-span-1 w-full ">
          <div className="grid grid-cols-4 gap-4 p-3">
            {Array(20)
              .fill(null)
              .map((_, index) => (
                <div key={index} className="flex justify-center items-center text-center aspect-[1] border border-gray-200 p-2">
                  Simran {index + 1}
                </div>
              ))}
          </div>
        </ScrollArea>
        <ScrollArea className="border border-black col-span-1 w-full">
          <div className="grid grid-cols-4 gap-4 p-3">
            {Array(10)
              .fill(null)
              .map((_, index) => (
                <div key={index} className="flex justify-center items-center text-center aspect-[1] border border-gray-200 p-2">
                  Sophia {index + 1}
                </div>
              ))}
          </div>
        </ScrollArea>

        <ScrollArea className="border border-black col-span-2 w-full">
          <div className="grid grid-cols-8 gap-4 p-3">
            {Array(26)
              .fill(null)
              .map((_, index) => (
                <div key={index} className="flex justify-center items-center text-center aspect-[1] border border-gray-200 p-2">
                  Junky {index + 1}
                </div>
              ))}
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
