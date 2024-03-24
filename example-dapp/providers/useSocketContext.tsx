import React, { createContext, useContext } from "react";
import useSocket from "./socket.provider";
import { Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const socket = useSocket();

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocketContext = () => useContext(SocketContext);
