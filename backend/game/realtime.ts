import { Server } from "socket.io";
import { submitMove, sessionEvents } from "./session";
import { Match } from "./match";
import { Move } from "./rules";
import { useTranslation } from "react-i18next";

interface PlayMovePayload {
  sessionId?: string;
  playerId?: string;
  move?: Move;
}

export function registerRealtime(io: Server): void {
  const { t } = useTranslation();
  sessionEvents.on(
    "roundResolved",
    ({ sessionId, match }: { sessionId: string; match: Match }) => {
      io.to(sessionId).emit("roundResult", { sessionId, match });
    }
  );

  io.on("connection", (socket) => {
    socket.on("playMove", async ({ sessionId, playerId, move }: PlayMovePayload) => {
      if (!sessionId || !playerId || !move) {
        socket.emit("moveError","sessionId, playerId and move are required");
        return;
      }
      try {
        await submitMove(sessionId, playerId, move);
      } catch (e) {
        socket.emit("moveError", (e as Error).message);
      }
    });
  });
}
