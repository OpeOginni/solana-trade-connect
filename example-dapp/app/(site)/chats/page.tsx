import ChatHighlight from "@/components/ChatHighlight";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Chat() {
  const chats = ["AAAAA", "BBBBB", "CCCCC", "DDDDD", "EEEEE", "FFFFF", "GGGGG"]; // Replace with your actual chat IDs

  return (
    <div className="flex flex-col items-center h-screen pt-20">
      <div className="py-20">Check Out your Chats</div>
      <ScrollArea className="flex w-60 h-[500px] bg-white border-2 border-black rounded-xl items-center justify-center">
        <div className="flex flex-col gap-8 p-5 items-center justify-center">
          {chats.map((chatId) => (
            <ChatHighlight key={chatId} address={chatId} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
