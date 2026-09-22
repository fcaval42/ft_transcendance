import { Server, Socket } from "socket.io";
import { createSession, armSessionTimers, getSessionByPlayerId, GameSession } from "./session";

interface WaitingPlayer {
  socket: Socket;
  playerId: string;
}

let waitingPlayer: WaitingPlayer | null = null;

function sendRejoined(socket: Socket, playerId: string, session: GameSession): void {
  socket.join(session.id);

  const role: "player1" | "player2" =
    playerId === session.player1Id ? "player1" : "player2";

  socket.emit("rejoined", {
    sessionId: session.id,
    role,
    selfId: playerId,
    selfName: role === "player1" ? session.player1Name : session.player2Name,
    selfElo: role === "player1" ? session.player1Elo : session.player2Elo,
    opponentId: role === "player1" ? session.player2Id : session.player1Id,
    opponentName: role === "player1" ? session.player2Name : session.player1Name,
    opponentElo: role === "player1" ? session.player2Elo : session.player1Elo,
    match: session.match,
  });
}

export function registerMatchmaking(io: Server): void {
  io.on("connection", (socket) => {
    socket.on("joinQueue", async (playerId: string) => {
      if (typeof playerId !== "string" || playerId.trim() === "") {
        socket.emit("queueError", "playerId invalide");
        return;
      }

      const existingSession = getSessionByPlayerId(playerId);
      if (existingSession) {
        sendRejoined(socket, playerId, existingSession);
        return;
      }

      if (waitingPlayer && waitingPlayer.playerId === playerId) {
        socket.emit("queueError", "Tu es déjà en attente d'une partie");
        return;
      }

      if (waitingPlayer) {
        const player1 = waitingPlayer;
        waitingPlayer = null;

        const session = await createSession(
          player1.playerId,
          playerId,
          undefined,
          false,
          true
        );

        player1.socket.join(session.id);
        socket.join(session.id);
        armSessionTimers(session.id);

        player1.socket.emit("matched", {
          sessionId: session.id,
          selfId: player1.playerId,
          selfName: session.player1Name,
          selfElo: session.player1Elo,
          opponentId: playerId,
          opponentName: session.player2Name,
          opponentElo: session.player2Elo,
          role: "player1",
          match: session.match,
        });
        socket.emit("matched", {
          sessionId: session.id,
          selfId: playerId,
          selfName: session.player2Name,
          selfElo: session.player2Elo,
          opponentId: player1.playerId,
          opponentName: session.player1Name,
          opponentElo: session.player1Elo,
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

    socket.on("rejoinSession", (playerId: string) => {
      if (typeof playerId !== "string" || playerId.trim() === "") return;

      const session = getSessionByPlayerId(playerId);
      if (!session) return;

      sendRejoined(socket, playerId, session);
    });

    socket.on("disconnect", () => {
      if (waitingPlayer?.socket.id === socket.id) {
        waitingPlayer = null;
      }
    });
  });
}
