import { Move, RoundResult, playRound } from "./rules";

export const ROUND_TIME_LIMIT_MS = 5_000;

export const WELL_TRIGGER_CHANCE = 0.10;
export const WELL_TIME_LIMIT_BOT_MS = 1_000;
export const WELL_TIME_LIMIT_PVP_MS = 2_000;

export type MatchStatus = "playing" | "finished";
export type Winner = "player1" | "player2" | null;

export interface RoundOutcome {
  roundNumber: number;
  move1: Move | null;
  move2: Move | null;
  result: RoundResult;
  viaWell?: boolean;
}

export interface WellState {
  triggered: boolean;
  available: boolean;
  deadline: number | null;
}

export interface Match {
  winsNeeded: number;
  score1: number;
  score2: number;
  rounds: RoundOutcome[];
  status: MatchStatus;
  winner: Winner;
  roundDeadline: number | null;
  well: WellState;
}

export function createMatch(winsNeeded = 3): Match {
  return {
    winsNeeded,
    score1: 0,
    score2: 0,
    rounds: [],
    status: "playing",
    winner: null,
    roundDeadline: null,
    well: { triggered: false, available: false, deadline: null },
  };
}

export function playMatchRound(
  match: Match,
  move1: Move | null,
  move2: Move | null
): Match {
  if (match.status === "finished") {
    throw new Error("matchFinished");
  }

  const result = resolveRound(move1, move2);

  if (result === "player1") match.score1++;
  if (result === "player2") match.score2++;

  match.rounds.push({
    roundNumber: match.rounds.length + 1,
    move1,
    move2,
    result,
  });

  checkMatchEnd(match);

  return match;
}

export function resolveWellWin(match: Match, winner: "player1" | "player2"): Match {
  if (match.status === "finished") {
    throw new Error("matchFinished");
  }

  if (winner === "player1") match.score1++;
  else match.score2++;

  match.rounds.push({
    roundNumber: match.rounds.length + 1,
    move1: null,
    move2: null,
    result: winner,
    viaWell: true,
  });

  checkMatchEnd(match);

  return match;
}

function checkMatchEnd(match: Match): void {
  if (match.score1 >= match.winsNeeded) {
    match.status = "finished";
    match.winner = "player1";
  } else if (match.score2 >= match.winsNeeded) {
    match.status = "finished";
    match.winner = "player2";
  } else if (hasThreeConsecutiveAfkRounds(match.rounds)) {
    match.status = "finished";
    match.winner = null;
  }
}

function hasThreeConsecutiveAfkRounds(rounds: RoundOutcome[]): boolean {
  if (rounds.length < 3) return false;
  return rounds.slice(-3).every((round) => round.result === "afk");
}

function resolveRound(move1: Move | null, move2: Move | null): RoundResult {
  if (move1 === null && move2 === null) return "afk";
  if (move1 === null) return "player2";
  if (move2 === null) return "player1";
  return playRound(move1, move2);
}
