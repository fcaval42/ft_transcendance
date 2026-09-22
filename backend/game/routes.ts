import { Router } from "express";
import { createSession, submitMove, getSession } from "./session";
import { Move } from "./rules";
import { ROUND_TIME_LIMIT_MS } from "./match";
import { getRandomBotName, getBotMove } from "./bot";
import { useTranslation } from "react-i18next";

export const gameRouter = Router();
const { t } = useTranslation();

gameRouter.post("/session", async (req, res) => {
  const { player1Id, player2Id, vsBot } = req.body ?? {};
  if (!player1Id || (!player2Id && !vsBot)) {
    return res
      .status(400)
      .json({ error: t("matchmaking.playerRequired") });
  }
  const session = await createSession(
    player1Id,
    vsBot ? getRandomBotName() : player2Id,
    undefined,
    Boolean(vsBot)
  );
  res.json({ ...session, roundTimeLimitMs: ROUND_TIME_LIMIT_MS });
});

gameRouter.get("/session/:id", (req, res) => {
  const session = getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: t("matchmaking.sessionMissing") });
  }
  res.json(session);
});

gameRouter.post("/session/:id/move", async (req, res) => {
  const { playerId, move } = (req.body ?? {}) as {
    playerId?: string;
    move?: Move;
  };
  if (!playerId || !move) {
    return res.status(400).json({ error: t("matchmaking.errorMiss") });
  }
  try {
    let result = await submitMove(req.params.id, playerId, move);

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
