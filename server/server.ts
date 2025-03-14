import { ClientToServerEvents, ServerToClientEvents } from './../shared/types/events';
import http from "http";
import { Socket, Server as SocketServer } from "socket.io";
import { userEvents } from "./src/socketEvents/userEvents";

const server = http.createServer();

export const io = new SocketServer<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
    userEvents(socket);
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
