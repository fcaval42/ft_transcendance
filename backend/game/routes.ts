import { Router } from "express";
import {
  createSession,
  submitMove,
  attemptWell,
  getSession,
  endSession,
  endBotSessionsOfPlayer,
} from "./session";
import { Move } from "./rules";
import { ROUND_TIME_LIMIT_MS } from "./match";
import { getRandomBotName, getBotMove } from "./bot";

export const gameRouter = Router();

gameRouter.post("/session", async (req, res) => {
  const { player1Id, player2Id, vsBot } = req.body ?? {};
  if (!player1Id || (!player2Id && !vsBot)) {
    return res
      .status(400)
      .json({ error: "player1Id and (player2Id or vsBot) are required" });
  }
  if (vsBot) {
    await endBotSessionsOfPlayer(player1Id);
  }
  const session = await createSession(
    player1Id,
    vsBot ? getRandomBotName() : player2Id,
    undefined,
    Boolean(vsBot)
  );
  res.json({ ...session, roundTimeLimitMs: ROUND_TIME_LIMIT_MS });
});

gameRouter.delete("/session/:id", async (req, res) => {
  await endSession(req.params.id);
  res.json({ status: "ended" });
});

gameRouter.get("/session/:id", (req, res) => {
  const session = getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }
  res.json(session);
});

gameRouter.post("/session/:id/move", async (req, res) => {
  const { playerId, move, roundNumber } = (req.body ?? {}) as {
    playerId?: string;
    move?: Move;
    roundNumber?: number;
  };
  if (!playerId || !move) {
    return res.status(400).json({ error: "playerId and move are required" });
  }
  try {
    let result = await submitMove(req.params.id, playerId, move, roundNumber);

    const session = getSession(req.params.id);
    if (result.status === "waiting" && session?.isVsBot) {
      const botMove = getBotMove(session.match.rounds);
      result = await submitMove(req.params.id, session.player2Id, botMove);
    }

    res.json(result);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

gameRouter.post("/session/:id/well", async (req, res) => {
  const { playerId } = (req.body ?? {}) as { playerId?: string };
  if (!playerId) {
    return res.status(400).json({ error: "playerId est requis" });
  }
  try {
    const match = await attemptWell(req.params.id, playerId);
    res.json({ status: "round_played", match });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});
