import { Link } from "react-router-dom";
import { LogoutButton } from "../components/LougoutButton";

export const Menu = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-6 relative">
      
      <LogoutButton />

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
      <Link
        to="/profile"
        className="bg-emerald-300 text-white px-8 py-4 rounded-lg hover:bg-emerald-400 transition-colors text-xl w-64 text-center flex items-center justify-center gap-2"
      >
        <span>👤</span> Profil
      </Link>
    </div>
  );
};
