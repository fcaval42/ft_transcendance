//| **État** | `userChoice`, `aiChoice`, `result` | Variables qui déclenchent un re-rendu quand elles changent. |
//| **Fonction de mise à jour** | `setUserChoice`, `setAiChoice`, `setResult` | Fonctions pour modifier l'état. |
//| **Valeur initiale** | `null`, `""` | Valeur de départ de l'état. |

//ex: state = Ce qu'il y a dans la boîte (ex: "rock").
//setState = Une étiquette sur la boîte qui permet de changer son contenu.
//Chaque fois qu'on changes le contenu, React reconstruit l'interface pour refléter ce changement.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // pour naviguer vers d'autres pages
import { LogoutButton } from '../components/LougoutButton';

export const Game = () => {

// stocke le choix de l'utilisateur (rock/paper/scissors ou null)
  const [userChoice, setUserChoice] = useState<string | null>(null);
// stocke le choix aléatoire de l'IA.
  const [aiChoice, setAiChoice] = useState<string | null>(null);
// stocke le résultat de la partie ("égalité"/"victoire"/"défaite")
  const [result, setResult] = useState<string>("");

  // état pour afficher un message de chargement
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const choices = ["rock", "paper", "scissors"];

// Record<string, string> est un TypeScript qui signifie : "un objet dont les clés
// et les valeurs sont des chaînes de caractères".
  const emojis: Record<string, string> = {
    rock: "🪨",
    paper: "📄",
    scissors: "✂️",
  };


  // -------------------------------------------------------------------------
// Fonction pour simuler le backend (à remplacer par un appel API plus tard)
  const simulateBackend = (userChoice: string) => {
    const aiChoice = choices[Math.floor(Math.random() * 3)];

    let result;
    if (userChoice === aiChoice) {
      result = "Égalité !";
    } else if (
      (userChoice === "rock" && aiChoice === "scissors") ||
      (userChoice === "paper" && aiChoice === "rock") ||
      (userChoice === "scissors" && aiChoice === "paper")
    ) {
      result = "Tu as gagné ! 🎉";
    } else {
      result = "Tu as perdu... 😢";
    }

    return { aiChoice, result };
  };


  // -------------------------------------------------------------------------
// appelée quand l'utilisateur clique sur un bouton. Maj les états et simule un délai
// pour imiter un appel API.
  const handlePlay = (choice: string) => {
	setUserChoice(choice);
	setLoading(true);

	setTimeout(() => {
		const { aiChoice, result } = simulateBackend(choice);
		setAiChoice(aiChoice);
		setResult(result);
		setLoading(false);
	}, 1000); // délai pour simuler appel API (enlevé plus tard)
  };


  // -------------------------------------------------------------------------
  // Fonction pour retourner à l'accueil
  const handleGoHome = () => {
	navigate("/Menu"); // redirige vers la page d'accueil
  };

  // -------------------------------------------------------------------------
  return (
	    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">

      <LogoutButton />

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
