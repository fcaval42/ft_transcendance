import { randomUUID } from "crypto";
import { EventEmitter } from "events";
import { prisma } from "../auth";
import { Match, createMatch, playMatchRound, ROUND_TIME_LIMIT_MS } from "./match";
import { Move } from "./rules";

// Emet "roundResolved" ({ sessionId, match }) chaque fois qu'une manche se
// termine (coup joué normalement OU timeout AFK). Sert de pont vers la couche
// temps réel (Socket.io, voir realtime.ts) sans que ce fichier ait besoin de
// connaître Socket.io.
// Emet aussi "sessionEnded" ({ sessionId }) dès qu'une session est détruite
// (partie finie ou abandon), pour que matchmaking.ts puisse nettoyer son
// propre état (association socket <-> session) quelle que soit la cause.
export const sessionEvents = new EventEmitter();

export interface GameSession {
  id: string;
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  isVsBot: boolean;
  match: Match;
  pendingMove1: Move | null;
  pendingMove2: Move | null;
}

const sessions = new Map<string, GameSession>();

const roundTimers = new Map<string, NodeJS.Timeout>();

function clearRoundTimer(sessionId: string): void {
  const timer = roundTimers.get(sessionId);
  if (timer) {
    clearTimeout(timer);
    roundTimers.delete(sessionId);
  }
}

function armRoundTimer(sessionId: string): void {
  clearRoundTimer(sessionId);
  const timer = setTimeout(async () => {
    try {
      await forceTimeout(sessionId);
    } catch {
    }
  }, ROUND_TIME_LIMIT_MS);
  roundTimers.set(sessionId, timer);
}

export async function createSession(
  player1Id: string,
  player2Id: string,
  winsNeeded?: number,
  isVsBot = false,
): Promise<GameSession> {
  // Les pseudos affichés au front viennent de la DB. Pour le bot, player2Id
  // est déjà un nom d'affichage (ex: "Hugo [BOT]") et ne correspond à aucun
  // User en DB : le findMany ne le trouvera simplement pas, et le fallback
  // ci-dessous réutilise directement cette valeur.
  const users = await prisma.user.findMany({
    where: { id: { in: [player1Id, player2Id] } },
    select: { id: true, username: true },
  });
  const nameById = new Map(users.map((u) => [u.id, u.username]));

  const session: GameSession = {
    id: randomUUID(),
    player1Id,
    player2Id,
    player1Name: nameById.get(player1Id) ?? player1Id,
    player2Name: nameById.get(player2Id) ?? player2Id,
    isVsBot,
    match: createMatch(winsNeeded),
    pendingMove1: null,
    pendingMove2: null,
  };

  // Une partie PvP existe en DB tant qu'elle est en cours (voir endSession).
  // On réutilise l'id de la session comme id de la ligne Game : un seul
  // identifiant à faire circuler entre le jeu en mémoire et la DB.
  if (!isVsBot) {
    await prisma.game.create({
      data: {
        id: session.id,
        player1Id,
        player2Id,
        status: "PLAYING",
        maxScore: session.match.winsNeeded,
      },
    });
  }

  sessions.set(session.id, session);
  armRoundTimer(session.id);
  return session;
}

export function getSession(sessionId: string): GameSession | undefined {
  return sessions.get(sessionId);
}

export async function endSession(sessionId: string): Promise<void> {
  clearRoundTimer(sessionId);
  const session = sessions.get(sessionId);
  sessions.delete(sessionId);

  if (session && !session.isVsBot) {
    try {
      await prisma.game.delete({ where: { id: sessionId } });
    } catch {
      // Déjà supprimée (ex: abandon et fin de partie concurrents) — pas grave.
    }
  }

  sessionEvents.emit("sessionEnded", { sessionId });
}

export type SubmitMoveResult =
  | { status: "waiting" }
  | { status: "round_played"; match: Match };

export async function submitMove(
  sessionId: string,
  playerId: string,
  move: Move
): Promise<SubmitMoveResult> {
  const session = getSessionOrThrow(sessionId);

  if (playerId === session.player1Id) {
    session.pendingMove1 = move;
  } else if (playerId === session.player2Id) {
    session.pendingMove2 = move;
  } else {
    throw new Error("Ce joueur ne fait pas partie de cette session");
  }

  if (session.pendingMove1 !== null && session.pendingMove2 !== null) {
    return resolvePendingRound(session);
  }

  return { status: "waiting" };
}

export async function forceTimeout(sessionId: string): Promise<Match> {
  const session = getSessionOrThrow(sessionId);
  const result = await resolvePendingRound(session);
  return result.match;
}

async function resolvePendingRound(session: GameSession): Promise<{
  status: "round_played";
  match: Match;
}> {
  playMatchRound(session.match, session.pendingMove1, session.pendingMove2);
  session.pendingMove1 = null;
  session.pendingMove2 = null;

  const match = session.match;

  if (match.status === "finished") {
    // Le match est terminé : on libère la session (elle ne servira plus,
    // et le résultat final est renvoyé directement dans la réponse ci-dessous).
    await endSession(session.id);
  } else {
    armRoundTimer(session.id); // arme un nouveau timer (annule l'ancien au passage)
  }

  sessionEvents.emit("roundResolved", { sessionId: session.id, match });

  return { status: "round_played", match };
}

function getSessionOrThrow(sessionId: string): GameSession {
  const session = sessions.get(sessionId);
  if (!session) throw new Error("Session introuvable");
  if (session.match.status === "finished") {
    throw new Error("Ce match est déjà terminé");
  }
  return session;
}
