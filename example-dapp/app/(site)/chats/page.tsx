"use client";

import { useParams, useRouter } from "next/navigation";
import ChatHighlight from "@/components/ChatHighlight";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, Ghost, SendIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useSocketContext } from "@/providers/useSocketContext";

export default function Chat() {
  const chats = ["AAAAA", "BBBBB", "CCCCC", "DDDDD", "EEEEE", "FFFFF", "GGGGG"]; // Replace with your actual chat IDs
  // make a usestate that takes in the addresses of the recnts chats
  const [recentChats, setRecentChats] = useState<
    {
      chatName: string;
      timestamp: string;
    }[]
  >([]);
  const [newChatUser, setNewChatUser] = useState<string>();

  const socket = useSocketContext();
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    socket?.emit("get_recent_chats");

    socket?.on("recent_chat_list", (recentChatList: Record<string, string>) => {
      console.log("Recent Chat List");
      console.log(Object.keys(recentChatList).length);

      console.log(recentChatList);
      const chatArray = Object.entries(recentChatList)
        .map(([chatName, timestamp]) => ({ chatName, timestamp }))
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      setRecentChats(chatArray);
    });
  });

  return (
    <div className="flex flex-col items-center h-screen pt-20 bg-gray-100">
      <h1 className="text-4xl font-bold py-10">Check Out your Chats</h1>
      <div className="flex flex-col w-[400px] h-[500px] items-center justify-center bg-white shadow-lg rounded-lg">
        <div className="flex flex-row gap-5 py-5 px-5">
          <Input
            className="border-2 border-gray-300 rounded-lg w-full"
            type="address"
            placeholder="Address"
            onChange={(event) => setNewChatUser(event.target.value)}
          />
          <Button
            variant="ghost"
            size="icon"
            className="text-black"
            onClick={() => router.push(`/chats/${newChatUser}`)}
          >
            <SendIcon className="h-6 w-6" />
          </Button>
        </div>
        <ScrollArea className="flex w-full h-[500px] bg-white border-2 border-gray-200 rounded-lg items-center justify-center">
          <div className="flex flex-col gap-8 p-5 items-center justify-center">
            {recentChats.length > 0 ? (
              recentChats.map((chat) => (
                <ChatHighlight key={chat.chatName} address={chat.chatName} />
              ))
            ) : (
              <>
                <Ghost className="text-gray-400" />
                <p className="text-gray-500">No recent trades</p>
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
