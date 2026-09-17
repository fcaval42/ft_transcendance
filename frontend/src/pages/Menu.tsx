import { Link } from "react-router-dom";

export const Menu = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-6 relative">
      
      {/* Bouton déconnexion en haut à droite */}
      <button className="absolute top-4 right-4 bg-yellow-400 text-white px-4 py-2 rounded-lg
      hover:bg-yellow-500 transition-colors">
        Se déconnecter
      </button>

      <h1 className="text-4xl font-bold mb-8">Menu Principal</h1>

      <Link
        to="/game"
        className="bg-red-300 text-white px-8 py-4 rounded-lg hover:bg-red-400 transition-colors text-xl w-64 text-center flex items-center justify-center gap-2"
      >
        <span>🤖</span> Player vs Bot
      </Link>

      <Link
        to="/pvp"
        className="bg-sky-300 text-white px-8 py-4 rounded-lg hover:bg-sky-400 transition-colors text-xl w-64 text-center flex items-center justify-center gap-2"
      >
        <span>👥</span> Player vs Player
      </Link>

      <Link
        to="/tournament"
        className="bg-violet-300 text-white px-8 py-4 rounded-lg hover:bg-violet-400 transition-colors text-xl w-64 text-center flex items-center justify-center gap-2"
      >
        <span>🏆</span> Tournoi
      </Link>
    </div>
  );
};
