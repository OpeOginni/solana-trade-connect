import Link from "next/link";

export default function ChatHighlight({ address }: { address: string }) {
  return (
    <Link href={`/chats/${address}`}>
      <div className="text-md w-[200px] rounded-md border-2  text-center">
        <p>{address}</p>
      </div>
    </Link>
  );
}
