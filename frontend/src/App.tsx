//| **État** | `userChoice`, `aiChoice`, `result` | Variables qui déclenchent un re-rendu quand elles changent. |
//| **Fonction de mise à jour** | `setUserChoice`, `setAiChoice`, `setResult` | Fonctions pour modifier l'état. |
//| **Valeur initiale** | `null`, `""` | Valeur de départ de l'état. |

//ex: state = Ce qu'il y a dans la boîte (ex: "rock").
//setState = Une étiquette sur la boîte qui permet de changer son contenu.
//Chaque fois qu'on changes le contenu, React reconstruit l'interface pour refléter ce changement.

import { useState } from 'react';

// ------------------------ Données constantes --------------------------

function App() {
  // stocke le choix de l'utilisateur (rock/paper/scissors ou null)
  const [userChoice, setUserChoice] = useState<string | null>(null);
  // stocke le choix aléatoire de l'IA.
  const [aiChoice, setAiChoice] = useState<string | null>(null);
  // stocke le résultat de la partie ("égalité"/"victoire"/"défaite")
  const [result, setResult] = useState<string>("");

  const choices = ["rock", "paper", "scissors"];
  // Record<string, string> est un TypeScript qui signifie : "un objet dont les clés
  // et les valeurs sont des chaînes de caractères".
  const emojis: Record<string, string> = {
    rock: "🪨",
    paper: "📄",
    scissors: "✂️",
  };

  // ------------------------ Fonction handlePlay --------------------------
  // quelques explications pour le code ci-dessous
  // choice = paramètre passé quand on clique sur un bouton ("ex: rock")
  // on génère un choix aléatoire pour l'IA : random génère nb aléatoire entre 0 et 1.
  // * 3 : nombre entre 0 et 2.999 / math.floor : arrondit à l'entier inférieur (0, 1, 2)
  const handlePlay = (choice: string) => {
    setUserChoice(choice);
    const randomAiChoice = choices[Math.floor(Math.random() * 3)];
    setAiChoice(randomAiChoice);

    if (choice === randomAiChoice) {
      setResult("Égalité !");
    } else if (
      (choice === "rock" && randomAiChoice === "scissors") ||
      (choice === "paper" && randomAiChoice === "rock") ||
      (choice === "scissors" && randomAiChoice === "paper")
    ) {
      setResult("Tu as gagné ! 🎉");
    } else {
      setResult("Tu as perdu... 😢");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Pierre-Feuille-Ciseaux</h1>
      <div style={{ margin: "2rem" }}>  {/* ✅ Corrigé : espace en trop supprimé */}
        {choices.map((choice) => (     // boucle sur le tableau choices pour générer un bouton
          // pour chaque élément ("rock", "paper", "scissors").
          <button
            key={choice}  // obligatoire en React. Permet à React d'identifier chaque élément
            // de manière unique (pour optimiser maj).
            onClick={() => handlePlay(choice)}
            style={{ margin: "0.5rem", padding: "1rem", fontSize: "1.5rem" }}
          >
            {emojis[choice]}
          </button>
        ))}
      </div>
      {userChoice && aiChoice && (   // affichage conditionnel: bloc <div></div> n'est affiché que
        // si userChoice n'est pas null (càd après un clic sur un bouton). Donc si userChoice
        // est null, le bloc est pas affiché.
        <div>
          <p>Tu as choisi: {emojis[userChoice]}</p>
          <p>L'IA a choisi: {emojis[aiChoice]}</p>
          <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{result}</p>  {/* ✅ Corrigé : espace avant } supprimé */}
        </div>
      )}
    </div>
  );
}

// Export obligatoire pour que index.tsx puisse importer App
export default App;
