import { Move } from "./rules";

const NAMES_BOT = ["Hugo [BOT]", "Fleur [BOT]", "Fredo [BOT]", "Nominoe [BOT]",
	"Romain [BOT]", "Noemie [BOT]", "Ben [BOT]"
				  ]

export const BOT_PLAYER_ID = NAMES_BOT[Math.floor(Math.random() * NAMES_BOT.length)]

const MOVES: Move[] = ["rock", "paper", "scissors"];

export function getRandomMove(): Move {
  const index = Math.floor(Math.random() * MOVES.length);
  return MOVES[index];
}
