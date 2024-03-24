"use client";
import { getWebsocketJWT } from "@/actions";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import Cookies from "js-cookie";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export default function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);

  const { publicKey } = useWallet();

  useEffect(() => {
    const websocketAuthToken = Cookies.get("trade-connect-token");

    if (!websocketAuthToken) return console.log("RES IS GONE");

    const socketIo = io(SOCKET_URL, {
      reconnection: true,
      upgrade: true,
      transports: ["websocket", "polling"],
      auth: {
        token: websocketAuthToken,
      },
    });

    setSocket(socketIo);

    return function () {
      console.log("DISCONNECTED");
      socketIo?.disconnect();
    };
  }, []);

  return socket;
}
