// Link = créer un lien cliquable sans recharger la page
// src/pages/Home.tsx
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    // Si un token est présent, on redirige automatiquement vers le profil ou le jeu
    if (token) {
      navigate("/game");
    }
  }, [navigate]);
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