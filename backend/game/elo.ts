const K_FACTOR = 32;

export function computeElo(
  winnerElo: number,
  loserElo: number
): { winnerElo: number; loserElo: number } {
  const expectedWinner = 1 / (1 + 10 ** ((loserElo - winnerElo) / 400));
  const expectedLoser = 1 - expectedWinner;

  return {
    winnerElo: Math.round(winnerElo + K_FACTOR * (1 - expectedWinner)),
    loserElo: Math.round(loserElo + K_FACTOR * (0 - expectedLoser)),
  };
}
