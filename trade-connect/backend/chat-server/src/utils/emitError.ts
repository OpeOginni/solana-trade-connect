import { Socket } from "socket.io";

export default function socketErrorHandler(socket: Socket, error: Error) {
  console.error("Error: ", error.message);
  socket.emit("error", error.message);
}
