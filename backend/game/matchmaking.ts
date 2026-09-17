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

      if (waitingPlayer && waitingPlayer.playerId === playerId) {
        // Même joueur déjà en attente (double clic, ou 2 onglets du même
        // compte) : on ne le fait pas s'affronter lui-même, la partie ne
        // pourrait jamais se terminer (le 2e coup écraserait toujours le 1er).
        socket.emit("queueError", "Tu es déjà en attente d'une partie");
        return;
      }

      if (waitingPlayer) {
        const player1 = waitingPlayer;
        waitingPlayer = null;

        const session = createSession(player1.playerId, playerId);

        // Les 2 joueurs rejoignent une room nommée par le sessionId, pour
        // pouvoir leur diffuser le résultat de chaque manche en même temps
        // (voir realtime.ts).
        player1.socket.join(session.id);
        socket.join(session.id);

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
