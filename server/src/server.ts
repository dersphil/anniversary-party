import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { Socket } from "socket.io";
import { GameRoom } from "./GameRoom.js";

const app = express();

app.use(cors());

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const rooms = new Map<string, GameRoom>();
const socketRooms = new Map<string, GameRoom>();

function makeCode() {
  let code = "";
  do code = Math.random().toString(36).slice(2, 7).toUpperCase(); while (rooms.has(code));
  return code;
}

function leaveRoom(socket: Socket) {
  const room = socketRooms.get(socket.id);
  if (!room) return;
  room.players.remove(socket.id);
  room.sockets.delete(socket.id);
  socketRooms.delete(socket.id);
  socket.leave(room.code);
  socket.to(room.code).emit("playerLeft", socket.id);
  if (room.sockets.size === 0) rooms.delete(room.code);
}

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  socket.on("createRoom", ({ name, roomCode }: { name: string; roomCode?: string }) => {
    const code = roomCode?.trim().toUpperCase() || makeCode();
    if (rooms.has(code)) return socket.emit("roomError", "That room already exists. Join it instead.");
    join(socket, code, name, true);
  });
  socket.on("joinRoom", ({ roomCode, name }: { roomCode: string; name: string }) => {
    const code = roomCode.trim().toUpperCase();
    const room = rooms.get(code);
    if (!room) return socket.emit("roomError", "That room does not exist.");
    if (room.isFull()) return socket.emit("roomError", "That room already has two players.");
    join(socket, code, name, false);
  });

  socket.on("playerMovement", (data) => {
    const room = socketRooms.get(socket.id);
    const player = room?.players.update(socket.id, data);
    if (room && player) socket.to(room.code).emit("playerMoved", player);
  });

  socket.on("chatMessage", (message: string) => {
    const room = socketRooms.get(socket.id);
    const player = room?.players.get(socket.id);
    if (!room || !player || typeof message !== "string") return;
    io.to(room.code).emit("chatMessage", {
      playerId: socket.id,
      message: message.trim().slice(0, 140),
      x: player.x,
      y: player.y,
    });
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    leaveRoom(socket);
  });
});

function join(socket: Socket, code: string, name: string, created: boolean) {
  const room = rooms.get(code) ?? new GameRoom(code);
  rooms.set(code, room);
  const player = room.players.add(socket.id, (name || "Player").trim().slice(0, 20));
  room.sockets.add(socket.id);
  socketRooms.set(socket.id, room);
  socket.join(code);
  socket.emit("roomJoined", { roomCode: code, player, players: room.players.all(), created });
  socket.to(code).emit("playerJoined", player);
}

app.get("/", (_req, res) => {
  res.send("Tushitas server is running ❤️");
});

const PORT = Number(process.env.PORT) || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});