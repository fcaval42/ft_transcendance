import { Router } from "express";
import { createSession, submitMove, getSession } from "./session";
import { Move } from "./rules";
import { ROUND_TIME_LIMIT_MS } from "./match";
import { BOT_PLAYER_ID, getBotMove, BotDifficulty } from "./bot";

export const gameRouter = Router();

const BOT_DIFFICULTIES: BotDifficulty[] = ["easy", "medium", "hard"];

gameRouter.post("/session", (req, res) => {
  const { player1Id, player2Id, vsBot, botDifficulty } = req.body ?? {};
  if (!player1Id || (!player2Id && !vsBot)) {
    return res
      .status(400)
      .json({ error: "player1Id et (player2Id ou vsBot) sont requis" });
  }
  if (botDifficulty !== undefined && !BOT_DIFFICULTIES.includes(botDifficulty)) {
    return res
      .status(400)
      .json({ error: "botDifficulty doit être 'easy', 'medium' ou 'hard'" });
  }
  const session = createSession(
    player1Id,
    vsBot ? BOT_PLAYER_ID : player2Id,
    undefined,
    Boolean(vsBot),
    botDifficulty
  );
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
    let result = submitMove(req.params.id, playerId, move);

    const session = getSession(req.params.id);
    if (result.status === "waiting" && session?.isVsBot) {
      const botMove = getBotMove(session.botDifficulty, session.match.rounds);
      result = submitMove(req.params.id, BOT_PLAYER_ID, botMove);
    }

    res.json(result);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});
