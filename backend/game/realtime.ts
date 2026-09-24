import { Server } from "socket.io";
import { submitMove, attemptWell, sessionEvents } from "./session";
import { Match } from "./match";
import { Move } from "./rules";

interface PlayMovePayload {
  sessionId?: string;
  playerId?: string;
  move?: Move;
  roundNumber?: number;
}

interface HitWellPayload {
  sessionId?: string;
  playerId?: string;
}

export function registerRealtime(io: Server): void {
  sessionEvents.on(
    "roundResolved",
    ({ sessionId, match }: { sessionId: string; match: Match }) => {
      io.to(sessionId).emit("roundResult", { sessionId, match });
    }
  );

  sessionEvents.on(
    "wellAvailable",
    ({ sessionId, match }: { sessionId: string; match: Match }) => {
      io.to(sessionId).emit("wellAvailable", { sessionId, match });
    }
  );

  sessionEvents.on(
    "wellExpired",
    ({ sessionId, match }: { sessionId: string; match: Match }) => {
      io.to(sessionId).emit("wellExpired", { sessionId, match });
    }
  );

  io.on("connection", (socket) => {
    socket.on("playMove", async ({ sessionId, playerId, move, roundNumber }: PlayMovePayload) => {
      if (!sessionId || !playerId || !move) {
        socket.emit("moveError", "missingFields");
        return;
      }
      try {
        await submitMove(sessionId, playerId, move, roundNumber);
      } catch (e) {
        socket.emit("moveError", (e as Error).message);
      }
    });

    socket.on("hitWell", async ({ sessionId, playerId }: HitWellPayload) => {
      if (!sessionId || !playerId) {
        socket.emit("wellError", "missingFields");
        return;
      }
      try {
        await attemptWell(sessionId, playerId);
      } catch (e) {
        socket.emit("wellError", (e as Error).message);
      }
    });
  });
}
