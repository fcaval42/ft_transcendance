import { randomUUID } from "crypto";
import { EventEmitter } from "events";
import { prisma } from "../auth";
import { Match, createMatch, playMatchRound, ROUND_TIME_LIMIT_MS } from "./match";
import { Move } from "./rules";
import { computeElo } from "./elo";

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
  const session = sessions.get(sessionId);
  if (session) {
    session.match.roundDeadline = Date.now() + ROUND_TIME_LIMIT_MS;
  }
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

export function getSessionByPlayerId(playerId: string): GameSession | undefined {
  for (const session of sessions.values()) {
    if (session.player1Id === playerId || session.player2Id === playerId) {
      return session;
    }
  }
  return undefined;
}

async function applyMatchResult(
  session: GameSession,
  winner: "player1" | "player2"
): Promise<void> {
  const winnerId = winner === "player1" ? session.player1Id : session.player2Id;
  const loserId = winner === "player1" ? session.player2Id : session.player1Id;

  const [winnerUser, loserUser] = await Promise.all([
    prisma.user.findUnique({ where: { id: winnerId }, select: { elo: true } }),
    prisma.user.findUnique({ where: { id: loserId }, select: { elo: true } }),
  ]);
  if (!winnerUser || !loserUser) return;

  const { winnerElo, loserElo } = computeElo(winnerUser.elo, loserUser.elo);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: winnerId },
      data: { wins: { increment: 1 }, elo: winnerElo },
    }),
    prisma.user.update({
      where: { id: loserId },
      data: { losses: { increment: 1 }, elo: loserElo },
    }),
  ]);
}

export async function endSession(sessionId: string): Promise<void> {
  clearRoundTimer(sessionId);
  const session = sessions.get(sessionId);
  sessions.delete(sessionId);

  if (session && !session.isVsBot) {
    if (session.match.winner) {
      await applyMatchResult(session, session.match.winner).catch(() => {});
    }

    try {
      await prisma.game.delete({ where: { id: sessionId } });
    } catch {
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
    match.roundDeadline = null;
    await endSession(session.id);
  } else {
    armRoundTimer(session.id);
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
