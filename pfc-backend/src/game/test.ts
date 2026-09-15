import { playRound, Move } from "./rules";

const moves: Move[] = ["rock", "paper", "scissors"];
for (const m1 of moves) {
  for (const m2 of moves) {
    console.log(`${m1} vs ${m2} -> ${playRound(m1, m2)}`);
  }
}
