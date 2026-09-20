// src/pages/Home.tsx
import { useAuthStatus } from "../utils/checkRoute";
import { Link, Navigate } from "react-router-dom";
import { HeaderLogout } from "../components/Header";

export const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-4">
      <HeaderLogout />
        <img
      src="/logo.png"
      alt="Transcendance"
      className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-50 xl:h-50 object-contain"
    />
      <h1 className="text-4xl font-bold text-center break-words">
        Bienvenue sur Transcendance</h1>
      <Link
        to="/login"
        className="bg-indigo-400 text-white px-6 py-3 rounded-lg hover:bg-indigo-500 transition-colors"
      >
        Se connecter
      </Link>
    </div>
  );
};