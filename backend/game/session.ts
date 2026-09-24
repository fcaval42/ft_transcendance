import { randomUUID } from "crypto";
import { EventEmitter } from "events";
import { prisma } from "../auth";
import {
  Match,
  createMatch,
  playMatchRound,
  resolveWellWin,
  ROUND_TIME_LIMIT_MS,
  WELL_TRIGGER_CHANCE,
  WELL_TIME_LIMIT_BOT_MS,
  WELL_TIME_LIMIT_PVP_MS,
} from "./match";
import { Move } from "./rules";
import { computeElo } from "./elo";

export const sessionEvents = new EventEmitter();

export interface GameSession {
  id: string;
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  player1Elo: number;
  player2Elo: number;
  isVsBot: boolean;
  match: Match;
  pendingMove1: Move | null;
  pendingMove2: Move | null;
}

const sessions = new Map<string, GameSession>();

const roundTimers = new Map<string, NodeJS.Timeout>();
const wellTimers = new Map<string, NodeJS.Timeout>();

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
  if (!session) return;

  if (session.isVsBot) {
    session.match.roundDeadline = null;
    return;
  }

  session.match.roundDeadline = Date.now() + ROUND_TIME_LIMIT_MS;
  const timer = setTimeout(async () => {
    try {
      await forceTimeout(sessionId);
    } catch {
    }
  }, ROUND_TIME_LIMIT_MS);
  roundTimers.set(sessionId, timer);
}

function clearWellTimer(sessionId: string): void {
  const timer = wellTimers.get(sessionId);
  if (timer) {
    clearTimeout(timer);
    wellTimers.delete(sessionId);
  }
}

function closeWellWindow(sessionId: string): void {
  const session = sessions.get(sessionId);
  clearWellTimer(sessionId);
  if (session && session.match.well.available) {
    session.match.well.available = false;
    session.match.well.deadline = null;
  }
}

function armWellTimer(sessionId: string): void {
  const session = sessions.get(sessionId);
  if (!session) return;
  const match = session.match;
  if (match.status === "finished") return;
  if (match.well.triggered) return;
  if (Math.random() >= WELL_TRIGGER_CHANCE) return;

  match.well.triggered = true;
  match.well.available = true;
  const windowMs = session.isVsBot ? WELL_TIME_LIMIT_BOT_MS : WELL_TIME_LIMIT_PVP_MS;
  match.well.deadline = Date.now() + windowMs;

  sessionEvents.emit("wellAvailable", { sessionId, match });

  const timer = setTimeout(() => {
    const s = sessions.get(sessionId);
    wellTimers.delete(sessionId);
    if (!s || !s.match.well.available) return;
    s.match.well.available = false;
    s.match.well.deadline = null;
    sessionEvents.emit("wellExpired", { sessionId, match: s.match });
  }, windowMs);
  wellTimers.set(sessionId, timer);
}

export async function createSession(
  player1Id: string,
  player2Id: string,
  winsNeeded?: number,
  isVsBot = false,
  deferTimers = false,
): Promise<GameSession> {
  const users = await prisma.user.findMany({
    where: { id: { in: [player1Id, player2Id] } },
    select: { id: true, username: true, elo: true },
  });
  const nameById = new Map(users.map((u) => [u.id, u.username]));
  const eloById = new Map(users.map((u) => [u.id, u.elo]));

  const session: GameSession = {
    id: randomUUID(),
    player1Id,
    player2Id,
    player1Name: nameById.get(player1Id) ?? player1Id,
    player2Name: nameById.get(player2Id) ?? player2Id,
    player1Elo: eloById.get(player1Id) ?? 0,
    player2Elo: eloById.get(player2Id) ?? 0,
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
  if (!deferTimers) {
    armRoundTimer(session.id);
    armWellTimer(session.id);
  }
  return session;
}

export function armSessionTimers(sessionId: string): void {
  armRoundTimer(sessionId);
  armWellTimer(sessionId);
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
  clearWellTimer(sessionId);
  const session = sessions.get(sessionId);
  sessions.delete(sessionId);

  if (session && !session.isVsBot) {
    if (session.match.winner) {
      await applyMatchResult(session, session.match.winner).catch((error) => {
        console.error("[Elo] Erreur lors de la mise à jour de l'Elo:", error);
      });
    }

    try {
      await prisma.game.delete({ where: { id: sessionId } });
    } catch {
    }
  }

  sessionEvents.emit("sessionEnded", { sessionId });
}

export async function endBotSessionsOfPlayer(playerId: string): Promise<void> {
  const botSessions = Array.from(sessions.values()).filter(
    (session) => session.isVsBot && session.player1Id === playerId
  );
  for (const session of botSessions) {
    await endSession(session.id);
  }
}

export type SubmitMoveResult =
  | { status: "waiting" }
  | { status: "round_played"; match: Match };

export async function submitMove(
  sessionId: string,
  playerId: string,
  move: Move,
  expectedRoundNumber?: number
): Promise<SubmitMoveResult> {
  const session = getSessionOrThrow(sessionId);

  if (expectedRoundNumber !== undefined) {
    const currentRoundNumber = session.match.rounds.length + 1;
    if (expectedRoundNumber !== currentRoundNumber) {
      throw new Error("moveTooLate");
    }
  }

  if (playerId === session.player1Id) {
    session.pendingMove1 = move;
  } else if (playerId === session.player2Id) {
    session.pendingMove2 = move;
  } else {
    throw new Error("invalidPlayer");
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
  closeWellWindow(session.id);

  playMatchRound(session.match, session.pendingMove1, session.pendingMove2);
  session.pendingMove1 = null;
  session.pendingMove2 = null;

  const match = session.match;

  if (match.status === "finished") {
    match.roundDeadline = null;
    await endSession(session.id);
  } else {
    armRoundTimer(session.id);
    armWellTimer(session.id);
  }

  sessionEvents.emit("roundResolved", { sessionId: session.id, match });

  return { status: "round_played", match };
}

export async function attemptWell(sessionId: string, playerId: string): Promise<Match> {
  const session = getSessionOrThrow(sessionId);
  const match = session.match;

  if (!match.well.available) {
    throw new Error("wellUnavailable");
  }

  let winner: "player1" | "player2";
  if (playerId === session.player1Id) {
    winner = "player1";
  } else if (playerId === session.player2Id) {
    winner = "player2";
  } else {
    throw new Error("invalidPlayer");
  }

  closeWellWindow(sessionId);

  resolveWellWin(match, winner);
  session.pendingMove1 = null;
  session.pendingMove2 = null;

  if (match.status === "finished") {
    match.roundDeadline = null;
    await endSession(sessionId);
  } else {
    armRoundTimer(sessionId);
    armWellTimer(sessionId);
  }

  sessionEvents.emit("roundResolved", { sessionId, match });

  return match;
}

function getSessionOrThrow(sessionId: string): GameSession {
  const session = sessions.get(sessionId);
  if (!session) throw new Error("sessionNotFound");
  if (session.match.status === "finished") {
    throw new Error("matchFinished");
  }
  return session;
}
