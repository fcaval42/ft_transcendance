//| **État** | `userChoice`, `aiChoice`, `result` | Variables qui déclenchent un re-rendu quand elles changent. |
//| **Fonction de mise à jour** | `setUserChoice`, `setAiChoice`, `setResult` | Fonctions pour modifier l'état. |
//| **Valeur initiale** | `null`, `""` | Valeur de départ de l'état. |

//ex: state = Ce qu'il y a dans la boîte (ex: "rock").
//setState = Une étiquette sur la boîte qui permet de changer son contenu.
//Chaque fois qu'on changes le contenu, React reconstruit l'interface pour refléter ce changement.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // pour naviguer vers d'autres pages
import { Header } from '../components/Header';

export const Game = () => {

// stocke le choix de l'utilisateur (rock/paper/scissors ou null)
  const [userChoice, setUserChoice] = useState<string | null>(null);
// stocke le choix aléatoire de l'IA.
  const [aiChoice, setAiChoice] = useState<string | null>(null);
// stocke le résultat de la partie ("égalité"/"victoire"/"défaite")
  const [result, setResult] = useState<string>("");

  // état pour afficher un message de chargement
  const [loading, setLoading] = useState<boolean>(false);

  // id de l'utilisateur connecté, récupéré depuis le back (nécessaire pour jouer une partie)
  const [playerId, setPlayerId] = useState<string | null>(null);
  // id de la session de jeu en cours côté back (on la réutilise tant que le match n'est pas fini)
  const [sessionId, setSessionId] = useState<string | null>(null);
  // message d'erreur réseau éventuel
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  // Au chargement de la page, on récupère l'utilisateur connecté (cookie de session)
  // pour connaître son id, nécessaire pour créer une partie côté back.
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/me", { credentials: "include" });
        if (!response.ok) throw new Error();
        const user = await response.json();
        setPlayerId(user.id);
      } catch {
        setError("Impossible de récupérer ton profil.");
      }
    };
    fetchUser();
  }, []);

  const choices = ["rock", "paper", "scissors"];

// Record<string, string> est un TypeScript qui signifie : "un objet dont les clés
// et les valeurs sont des chaînes de caractères".
  const emojis: Record<string, string> = {
    rock: "🪨",
    paper: "📄",
    scissors: "✂️",
  };


  // -------------------------------------------------------------------------
  // Traduit le résultat renvoyé par le back en message affiché à l'écran.
  const resultLabels: Record<string, string> = {
    player1: "Tu as gagné ! 🎉",
    player2: "Tu as perdu... 😢",
    draw: "Égalité !",
    afk: "Pas de coup joué à temps...",
  };

  // Crée une nouvelle partie contre le bot côté back et retourne son id.
  const createBotSession = async (pid: string): Promise<string> => {
    const response = await fetch("/api/game/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ player1Id: pid, vsBot: true }),
    });
    if (!response.ok) throw new Error("Impossible de créer la partie.");
    const session = await response.json();
    setSessionId(session.id);
    return session.id;
  };

  // -------------------------------------------------------------------------
  // appelée quand l'utilisateur clique sur un bouton. Envoie le coup au back
  // (le bot répond automatiquement) et affiche le résultat de la manche.
  const handlePlay = async (choice: string) => {
    if (!playerId) {
      setError("Profil non chargé, réessaie dans un instant.");
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
        body: JSON.stringify({ playerId, move: choice }),
      });
      if (!response.ok) throw new Error("Le coup n'a pas pu être joué.");
      const data = await response.json();

      const lastRound = data.match.rounds[data.match.rounds.length - 1];
      setAiChoice(lastRound.move2);
      setResult(resultLabels[lastRound.result] ?? "");

      // Le match (en 3 manches gagnantes côté back) est terminé : la prochaine
      // partie en recréera une nouvelle automatiquement.
      if (data.match.status === "finished") {
        setSessionId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la partie.");
      setSessionId(null);
    } finally {
      setLoading(false);
    }
  };


  // -------------------------------------------------------------------------
  // Fonction pour retourner à l'accueil
  const handleGoHome = () => {
	navigate("/menu"); // redirige vers la page d'accueil
  };

  // -------------------------------------------------------------------------
  return (
	    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">

      <Header />

      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Pierre-Feuille-Ciseaux
        </h1>

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
          <p className="text-xl text-gray-600">Chargement...</p>
        ) : userChoice && aiChoice ? (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-xl">
              Tu as choisi : <span className="text-2xl">{emojis[userChoice]}</span>
            </p>
            <p className="text-xl">
              L'IA a choisi : <span className="text-2xl">{emojis[aiChoice]}</span>
            </p>
            <p className="text-2xl font-bold text-orange-800 mt-2">{result}</p>
          </div>
        ) : null}

        <button
          onClick={handleGoHome}
          className="mt-6 bg-emerald-400 text-white px-4 py-2 rounded hover:bg-emerald-500 transition-colors"
        >
          Retour au menu
        </button>
      </div>
    </div>
  );
};

//Style avec Tailwind
//min-h-screen : Hauteur minimale de 100% de la hauteur de l'écran.
//bg-gray-100 : Fond gris clair.
//flex flex-col items-center justify-center : Centre le contenu verticalement et horizontalement.
//w-20 h-20 : Largeur et hauteur de 5rem (20 = 5rem en échelle Tailwind).
//bg-blue-500 : Fond bleu moyen.
//hover:bg-blue-600 : Fond bleu foncé au survol.
//transition-colors : Animation fluide pour les changements de couleur.
