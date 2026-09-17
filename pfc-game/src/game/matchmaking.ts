import { Server, Socket } from "socket.io";
import { createSession } from "./session";

interface WaitingPlayer {
  socket: Socket;
  playerId: string;
}

let waitingPlayer: WaitingPlayer | null = null;

export function registerMatchmaking(io: Server): void {
  io.on("connection", (socket) => {
    socket.on("joinQueue", (playerId: string) => {
      if (typeof playerId !== "string" || playerId.trim() === "") {
        socket.emit("queueError", "playerId invalide");
        return;
      }

      if (waitingPlayer) {
        const player1 = waitingPlayer;
        waitingPlayer = null;

        const session = createSession(player1.playerId, playerId);

        player1.socket.emit("matched", {
          sessionId: session.id,
          selfId: player1.playerId,
          opponentId: playerId,
          role: "player1",
        });
        socket.emit("matched", {
          sessionId: session.id,
          selfId: playerId,
          opponentId: player1.playerId,
          role: "player2",
        });
        return;
      }

      waitingPlayer = { socket, playerId };
      socket.emit("waiting");
    });

    socket.on("leaveQueue", () => {
      if (waitingPlayer?.socket.id === socket.id) {
        waitingPlayer = null;
      }
    });

    socket.on("disconnect", () => {
      if (waitingPlayer?.socket.id === socket.id) {
        waitingPlayer = null;
      }
    });
  });
}
