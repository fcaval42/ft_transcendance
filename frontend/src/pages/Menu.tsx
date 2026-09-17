import { Link } from "react-router-dom";

export const Menu = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold mb-8">Menu Principal</h1>

      <Link
        to="/pvp-bot"
        className="bg-peru-500 text-white px-8 py-4 rounded-lg hover:bg-peru-600 transition-colors text-xl w-64 text-center flex items-center justify-center gap-2"
      >
        <span>🤖</span> Player vs Bot
      </Link>

      <Link
        to="/pvp"
        className="bg-peachpuff-500 text-white px-8 py-4 rounded-lg hover:bg-peachpuff-600 transition-colors text-xl w-64 text-center flex items-center justify-center gap-2"
      >
        <span>👥</span> Player vs Player
      </Link>

      <Link
        to="/tournament"
        className="bg-purple-500 text-white px-8 py-4 rounded-lg hover:bg-purple-600 transition-colors text-xl w-64 text-center flex items-center justify-center gap-2"
      >
        <span>🏆</span> Tournoi
      </Link>
    </div>
  );
};