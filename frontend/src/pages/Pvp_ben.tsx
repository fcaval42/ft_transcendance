import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // pour naviguer vers d'autres pages
import { io, Socket } from 'socket.io-client';

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
}

export const Pvp = () => {

  // stocke le choix de l'utilisateur (rock/paper/scissors ou null)
  const [userChoice, setUserChoice] = useState<Move | null>(null);
  // stocke le choix de l'adversaire.
  const [opponentChoice, setOpponentChoice] = useState<Move | null>(null);
  // stocke le résultat de la partie ("égalité"/"victoire"/"défaite")
  const [result, setResult] = useState<string>("");

  // état pour afficher un message de chargement (recherche d'adversaire OU
  // attente que l'adversaire ait joué son coup)
  const [loading, setLoading] = useState<boolean>(false);

  // id de l'utilisateur connecté, récupéré depuis le back (nécessaire pour jouer une partie)
  const [playerId, setPlayerId] = useState<string | null>(null);
  // message d'erreur réseau éventuel
  const [error, setError] = useState<string>("");

  // infos sur la partie en cours, remplies dès qu'un adversaire est trouvé
  // (événement "matched"), puis tenues à jour à chaque manche.
  const [selfName, setSelfName] = useState<string | null>(null);
  const [opponentName, setOpponentName] = useState<string | null>(null);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [score, setScore] = useState<{ self: number; opponent: number }>({ self: 0, opponent: 0 });

  // connexion Socket.io et infos de la partie en cours. On utilise des refs
  // (et pas useState) car elles sont lues à l'intérieur des écouteurs
  // Socket.io enregistrés une seule fois : un useState y serait "figé" à sa
  // valeur du moment de l'enregistrement (piège classique des closures React).
  const socketRef = useRef<Socket | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const roleRef = useRef<Role | null>(null);
  const pendingMoveRef = useRef<Move | null>(null);
  // délai avant redirection au menu une fois la partie finie, pour laisser
  // le temps au joueur de voir le résultat final.
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Se connecte dès que le profil est chargé, pas seulement au premier clic
  // sur un coup : ça déclenche la tentative de reconnexion à une partie en
  // cours (voir "rejoinSession" plus bas) le plus tôt possible, par exemple
  // juste après un rechargement de page suite à une coupure réseau.
  useEffect(() => {
    if (playerId) ensureSocket(playerId);
  }, [playerId]);

  // Coupe la connexion socket si on quitte la page.
  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    };
  }, []);

  const choices: Move[] = ["rock", "paper", "scissors"];

  const emojis: Record<Move, string> = {
    rock: "🪨",
    paper: "📄",
    scissors: "✂️",
  };

  // -------------------------------------------------------------------------
  // Traduit le résultat renvoyé par le back en message affiché à l'écran,
  // du point de vue du joueur courant (role).
  const labelForResult = (roundResult: RoundResult, role: Role | null): string => {
    if (roundResult === "draw") return "Égalité !";
    if (roundResult === "afk") return "Pas de coup joué à temps...";
    return roundResult === role ? "Tu as gagné ! 🎉" : "Tu as perdu... 😢";
  };

  // Déduit le numéro de round en cours (ou final si la partie est finie) et
  // le score du point de vue du joueur courant (role) à partir du match
  // renvoyé par le back.
  const applyMatchState = (match: Match, role: Role) => {
    const playedRounds = match.rounds.length;
    setRoundNumber(match.status === "finished" ? playedRounds : playedRounds + 1);
    setScore(
      role === "player1"
        ? { self: match.score1, opponent: match.score2 }
        : { self: match.score2, opponent: match.score1 }
    );
  };

  // Prépare la connexion socket (une seule fois) et ses écouteurs.
  const ensureSocket = (pid: string): Socket => {
    if (socketRef.current) return socketRef.current;

    const socket = io();
    socketRef.current = socket;

    // À chaque connexion (initiale, ou reconnexion automatique de
    // Socket.io après une coupure réseau), on prévient le back qu'on
    // revient. S'il n'y a pas de partie en cours pour ce joueur, le back ne
    // fait rien (voir "rejoinSession" dans matchmaking.ts) : c'est donc
    // aussi bien le cas normal (première connexion) que le cas de
    // reconnexion.
    socket.on("connect", () => {
      socket.emit("rejoinSession", pid);
    });

    // Confirmation explicite du back qu'on est en attente d'un adversaire
    // (pas encore de match trouvé). `loading` est déjà mis à true côté
    // client au clic, mais cet événement est la source de vérité côté
    // serveur (utile par ex. si joinQueue échoue avant d'y arriver).
    socket.on("waiting", () => {
      setLoading(true);
    });

    socket.on(
      "matched",
      (data: {
        sessionId: string;
        role: Role;
        selfName: string;
        opponentName: string;
        match: Match;
      }) => {
        sessionIdRef.current = data.sessionId;
        roleRef.current = data.role;
        setSelfName(data.selfName);
        setOpponentName(data.opponentName);
        applyMatchState(data.match, data.role);

        if (pendingMoveRef.current) {
          socket.emit("playMove", {
            sessionId: data.sessionId,
            playerId: pid,
            move: pendingMoveRef.current,
          });
          pendingMoveRef.current = null;
        }
      }
    );

    // Reprise d'une partie en cours après une reconnexion (voir le listener
    // "connect" plus haut) : on restaure l'état affiché à l'écran, comme
    // pour "matched", mais sans coup en attente à rejouer.
    socket.on(
      "rejoined",
      (data: {
        sessionId: string;
        role: Role;
        selfName: string;
        opponentName: string;
        match: Match;
      }) => {
        sessionIdRef.current = data.sessionId;
        roleRef.current = data.role;
        setSelfName(data.selfName);
        setOpponentName(data.opponentName);
        setError("");
        applyMatchState(data.match, data.role);
      }
    );

    socket.on("roundResult", (data: { match: Match }) => {
      const lastRound = data.match.rounds[data.match.rounds.length - 1];
      const role = roleRef.current;
      const oppMove = role === "player1" ? lastRound.move2 : lastRound.move1;
      setOpponentChoice(oppMove);
      setResult(labelForResult(lastRound.result, role));
      setLoading(false);
      if (role) applyMatchState(data.match, role);

      if (data.match.status === "finished") {
        sessionIdRef.current = null;
        redirectTimeoutRef.current = setTimeout(() => navigate("/Menu"), 2500);
      }
    });

    socket.on("queueError", (message: string) => {
      setError(message);
      setLoading(false);
    });

    socket.on("moveError", (message: string) => {
      setError(message);
      setLoading(false);
    });

    return socket;
  };

  // -------------------------------------------------------------------------
  // appelée quand l'utilisateur clique sur un bouton. Rejoint le matchmaking
  // si besoin (le coup sera joué dès qu'un adversaire est trouvé), sinon
  // envoie directement le coup à la partie en cours.
  const handlePlay = (choice: Move) => {
    if (!playerId) {
      setError("Profil non chargé, réessaie dans un instant.");
      return;
    }

    setUserChoice(choice);
    setOpponentChoice(null);
    setError("");
    setLoading(true);

    const socket = ensureSocket(playerId);

    if (sessionIdRef.current) {
      socket.emit("playMove", { sessionId: sessionIdRef.current, playerId, move: choice });
    } else {
      // Nouvelle recherche d'adversaire : on repart d'un état propre.
      setSelfName(null);
      setOpponentName(null);
      setRoundNumber(1);
      setScore({ self: 0, opponent: 0 });
      pendingMoveRef.current = choice;
      socket.emit("joinQueue", playerId);
    }
  };

  // -------------------------------------------------------------------------
  // Fonction pour retourner à l'accueil
  const handleGoHome = () => {
    socketRef.current?.disconnect();
    navigate("/Menu"); // redirige vers la page d'accueil
  };

  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">

      {/* Bouton déconnexion en haut à droite */}
      <button className="absolute top-4 right-4 bg-yellow-400 text-white px-4 py-2 rounded-lg
      hover:bg-yellow-500 transition-colors">
        Se déconnecter
      </button>

      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Pierre-Feuille-Ciseaux
        </h1>

        {opponentName ? (
          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-lg font-semibold text-gray-800">
              {selfName ?? "Toi"} <span className="text-gray-400">vs</span> {opponentName}
            </p>
            <p className="text-gray-600">Round {roundNumber}</p>
            <p className="text-xl font-bold text-orange-800">
              {score.self} - {score.opponent}
            </p>
          </div>
        ) : (
          loading && <p className="mb-6 text-gray-600">Recherche d'un adversaire...</p>
        )}

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
        ) : userChoice && opponentChoice ? (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-xl">
              Tu as choisi : <span className="text-2xl">{emojis[userChoice]}</span>
            </p>
            <p className="text-xl">
              L'adversaire a choisi : <span className="text-2xl">{emojis[opponentChoice]}</span>
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
