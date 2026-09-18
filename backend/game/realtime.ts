import { Server } from "socket.io";
import { submitMove, sessionEvents } from "./session";
import { Match } from "./match";
import { Move } from "./rules";

interface PlayMovePayload {
  sessionId?: string;
  playerId?: string;
  move?: Move;
}

// Couche temps réel du jeu (une fois 2 joueurs appariés par matchmaking.ts).
// Ne remplace pas les routes REST (toujours utilisées pour le mode vs bot) :
// elle ajoute juste un chemin Socket.io pour le PvP, en réutilisant
// exactement la même logique de partie (submitMove).
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
        // Pas besoin de renvoyer le résultat ici : dès que la manche est
        // résolue (les 2 joueurs ont joué), "roundResolved" se déclenche
        // dans session.ts et diffuse "roundResult" à toute la room.
      } catch (e) {
        socket.emit("moveError", (e as Error).message);
      }
    });
  });
}
