import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Modal } from "../components/Modal";

export const Pvp = () => {
  const [userChoice, setUserChoice] = useState<string | null>(null);
  const [opponentChoice, setOpponentChoice] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>("Joueur 1");
  const [opponentName] = useState<string>("Adversaire");
  const [showModal, setShowModal] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [score1, setScore1] = useState<number>(0);
  const [score2, setScore2] = useState<number>(0);
  const [timeleft, setTimeLeft] = useState<number>(5);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();
  const choices = ["rock", "paper", "scissors"];
  const emojis: Record<string, string> = { rock: "🪨", paper: "📄", scissors: "✂️" };
  const resultLabels: Record<string, string> = {
    win: "Tu as gagné ! 🎉",
    lose: "Tu as perdu... 😢",
    draw: "Égalité !",
  };

  // Simule le choix de l'adversaire
  const getRandomChoice = () => choices[Math.floor(Math.random() * choices.length)];

  // Calcule le résultat localement et retourne aussi le gagnant pour les scores
  const calculateResult = (user: string, opponent: string): { result: string; winner: 'user' | 'opponent' | 'draw' } => {
    if (user === opponent) return { result: "draw", winner: "draw" };
    if (
      (user === "rock" && opponent === "scissors") ||
      (user === "paper" && opponent === "rock") ||
      (user === "scissors" && opponent === "paper")
    ) return { result: "win", winner: "user" };
    return { result: "lose", winner: "opponent" };
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        if (res.ok) {
          const user = await res.json();
          setPlayerName(user.username);
        }
      } catch {}
    };
    fetchUser();

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, []);

  // Actions
  const startGame = () => {
    setShowModal(false);
    setIsSearching(true);
    
    // Simule la recherche d'adversaire (2 secondes pour le test)
    setTimeout(() => {
      setIsSearching(false);
      setGameStarted(true);
      
      setTimeLeft(5);
      const newTimerId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(newTimerId);
            setTimerId(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimerId(newTimerId);
    }, 2000);
  };

  const handlePlay = (choice: string) => {
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }

    setUserChoice(choice);
    setLoading(true);

    setTimeout(() => {
      const oppChoice = getRandomChoice();
      setOpponentChoice(oppChoice);
      
      const { result, winner } = calculateResult(choice, oppChoice);
      setResult(resultLabels[result]);
      
      if (winner === "user") {
        setScore1(prev => prev + 1);
      } else if (winner === "opponent") {
        setScore2(prev => prev + 1);
      }
      
      setLoading(false);
      
      setTimeLeft(5);
      const newTimerId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(newTimerId);
            setTimerId(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimerId(newTimerId);
    }, 1000);
  };

  const handleGoHome = () => {
    if (timerId) {
      clearInterval(timerId);
    }
    navigate("/menu");
  };


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <Header />

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
          {playerName} <span className="font-bold">vs</span> {opponentName}
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
              <div className="font-bold text-lg">{opponentName}</div>
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
              <p className="text-xl">{opponentName} a choisi : <span className="text-2xl">{emojis[opponentChoice]}</span></p>
              <p className="text-2xl font-bold text-orange-800 mt-2">{result}</p>
            </div>
          ) : null}

          <button onClick={handleGoHome} className="mt-6 bg-emerald-400 text-white px-4 py-2 rounded hover:bg-emerald-500 transition-colors">
            Retour au menu
          </button>
        </div>
      )}
    </div>
  );
};