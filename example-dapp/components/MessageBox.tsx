import { cn } from "@/lib/utils";

export default function MessageBox({
  message,
  userAddress,
}: {
  message: { message: string; fromAddress: string; toAddress: string; timestamp: string };
  userAddress?: string;
}) {
  return (
    <div className={cn("flex w-auto ", message.fromAddress === userAddress ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "p-2 rounded-lg my-2",
          message.fromAddress === userAddress ? "bg-green-500 text-white self-start" : "bg-blue-500 text-white self-start"
        )}
      >
        <p>{message.message}</p>
      </div>
    </div>
  );
}
