import { Move, RoundResult, playRound } from "./rules";

export const ROUND_TIME_LIMIT_MS = 5_000;

export type MatchStatus = "playing" | "finished";
export type Winner = "player1" | "player2" | null;

export interface RoundOutcome {
  roundNumber: number;
  move1: Move | null;
  move2: Move | null;
  result: RoundResult;
}

export interface Match {
  winsNeeded: number;
  score1: number;
  score2: number;
  rounds: RoundOutcome[];
  status: MatchStatus;
  winner: Winner;
}

export function createMatch(winsNeeded = 3): Match {
  return {
    winsNeeded,
    score1: 0,
    score2: 0,
    rounds: [],
    status: "playing",
    winner: null,
  };
}

export function playMatchRound(
  match: Match,
  move1: Move | null,
  move2: Move | null
): Match {
  if (match.status === "finished") {
    throw new Error("Ce match est déjà terminé");
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

  if (match.score1 >= match.winsNeeded) {
    match.status = "finished";
    match.winner = "player1";
  } else if (match.score2 >= match.winsNeeded) {
    match.status = "finished";
    match.winner = "player2";
  }

  return match;
}

function resolveRound(move1: Move | null, move2: Move | null): RoundResult {
  if (move1 === null && move2 === null) return "afk";
  if (move1 === null) return "player2";
  if (move2 === null) return "player1";
  return playRound(move1, move2);
}
