//| **État** | `userChoice`, `aiChoice`, `result` | Variables qui déclenchent un re-rendu quand elles changent. |
//| **Fonction de mise à jour** | `setUserChoice`, `setAiChoice`, `setResult` | Fonctions pour modifier l'état. |
//| **Valeur initiale** | `null`, `""` | Valeur de départ de l'état. |

//ex: state = Ce qu'il y a dans la boîte (ex: "rock").
//setState = Une étiquette sur la boîte qui permet de changer son contenu.
//Chaque fois qu'on changes le contenu, React reconstruit l'interface pour refléter ce changement.

import { userState } from 'react';

// ------------------------ Données constantes --------------------------

// stocke le choix de l'utilisateur (rock/paper/scissors ou null)
const [userChoice, setUserChoice] = userState<string | null>(null);
// stocke le choix aléatoire de l'IA.

const [aiChoice, setAiChoice] = userState<string | null>(null);

// stocke le résultat de la partie ("égalité"/"victoire"/"défaite")
const [result, setResult] = userState<string>("");

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
// on génère un choix aléatoire pour l'IA : random génère nb aléatoire entre 0 et 1. /
// * 3 : nombre entre 0 et 2.999 / math.floor : arrondit à l'entier inférieur (0, 1, 2) /
const handlePlay = (choice: string) => {
  setUserChoice(choice);
  const randomAiChoice = choices[Math.floor(Math.random() * 3)];
  setAiChoice(randomAiChoice);

  if (choice == randomAiChoice) {
    setResult("Egalité !");
  } else if (
    (choice === "rock" && randomAiChoice === "scissors")
    ||
    (choice === "paper" && randomAiChoice === "rock")
    ||
    (choice === "scissors" && randomAiChoice === "paper")
  ) {
    setResult("Tu as gagné ! 🎉");
  } else {
    setResult("Tu as perdu... 😢");
  }
};

return (
  
)
