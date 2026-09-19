import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { Header } from '../components/Header';
import { Modal } from "../components/Modal";

type Move = 'rock' | 'paper' | 'scissors';
type RoundResult = 'player1' | 'player2' | 'draw' | 'afk';
type Role = 'player1' | 'player2';

interface RoundOutcome {
  move1: Move | null;
  move2: Move | null;
  result: RoundResult;
}

interface Match {
  score1: number;
  score2: number;
  rounds: RoundOutcome[];
  status: 'playing' | 'finished';
  winner: Role | null;
  roundDeadline: number | null;
}

const ROUND_TIME_LIMIT_S = 5;

export const Pvp = () => {
  const [userChoice, setUserChoice] = useState<Move | null>(null);
  const [opponentChoice, setOpponentChoice] = useState<Move | null>(null);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>("Joueur 1");
  const [opponentName, setOpponentName] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [score1, setScore1] = useState<number>(0);
  const [score2, setScore2] = useState<number>(0);
  const [timeleft, setTimeLeft] = useState<number>(ROUND_TIME_LIMIT_S);
  const [error, setError] = useState<string>("");

  const socketRef = useRef<Socket | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const roleRef = useRef<Role | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = useNavigate();
  const choices: Move[] = ["rock", "paper", "scissors"];
  const emojis: Record<Move, string> = { rock: "🪨", paper: "📄", scissors: "✂️" };

  // Message affiché après une manche, du point de vue du joueur courant (role).
  const labelForResult = (roundResult: RoundResult, role: Role | null): string => {
    if (roundResult === "draw") return "Égalité !";
    if (roundResult === "afk") return "Personne n'a joué à temps...";
    if (!role) return "";
    return roundResult === role ? "Tu as gagné ! 🎉" : "Tu as perdu... 😢";
  };

  // Score du point de vue du joueur courant : score1 = moi, score2 = l'adversaire.
  const applyMatchState = (match: Match, role: Role) => {
    if (role === "player1") {
      setScore1(match.score1);
      setScore2(match.score2);
    } else {
      setScore1(match.score2);
      setScore2(match.score1);
    }
  };

  const stopVisualTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const startVisualTimer = (deadline: number | null) => {
    stopVisualTimer();
    if (deadline === null) {
      setTimeLeft(0);
      return;
    }
    const tick = () => {
      const remainingMs = deadline - Date.now();
      setTimeLeft(Math.max(0, Math.ceil(remainingMs / 1000)));
      if (remainingMs <= 0) stopVisualTimer();
    };
    tick();
    timerIntervalRef.current = setInterval(tick, 250);
  };

  // Prépare la connexion socket (une seule fois) et ses écouteurs.
  const ensureSocket = (pid: string): Socket => {
    if (socketRef.current) return socketRef.current;

    const socket = io();
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("rejoinSession", pid);
    });

    socket.on("waiting", () => {
      setIsSearching(true);
    });

    socket.on(
      "matched",
      (data: { sessionId: string; role: Role; selfName: string; opponentName: string; match: Match }) => {
        sessionIdRef.current = data.sessionId;
        roleRef.current = data.role;
        setPlayerName(data.selfName);
        setOpponentName(data.opponentName);
        setUserChoice(null);
        setOpponentChoice(null);
        setResult("");
        setError("");
        applyMatchState(data.match, data.role);
        setShowModal(false);
        setIsSearching(false);
        setGameStarted(true);
        startVisualTimer(data.match.roundDeadline);
      }
    );

    // Reprise d'une partie déjà en cours (reconnexion), sans passer par les modals.
    socket.on(
      "rejoined",
      (data: { sessionId: string; role: Role; selfName: string; opponentName: string; match: Match }) => {
        sessionIdRef.current = data.sessionId;
        roleRef.current = data.role;
        setPlayerName(data.selfName);
        setOpponentName(data.opponentName);
        setUserChoice(null);
        setOpponentChoice(null);
        setResult("");
        setError("");
        applyMatchState(data.match, data.role);
        setShowModal(false);
        setIsSearching(false);
        setGameStarted(true);
        startVisualTimer(data.match.roundDeadline);
      }
    );

    socket.on("roundResult", (data: { match: Match }) => {
      const lastRound = data.match.rounds[data.match.rounds.length - 1];
      const role = roleRef.current;
      const myMove = role === "player1" ? lastRound.move1 : lastRound.move2;
      const oppMove = role === "player1" ? lastRound.move2 : lastRound.move1;

      setUserChoice(myMove);
      setOpponentChoice(oppMove);
      setLoading(false);
      stopVisualTimer();
      if (role) applyMatchState(data.match, role);

      if (data.match.status === "finished") {
        sessionIdRef.current = null;
        const finalMessage =
          data.match.winner === null
            ? "Match interrompu."
            : data.match.winner === role
            ? "Tu as gagné la partie ! 🏆"
            : "Tu as perdu la partie... 😢";
        setResult(finalMessage);
        redirectTimeoutRef.current = setTimeout(() => navigate("/menu"), 2500);
      } else {
        setResult(labelForResult(lastRound.result, role));
        startVisualTimer(data.match.roundDeadline);
      }
    });

    socket.on("queueError", (message: string) => {
      setError(message);
      setIsSearching(false);
    });

    socket.on("moveError", (message: string) => {
      setError(message);
      setLoading(false);
    });

    return socket;
  };

  // Au chargement, on récupère l'utilisateur connecté (cookie de session)
  // pour son id et son pseudo, nécessaires pour créer/rejoindre une partie.
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        if (res.ok) {
          const user = await res.json();
          setPlayerName(user.username);
          setPlayerId(user.id);
        }
      } catch {}
    };
    fetchUser();
  }, []);

  // Se connecte dès que le profil est chargé, pas seulement au clic sur
  // "Commencer" : ça déclenche la tentative de reprise d'une partie en cours
  // (voir "rejoinSession" ci-dessus)
  useEffect(() => {
    if (playerId) ensureSocket(playerId);
  }, [playerId]);

  // Nettoyage à la sortie de la page.
  useEffect(() => {
    return () => {
      stopVisualTimer();
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
      socketRef.current?.disconnect();
    };
  }, []);

  // Actions
  const startGame = () => {
    if (!playerId) {
      setError("Profil non chargé, réessaie dans un instant.");
      return;
    }
    setError("");
    setShowModal(false);
    setIsSearching(true);
    const socket = ensureSocket(playerId);
    socket.emit("joinQueue", playerId);
  };

  const handlePlay = (choice: Move) => {
    if (!playerId || !sessionIdRef.current) return;

    stopVisualTimer();
    setUserChoice(choice);
    setOpponentChoice(null);
    setResult("");
    setError("");
    setLoading(true);

    socketRef.current?.emit("playMove", {
      sessionId: sessionIdRef.current,
      playerId,
      move: choice,
    });
  };

  const handleGoHome = () => {
    stopVisualTimer();
    if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    if (isSearching) socketRef.current?.emit("leaveQueue");
    socketRef.current?.disconnect();
    socketRef.current = null;
    navigate("/menu");
  };


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <Header />

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded max-w-md">{error}</div>
      )}

      {/* MODAL DÉBUT */}
      <Modal isOpen={showModal} onClose={() => {}} title="🎮 Prêt à jouer ?"
        footer={
          <div className="flex flex-col gap-6">
            <button onClick={startGame}
              className="bg-fuchsia-300 hover:bg-fuchsia-400 text-white px-12 py-4 rounded-xl text-2xl font-bold transition-all transform hover:scale-105 shadow-lg">
              Commencer !
            </button>
            <button onClick={handleGoHome}
              className="bg-emerald-400 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold">
              Retour au menu
            </button>
          </div>
        }>
        <p className="text-xl text-gray-600">
          {playerName} <span className="font-bold">vs</span> {opponentName ?? "un adversaire"}
        </p>
      </Modal>

      {/* MODAL RECHERCHE */}
      <Modal isOpen={isSearching} onClose={() => {}} title="🔍 Recherche..."
        footer={
          <button onClick={handleGoHome}
            className="bg-emerald-400 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold">
            Retour au menu
          </button>
        }>
        <p className="text-xl text-gray-600">Recherche d'un adversaire...</p>
      </Modal>

      {gameStarted && (
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Pierre-Feuille-Ciseaux</h1>

          <div className="flex justify-between mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
            <div className="text-center">
              <div className="font-bold text-lg">{playerName}</div>
              <div className="text-3xl font-bold text-blue-600">{score1}</div>
            </div>
            <div className="text-2xl">vs</div>
            <div className="text-center">
              <div className="font-bold text-lg">{opponentName ?? "Adversaire"}</div>
              <div className="text-3xl font-bold text-red-600">{score2}</div>
            </div>
          </div>

          <div className="text-xl font-medium mb-6 p-2 bg-orange-50 rounded-lg">
            ⏳ Temps restant : <span className="font-bold">{timeleft}s</span>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            {choices.map(choice => (
              <button key={choice} onClick={() => handlePlay(choice)} disabled={loading}
                className="w-20 h-20 text-4xl bg-orange-300 text-white rounded-lg hover:bg-orange-400 transition-colors disabled:opacity-50 flex items-center justify-center">
                {emojis[choice]}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-xl text-gray-600">L'adversaire choisit...</p>
          ) : userChoice && opponentChoice ? (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-xl">Tu as choisi : <span className="text-2xl">{emojis[userChoice]}</span></p>
              <p className="text-xl">{opponentName ?? "Adversaire"} a choisi : <span className="text-2xl">{emojis[opponentChoice]}</span></p>
              <p className="text-2xl font-bold text-orange-800 mt-2">{result}</p>
            </div>
          ) : result ? (
            <p className="text-2xl font-bold text-orange-800 mt-2">{result}</p>
          ) : null}

          <button onClick={handleGoHome} className="mt-6 bg-emerald-400 text-white px-4 py-2 rounded hover:bg-emerald-500 transition-colors">
            Retour au menu
          </button>
        </div>
      )}
    </div>
  );
};
