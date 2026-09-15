import { Router } from "express";
import { createSession, submitMove, getSession } from "./session";
import { Move } from "./rules";
import { ROUND_TIME_LIMIT_MS } from "./match";

export const gameRouter = Router();

gameRouter.post("/session", (req, res) => {
  const { player1Id, player2Id } = req.body ?? {};
  if (!player1Id || !player2Id) {
    return res
      .status(400)
      .json({ error: "player1Id et player2Id sont requis" });
  }
  const session = createSession(player1Id, player2Id);
  res.json({ ...session, roundTimeLimitMs: ROUND_TIME_LIMIT_MS });
});

gameRouter.get("/session/:id", (req, res) => {
  const session = getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: "Session introuvable" });
  }
  res.json(session);
});

gameRouter.post("/session/:id/move", (req, res) => {
  const { playerId, move } = (req.body ?? {}) as {
    playerId?: string;
    move?: Move;
  };
  if (!playerId || !move) {
    return res.status(400).json({ error: "playerId et move sont requis" });
  }
  try {
    const result = submitMove(req.params.id, playerId, move);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});
