export type Move = "rock" | "paper" | "scissors";

export type RoundResult = "player1" | "player2" | "draw" | "afk";

const beats: Record<Move, Move> = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper",
};

export function playRound(move1: Move, move2: Move): RoundResult {
  if (move1 === move2) return "draw";
  return beats[move1] === move2 ? "player1" : "player2";
}
