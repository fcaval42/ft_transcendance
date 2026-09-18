import { Server } from "socket.io";
import { submitMove, sessionEvents } from "./session";
import { Match } from "./match";
import { Move } from "./rules";

interface PlayMovePayload {
  sessionId?: string;
  playerId?: string;
  move?: Move;
}

export function registerRealtime(io: Server): void {
  sessionEvents.on(
    "roundResolved",
    ({ sessionId, match }: { sessionId: string; match: Match }) => {
      io.to(sessionId).emit("roundResult", { sessionId, match });
    }
  );

  io.on("connection", (socket) => {
    socket.on("playMove", async ({ sessionId, playerId, move }: PlayMovePayload) => {
      if (!sessionId || !playerId || !move) {
        socket.emit("moveError", "sessionId, playerId et move sont requis");
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
