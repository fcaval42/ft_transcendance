const ELO_POINTS = 16;

export function computeElo(
  winnerElo: number,
  loserElo: number
): { winnerElo: number; loserElo: number } {
  return {
    winnerElo: winnerElo + ELO_POINTS,
    loserElo: loserElo - ELO_POINTS,
  };
}
