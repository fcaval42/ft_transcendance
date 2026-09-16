import { randomUUID } from "crypto";
import { Match, createMatch, playMatchRound, ROUND_TIME_LIMIT_MS } from "./match";
import { Move } from "./rules";

export interface GameSession {
  id: string;
  player1Id: string;
  player2Id: string;
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
  const timer = setTimeout(() => {
    try {
      forceTimeout(sessionId);
    } catch {
    }
  }, ROUND_TIME_LIMIT_MS);
  roundTimers.set(sessionId, timer);
}

export function createSession(
  player1Id: string,
  player2Id: string,
  winsNeeded?: number,
  isVsBot = false
): GameSession {
  const session: GameSession = {
    id: randomUUID(),
    player1Id,
    player2Id,
    isVsBot,
    match: createMatch(winsNeeded),
    pendingMove1: null,
    pendingMove2: null,
  };
  sessions.set(session.id, session);
  armRoundTimer(session.id);
  return session;
}

export function getSession(sessionId: string): GameSession | undefined {
  return sessions.get(sessionId);
}

export function endSession(sessionId: string): void {
  clearRoundTimer(sessionId);
  sessions.delete(sessionId);
}

export type SubmitMoveResult =
  | { status: "waiting" }
  | { status: "round_played"; match: Match };

export function submitMove(
  sessionId: string,
  playerId: string,
  move: Move
): SubmitMoveResult {
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

export function forceTimeout(sessionId: string): Match {
  const session = getSessionOrThrow(sessionId);
  const result = resolvePendingRound(session);
  return result.match;
}

function resolvePendingRound(session: GameSession): {
  status: "round_played";
  match: Match;
} {
  playMatchRound(session.match, session.pendingMove1, session.pendingMove2);
  session.pendingMove1 = null;
  session.pendingMove2 = null;

  clearRoundTimer(session.id);
  if (session.match.status === "playing") {
    armRoundTimer(session.id);
  }

  return { status: "round_played", match: session.match };
}

function getSessionOrThrow(sessionId: string): GameSession {
  const session = sessions.get(sessionId);
  if (!session) throw new Error("Session introuvable");
  if (session.match.status === "finished") {
    throw new Error("Ce match est déjà terminé");
  }
  return session;
}
