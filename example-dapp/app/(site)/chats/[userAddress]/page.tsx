"use client";

import { useParams } from "next/navigation";
export default function ChatSessionPage() {
  const params = useParams<{ userAddress: string }>();

  console.log(params);
  return <div>{params.userAddress}</div>;
}
