import { Server, Socket } from "socket.io";
import { createSession, endSession, sessionEvents } from "./session";

interface WaitingPlayer {
  socket: Socket;
  playerId: string;
}

let waitingPlayer: WaitingPlayer | null = null;

// Associe chaque session PvP en cours aux ids des 2 sockets qui y jouent,
// pour pouvoir détecter la déconnexion d'un joueur en cours de partie et
// nettoyer immédiatement (au lieu d'attendre le timeout AFK). Nettoyée dès
// que la session se termine, quelle qu'en soit la cause (voir "sessionEnded").
const sessionSockets = new Map<string, Set<string>>();

sessionEvents.on("sessionEnded", ({ sessionId }: { sessionId: string }) => {
  sessionSockets.delete(sessionId);
});

export function registerMatchmaking(io: Server): void {
  io.on("connection", (socket) => {
    socket.on("joinQueue", async (playerId: string) => {
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

        const session = await createSession(player1.playerId, playerId);

        // Les 2 joueurs rejoignent une room nommée par le sessionId, pour
        // pouvoir leur diffuser le résultat de chaque manche en même temps
        // (voir realtime.ts).
        player1.socket.join(session.id);
        socket.join(session.id);

        sessionSockets.set(session.id, new Set([player1.socket.id, socket.id]));

        player1.socket.emit("matched", {
          sessionId: session.id,
          selfId: player1.playerId,
          selfName: session.player1Name,
          opponentId: playerId,
          opponentName: session.player2Name,
          role: "player1",
          match: session.match,
        });
        socket.emit("matched", {
          sessionId: session.id,
          selfId: playerId,
          selfName: session.player2Name,
          opponentId: player1.playerId,
          opponentName: session.player1Name,
          role: "player2",
          match: session.match,
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

      for (const [sessionId, socketIds] of sessionSockets) {
        if (socketIds.has(socket.id)) {
          sessionSockets.delete(sessionId);
          io.to(sessionId).emit("opponentLeft", { sessionId });
          endSession(sessionId).catch(() => {});
          break;
        }
      }
    });
  });
}
