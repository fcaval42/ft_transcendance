import { Move } from "./rules";
import { RoundOutcome } from "./match";

const NAMES_BOT = ["Hugo [BOT]", "Fleur [BOT]", "Fredo [BOT]", "Nominoe [BOT]",
	"Romain [BOT]", "Noemie [BOT]", "Ben [BOT]"
				  ]

export function getRandomBotName(): string {
  return NAMES_BOT[Math.floor(Math.random() * NAMES_BOT.length)];
}

const MOVES: Move[] = ["rock", "paper", "scissors"];

export function getRandomMove(): Move {
  const index = Math.floor(Math.random() * MOVES.length);
  return MOVES[index];
}

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
  return null;
}

function getHardMove(rounds: RoundOutcome[]): Move {
  const predicted = predictHumanMove(rounds);
  if (predicted === null) {
    return getRandomMove();
  }
  return winsAgainst[predicted];
}

export function getBotMove(rounds: RoundOutcome[]): Move {
    return getHardMove(rounds);
}
