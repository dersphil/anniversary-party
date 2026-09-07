import Phaser from "phaser";
import { ChatBubble } from "./ChatBubble";
import { NPC } from "./NPC";
import { Player } from "./Player";
import { RooftopMap } from "./Map";
import { SocketManager, NetworkPlayer } from "../network/SocketManager";
import { DEFAULT_ROOM_CODE } from "./config";

export class GameScene extends Phaser.Scene {
  player!: Player;
  socketManager!: SocketManager;
  private map!: RooftopMap;
  private readonly npcs: NPC[] = [];
  private readonly otherPlayers = new Map<string, Phaser.GameObjects.Rectangle>();
  private readonly bubbles = new Map<string, ChatBubble>();
  private roomCode = "";
  private ready = false;
  private playerName = "";
  private roomPanel!: HTMLDivElement;
  private chatInput!: HTMLInputElement;

  constructor() { super("GameScene"); }

  preload() {}

  create() {
    this.socketManager = new SocketManager();
    this.map = new RooftopMap(this);
    this.createNPCs();
    this.createPlayerTexture();
    this.createRoomUI();
    this.createChatUI();
    this.setupNetworking();
    this.cameras.main.setBackgroundColor("#18202b");
  }

  private createNPCs() {
    const positions: Array<[number, number, "dance" | "sway" | "idle"]> = [
      [315, 330, "dance"], [375, 390, "dance"], [450, 320, "dance"], [520, 420, "dance"],
      [600, 350, "dance"], [660, 430, "dance"], [790, 260, "idle"], [840, 270, "idle"],
      [790, 540, "sway"], [720, 540, "sway"], [205, 285, "sway"], [205, 540, "idle"],
      [320, 540, "idle"], [400, 540, "sway"], [550, 540, "idle"], [630, 540, "sway"],
      [760, 245, "idle"], [875, 260, "idle"], [190, 340, "sway"], [850, 500, "idle"],
    ];
    positions.forEach(([x, y, behavior], index) => {
      this.npcs.push(new NPC(this, x, y, index % 2 ? 0xff7895 : 0x62c4ca, behavior));
    });
  }

  private createPlayerTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xf2c6a0).fillRect(10, 4, 20, 18);
    graphics.fillStyle(0x422c2c).fillRect(8, 0, 24, 8);
    graphics.fillStyle(0x4a6fa5).fillRect(8, 22, 24, 20);
    graphics.fillStyle(0x222222).fillRect(10, 42, 8, 8).fillRect(22, 42, 8, 8);
    graphics.generateTexture("player-dhruv", 40, 52);
    graphics.clear();
    graphics.fillStyle(0xf2c6a0).fillRect(10, 4, 20, 18);
    graphics.fillStyle(0x6b315e).fillRect(8, 0, 24, 8);
    graphics.fillStyle(0xffd447).fillRect(8, 22, 24, 20);
    graphics.fillStyle(0x222222).fillRect(10, 42, 8, 8).fillRect(22, 42, 8, 8);
    graphics.generateTexture("player-maria", 40, 52);
    graphics.destroy();
  }

  private setupNetworking() {
    this.socketManager.socket.on("roomJoined", (data: { roomCode: string; player: NetworkPlayer; players: Record<string, NetworkPlayer>; created: boolean }) => {
      this.roomCode = data.roomCode;
      console.info(`[Tushitas] Room code: ${this.roomCode}`);
      this.ready = true;
      this.player = new Player(
        this,
        data.player.x,
        data.player.y,
        this.playerName.toLowerCase() === "dhruv" ? "player-dhruv" : "player-maria",
      );
      this.physics.add.collider(this.player, this.map.obstacles);
      Object.values(data.players).forEach((player) => {
        if (player.id !== this.socketManager.socket.id) this.addOtherPlayer(player);
      });
      this.updateRoomStatus(`ROOM ${this.roomCode}`);
      this.chatInput.style.display = "block";
      this.showRoomCodeBadge();
      if (data.created) {
        this.showCreatedRoomScreen();
      } else {
        this.roomPanel.style.display = "none";
      }
    });
    this.socketManager.socket.on("roomError", (message: string) => this.updateRoomStatus(message));
    this.socketManager.socket.on("playerJoined", (player: NetworkPlayer) => this.addOtherPlayer(player));
    this.socketManager.socket.on("playerMoved", (player: NetworkPlayer) => {
      const other = this.otherPlayers.get(player.id);
      if (other) { other.x = player.x; other.y = player.y; }
    });
    this.socketManager.socket.on("playerLeft", (id: string) => {
      this.otherPlayers.get(id)?.destroy();
      this.otherPlayers.delete(id);
      this.bubbles.get(id)?.destroy();
      this.bubbles.delete(id);
    });
    this.socketManager.socket.on("chatMessage", (data: { playerId: string; message: string; x: number; y: number }) => {
      this.bubbles.get(data.playerId)?.destroy();
      this.bubbles.set(data.playerId, new ChatBubble(this, data.x, data.y, data.message));
    });
  }

  private addOtherPlayer(player: NetworkPlayer) {
    if (this.otherPlayers.has(player.id)) return;
    const color = player.name.toLowerCase() === "dhruv" ? 0x4a6fa5 : 0xffd447;
    const character = this.add.rectangle(player.x, player.y, 32, 45, color).setStrokeStyle(4, 0x47243b);
    this.otherPlayers.set(player.id, character);
  }

  private createRoomUI() {
    const panel = document.createElement("div");
    panel.id = "room-panel";
    panel.innerHTML = `
      <div class="quiz-kicker">TUSHITAS // PRIVATE NIGHT</div>
      <h1>Before we go in...</h1>
      <div id="quiz-content"></div>
      <div id="quiz-popup" class="quiz-popup" hidden></div>
    `;
    Object.assign(panel.style, { position: "fixed", inset: "0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "24px", color: "#fff4fb", background: "rgba(12, 14, 32, .96)", fontFamily: "monospace", zIndex: "5", textAlign: "center" });
    document.body.appendChild(panel);
    this.roomPanel = panel;
    this.addQuizStyles();
    this.showQuizQuestion(0);
  }

  private addQuizStyles() {
    const styles = document.createElement("style");
    styles.textContent = `
      #room-panel h1 { margin: 8px 0 24px; color: #ffb8df; font-size: clamp(24px, 5vw, 42px); }
      .quiz-kicker { color: #67e8e4; letter-spacing: 3px; font-size: 12px; }
      .quiz-question { max-width: 680px; margin-bottom: 22px; color: #fff6fb; font-size: clamp(15px, 2.5vw, 21px); line-height: 1.5; }
      .quiz-options { display: grid; grid-template-columns: repeat(2, minmax(150px, 1fr)); gap: 10px; width: min(680px, 90vw); }
      .quiz-options button, .room-action { cursor: pointer; border: 2px solid #db5a9b; padding: 12px 14px; color: #fff6fb; background: #2e2850; font: 14px monospace; }
      .quiz-options button:hover, .room-action:hover { background: #db5a9b; color: #251d36; }
      .quiz-popup { margin-top: 18px; padding: 14px 18px; border: 2px solid #67e8e4; background: #182c43; color: #fff6fb; }
      .created-room-code { margin: 12px 0; color: #67e8e4; font-size: clamp(38px, 10vw, 76px); font-weight: bold; letter-spacing: 8px; text-shadow: 4px 4px #342051; }
      .room-instruction { margin-bottom: 18px; }
      .room-fields { display: grid; gap: 10px; width: min(360px, 90vw); }
      .room-fields input { box-sizing: border-box; width: 100%; padding: 12px; border: 2px solid #67e8e4; background: #fff6fb; color: #251d36; font: 16px monospace; }
      .room-actions { display: flex; gap: 10px; justify-content: center; }
      @media (max-width: 520px) { .quiz-options { grid-template-columns: 1fr; } }
    `;
    document.head.appendChild(styles);
  }

  private showQuizQuestion(index: number) {
    const questions = [
      {
        prompt: "What was the number plate of the taxi that Dhruv and Maria had their first kiss in?",
        options: ["KA 01 UE 2021", "KA 51 A 4376", "KA 51 WM 6781", "what the helly?"],
      },
      {
        prompt: "What's Dhruv and Maria's best ever date?",
        options: ["guerilla diner", "bohemians + smash guys", "valentines", "first date"],
      },
      {
        prompt: "How much do you love Dhruv?",
        options: ["a lot", "a loooootttt", "a loooooooootttttttt", "A LOOOOTTTTTTTT"],
      },
    ];
    const question = questions[index];
    const content = this.roomPanel.querySelector<HTMLDivElement>("#quiz-content")!;
    content.innerHTML = `<div class="quiz-question">${question.prompt}</div><div class="quiz-options"></div>`;
    const options = content.querySelector<HTMLDivElement>(".quiz-options")!;
    question.options.forEach((option) => {
      const button = document.createElement("button");
      button.textContent = option;
      button.addEventListener("click", () => {
        if (index === 1) {
          this.showQuizPopup("Trick question. It's all of them.", () => this.showQuizQuestion(index + 1));
        } else if (index < questions.length - 1) {
          this.showQuizQuestion(index + 1);
        } else {
          this.showRoomFields();
        }
      });
      options.appendChild(button);
    });
  }

  private showQuizPopup(message: string, continueTo: () => void) {
    const popup = this.roomPanel.querySelector<HTMLDivElement>("#quiz-popup")!;
    popup.hidden = false;
    popup.innerHTML = `${message}<br><button class="room-action">Continue</button>`;
    popup.querySelector("button")!.addEventListener("click", () => {
      popup.hidden = true;
      continueTo();
    });
  }

  private showRoomFields() {
    const content = this.roomPanel.querySelector<HTMLDivElement>("#quiz-content")!;
    content.innerHTML = `<div class="quiz-question">Okay, you're cleared for the rooftop.</div><div class="room-fields"><input id="player-name" placeholder="Your name" maxlength="20"><input id="room-code" value="${DEFAULT_ROOM_CODE}" maxlength="${DEFAULT_ROOM_CODE.length}" readonly aria-label="Room code"><div class="room-actions"><button id="join-room" class="room-action">Join room</button><button id="create-room" class="room-action">Create room</button></div><span id="room-status">Your room code is ${DEFAULT_ROOM_CODE}.</span></div>`;
    const name = content.querySelector<HTMLInputElement>("#player-name")!;
    const roomCode = content.querySelector<HTMLInputElement>("#room-code")!;
    content.querySelector("#join-room")!.addEventListener("click", () => {
      this.playerName = name.value.trim() || "Maria";
      this.socketManager.joinRoom(roomCode.value, this.playerName);
    });
    content.querySelector("#create-room")!.addEventListener("click", () => {
      this.playerName = name.value.trim() || "Dhruv";
      this.socketManager.createRoom(this.playerName, roomCode.value.trim() || DEFAULT_ROOM_CODE);
    });
  }

  private updateRoomStatus(message: string) {
    const status = document.querySelector<HTMLElement>("#room-status");
    if (status) status.textContent = message;
  }

  private showRoomCodeBadge() {
    document.querySelector("#room-code-badge")?.remove();
    const badge = document.createElement("div");
    badge.id = "room-code-badge";
    badge.innerHTML = `<span>ROOM CODE <strong>${this.roomCode}</strong></span><button type="button">Copy</button>`;
    Object.assign(badge.style, {
      position: "fixed",
      top: "18px",
      right: "18px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px 12px",
      color: "#fff6fb",
      background: "#241d40",
      border: "2px solid #67e8e4",
      font: "14px monospace",
      zIndex: "5",
    });
    const button = badge.querySelector("button") as HTMLButtonElement;
    Object.assign(button.style, {
      cursor: "pointer",
      padding: "6px 8px",
      color: "#251d36",
      background: "#67e8e4",
      border: "0",
      font: "12px monospace",
    });
    button.addEventListener("click", async () => {
      await navigator.clipboard?.writeText(this.roomCode);
      button.textContent = "Copied";
      window.setTimeout(() => { button.textContent = "Copy"; }, 1500);
    });
    document.body.appendChild(badge);
  }

  private showCreatedRoomScreen() {
    const content = this.roomPanel.querySelector<HTMLDivElement>("#quiz-content")!;
    content.innerHTML = `<div class="quiz-question">Your private room is ready.</div><div class="created-room-code">${this.roomCode}</div><div class="quiz-question room-instruction">Send this code to Maria so she can join.</div><button id="enter-rooftop" class="room-action">Enter rooftop</button>`;
    this.roomPanel.style.display = "flex";
    content.querySelector("#enter-rooftop")!.addEventListener("click", () => {
      this.roomPanel.style.display = "none";
    });
  }

  private createChatUI() {
    const input = document.createElement("input");
    input.id = "chat-input";
    input.placeholder = "Say something sweet...";
    Object.assign(input.style, { display: "none", position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", width: "min(400px, 70vw)", padding: "12px", font: "16px monospace", border: "3px solid #db5a9b", background: "#fff6fb", zIndex: "5" });
    document.body.appendChild(input);
    this.chatInput = input;
    input.addEventListener("keydown", (event) => {
      event.stopPropagation();
      if (event.key === "Enter" && input.value.trim() && this.ready) {
        this.socketManager.sendMessage(input.value.trim());
        input.value = "";
      }
    });
  }

  update(time: number) {
    this.npcs.forEach((npc) => npc.update(time));
    if (!this.ready || !this.player) return;
    const typing = document.activeElement === this.chatInput;
    this.player.update(!typing);
    this.socketManager.sendMovement(this.player.x, this.player.y, this.player.direction, this.player.isMoving);
  }
}