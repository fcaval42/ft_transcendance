// src/pages/Home.tsx
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/me", {
          credentials: "include",
        });

        if (response.ok) {
          navigate("/game");
        }
      } catch {
        // Pas de session valide, on reste sur la page d'accueil.
      }
    };

    checkAuth();
  }, [navigate]);
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Bienvenue sur Transcendance</h1>
      <Link
        to="/login"
        className="bg-indigo-400 text-white px-6 py-3 rounded-lg hover:bg-indigo-500 transition-colors"
      >
        Se connecter
      </Link>
    </div>
  );
};