import { Move } from "./rules";
import { RoundOutcome } from "./match";

const NAMES_BOT = ["Hugo [BOT]", "Fleur [BOT]", "Fredo [BOT]", "Nominoe [BOT]",
	"Romain [BOT]", "Noemie [BOT]", "Ben [BOT]"
				  ]

export const BOT_PLAYER_ID = NAMES_BOT[Math.floor(Math.random() * NAMES_BOT.length)]

const MOVES: Move[] = ["rock", "paper", "scissors"];

export function getRandomMove(): Move {
  const index = Math.floor(Math.random() * MOVES.length);
  return MOVES[index];
}

export type BotDifficulty = "easy" | "medium" | "hard";

const winsAgainst: Record<Move, Move> = {
  rock: "paper",
  paper: "scissors",
  scissors: "rock",
};

const losesTo: Record<Move, Move> = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper",
};

function humanMoves(rounds: RoundOutcome[]): Move[] {
  return rounds
    .map((round) => round.move1)
    .filter((move): move is Move => move !== null);
}

function mostFrequentMove(moves: Move[]): Move {
  const counts: Record<Move, number> = { rock: 0, paper: 0, scissors: 0 };
  for (const move of moves) counts[move]++;
  return MOVES.reduce((best, move) => (counts[move] > counts[best] ? move : best));
}

function getMediumMove(rounds: RoundOutcome[]): Move {
  const moves = humanMoves(rounds);
  if (moves.length === 0 || Math.random() >= 0.65) {
    return getRandomMove();
  }
  return winsAgainst[mostFrequentMove(moves)];
}

function predictHumanMove(rounds: RoundOutcome[]): Move | null {
  if (rounds.length === 0) return null;
  const lastRound = rounds[rounds.length - 1];
  const lastHumanMove = lastRound.move1;
  if (lastHumanMove === null) return null;

  if (lastRound.result === "player1") {
    return lastHumanMove;
  }
  if (lastRound.result === "player2") {
    return losesTo[lastHumanMove];
  }
  return null; // égalité ou AFK : pas de biais fiable
}

function getHardMove(rounds: RoundOutcome[]): Move {
  const predicted = predictHumanMove(rounds);
  if (predicted === null || Math.random() >= 0.8) {
    return getRandomMove();
  }
  return winsAgainst[predicted];
}

export function getBotMove(difficulty: BotDifficulty, rounds: RoundOutcome[]): Move {
  switch (difficulty) {
    case "medium":
      return getMediumMove(rounds);
    case "hard":
      return getHardMove(rounds);
    default:
      return getRandomMove();
  }
}
