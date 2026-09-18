import { Server, Socket } from "socket.io";
import { createSession, endSession, getSession, sessionEvents } from "./session";

interface WaitingPlayer {
  socket: Socket;
  playerId: string;
}

let waitingPlayer: WaitingPlayer | null = null;

interface SessionSocketIds {
  player1SocketId: string;
  player2SocketId: string;
}

const sessionSockets = new Map<string, SessionSocketIds>();

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
        socket.emit("queueError", "Tu es déjà en attente d'une partie");
        return;
      }

      if (waitingPlayer) {
        const player1 = waitingPlayer;
        waitingPlayer = null;

        const session = await createSession(player1.playerId, playerId);

        player1.socket.join(session.id);
        socket.join(session.id);

        sessionSockets.set(session.id, {
          player1SocketId: player1.socket.id,
          player2SocketId: socket.id,
        });

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
        const isPlayer1 = socketIds.player1SocketId === socket.id;
        const isPlayer2 = socketIds.player2SocketId === socket.id;
        if (isPlayer1 || isPlayer2) {
          sessionSockets.delete(sessionId);
          io.to(sessionId).emit("opponentLeft", { sessionId });

          const session = getSession(sessionId);
          const abandonedBy = session
            ? isPlayer1
              ? session.player1Id
              : session.player2Id
            : undefined;
          endSession(sessionId, abandonedBy).catch(() => {});
          break;
        }
      }
    });
  });
}
