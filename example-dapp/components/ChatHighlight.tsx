import Link from "next/link";

function formatSolanaAddress(address: string): string {
  if (address.length <= 10) {
    return address;
  }
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
}

export default function ChatHighlight({ address }: { address: string }) {
  return (
    <Link href={`/chats/${address}`}>
      <div className="text-md w-[200px] rounded-md border-2  text-center">
        <p>{formatSolanaAddress(address)}</p>
      </div>
    </Link>
  );
}
