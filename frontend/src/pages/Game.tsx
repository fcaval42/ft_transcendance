import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Modal } from "../components/Modal";

export const Game = () => {
  const { t } = useTranslation();

  const [userChoice, setUserChoice] = useState<string | null>(null);
  const [aiChoice, setAiChoice] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [score1, setScore1] = useState<number>(0);
  const [score2, setScore2] = useState<number>(0);
  const [roundCount, setRoundCount] = useState<number>(0);

  const [playerName, setPlayerName] = useState<string>("Joueur 1");
  const [botName, setBotName] = useState<string>("Bot");

  const [showModal, setShowModal] = useState<boolean>(true);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [showEndModal, setShowEndModal] = useState<boolean>(false);
  const [finalResult, setFinalResult] = useState<string>("");

  const navigate = useNavigate();

  const resetGame = async () => {
  if (!playerId) return;

  setShowEndModal(false);
  setGameStarted(false);
  setShowModal(true);
  setScore1(0);
  setScore2(0);
  setResult("");
  setUserChoice(null);
  setAiChoice(null);
  setRoundCount(0);
};

  const handleGoHomeFromEnd = () => {
    setShowEndModal(false);
    setGameStarted(false);
    navigate("/menu");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/me", { credentials: "include" });
        if (!response.ok) throw new Error();
        const user = await response.json();
        setPlayerId(user.id);
        setPlayerName(user.username);
      } catch {
        setError("Impossible de récupérer ton profil.");
      }
    };
    fetchUser();

    return () => {};
  }, []);

  const choices = ["rock", "paper", "scissors"];

  const emojis: Record<string, string> = {
    rock: "🪨",
    paper: "📄",
    scissors: "✂️",
  };

  const resultLabels: Record<string, string> = {
    player1: t("gameVsBot.win"),
    player2: t("gameVsBot.lose"),
    draw: t("gameVsBot.draw"),
    afk: t("gameVsBot.time"),
  };

  const createBotSession = async (pid: string): Promise<string> => {
    const response = await fetch("/api/game/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ player1Id: pid, vsBot: true }),
    });
    if (!response.ok) throw new Error(t("error.create") as string);
    const session = await response.json();
    setSessionId(session.id);
    setBotName(session.player2Name);
    return session.id;
  };

  const startGame = async () => {
    if(!playerId) return;

    try {
      await createBotSession(playerId);
      setShowModal(false);
      setGameStarted(true);
    } catch (err) {
      setError(t("error.start") as string);
    }
  };

  const handlePlay = async (choice: string) => {
    if (!playerId) {
      setError(t("error.load") as string);
      return;
    }

    setUserChoice(choice);
    setAiChoice(null);
    setError("");
    setLoading(true);

    try {
      const currentSessionId = sessionId ?? (await createBotSession(playerId));

      const response = await fetch(`/api/game/session/${currentSessionId}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ playerId, move: choice, roundNumber: roundCount + 1 }),
      });
      if (!response.ok) throw new Error(t("error.play") as string);
      const data = await response.json();

      const lastRound = data.match.rounds[data.match.rounds.length - 1];
      setAiChoice(lastRound.move2);
      setResult(resultLabels[lastRound.result] ?? "");
      setScore1(data.match.score1);
      setScore2(data.match.score2);
      setRoundCount(data.match.rounds.length);

      if (data.match.status === "finished") {
        setSessionId(null);
          if (data.match.score1 > data.match.score2) {
        setFinalResult("🎉 " + t("popUpWin.message"));
      } else if (data.match.score1 < data.match.score2) {
        setFinalResult("😢 " + t("popUpLose.message"));
      }
      setShowEndModal(true);
    }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error.game") as string);
      setSessionId(null);
      setRoundCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
	if (sessionId) {
	  fetch(`/api/game/session/${sessionId}`, {
	    method: "DELETE",
	    credentials: "include",
	  }).catch(() => {});
	  setSessionId(null);
	}
	navigate("/menu");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center p-4 pt-20">
      <Modal
        isOpen={showModal && playerName !== t("error.player")}
        onClose={() => {}}
        title={"🎮 " + t("popUpVsBot.ready")}
        footer={
          <div className="flex flex-col gap-6">
            <button
              onClick={startGame}
              className="bg-fuchsia-300 hover:bg-fuchsia-400 text-white px-12 py-4 rounded-xl text-2xl font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              {t("popUpVsBot.start")}
            </button>
            <button
              onClick={handleGoHome}
              className="bg-emerald-400 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold"
            >
              {t("popUpVsBot.cancel")}
            </button>
          </div>
        }
      >
        <p className="text-xl text-gray-600">
          {playerName} <span className="font-bold">vs</span> {botName || "Bot"}
        </p>
      </Modal>

      <Modal
        isOpen={showEndModal}
        onClose={() => {}}
        title={t("popUpWin.title")}
        footer={
          <>
            <button
              onClick={resetGame}
              className="bg-fuchsia-300 hover:bg-fuchsia-400 text-white px-6 py-2 rounded-lg font-bold"
            >
              {t("popUpWin.playAgain")}
            </button>
            <button
              onClick={handleGoHomeFromEnd}
              className="bg-emerald-400 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold"
            >
              {t("popUpWin.backToMenu")}
            </button>
          </>
        }
      >
        <p className="text-xl">{finalResult}</p>
        <p className="text-lg mt-2">
          {t("popUpWin.score")} <span className="font-bold text-blue-600">{score1}</span> - <span className="font-bold text-red-600">{score2}</span>
        </p>
      </Modal>

      {gameStarted && (
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            {t("gameVsBot.title")}
          </h1>

          <div className="flex justify-between mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
            <div className="text-center">
              <div className="font-bold text-lg">{playerName}</div>
              <div className="text-3xl font-bold text-blue-600">{score1}</div>
            </div>
            <div className="text-2xl">vs</div>
            <div className="text-center">
              <div className="font-bold text-lg">{botName}</div>
              <div className="text-3xl font-bold text-red-600">{score2}</div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            {choices.map((choice) => (
              <button
                key={choice}
                onClick={() => handlePlay(choice)}
                disabled={loading}
                className="w-20 h-20 text-4xl bg-orange-300 text-white rounded-lg hover:bg-orange-400 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {emojis[choice]}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
          )}

          {loading ? (
            <p className="text-xl text-gray-600">{t("gameVsBot.loading")}</p>
          ) : userChoice && aiChoice ? (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-xl">
                {t("gameVsBot.yourChoice")} <span className="text-2xl">{emojis[userChoice]}</span>
              </p>
              <p className="text-xl">
                {t("gameVsBot.botChoice")} <span className="text-2xl">{emojis[aiChoice]}</span>
              </p>
              <p className="text-2xl font-bold text-orange-800 mt-2">{result}</p>
            </div>
          ) : null}

          <button
            onClick={handleGoHome}
            className="mt-6 bg-emerald-400 text-white px-4 py-2 rounded hover:bg-emerald-500 transition-colors"
          >
            {t("gameVsBot.leave")}
          </button>
        </div>
      )}
      </main>
      <Footer />
    </div>
  );
};
