// Link = créer un lien cliquable sans recharger la page
// src/pages/Home.tsx
import { Link } from "react-router-dom";

export const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Bienvenue sur Transcendance</h1>
      <Link
        to="/login"
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
      >
        Se connecter
      </Link>
    </div>
  );
};