"use client";

import { SocketProvider } from "@/providers/useSocketContext";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SocketProvider>{children}</SocketProvider>;
}
