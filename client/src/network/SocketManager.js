import { io } from "socket.io-client";
import { SERVER_URL } from "../game/config";
export class SocketManager {
    constructor() {
        Object.defineProperty(this, "socket", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.socket = io(SERVER_URL);
    }
    createRoom(name) { this.socket.emit("createRoom", { name }); }
    joinRoom(roomCode, name) { this.socket.emit("joinRoom", { roomCode, name }); }
    sendMovement(x, y, direction, isMoving = false) {
        this.socket.emit("playerMovement", {
            x,
            y,
            direction,
            isMoving,
        });
    }
    sendMessage(message) {
        this.socket.emit("chatMessage", message);
    }
}
