// src/pages/Profile.tsx
import { useAuthStatus } from "../utils/checkRoute";
import { Link, Navigate } from "react-router-dom";
import { useUser } from "../utils/useUser";
import { Header } from "../components/Header";

export const Profile = () => {
    const isAuthenticated = useAuthStatus();
    const { user, isLoading } = useUser();
  if (isAuthenticated === null || isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (<Navigate to="/" replace />);
  }

  if (!user) {
    return (<Navigate to="/" replace />);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-4">
        <Header />
        <img
      src={user.avatarUrl}
      alt={user.username}
      className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-50 xl:h-50 object-contain rounded-full object-cover border-2 border-indigo-400"
    />
      <h1 className="text-4xl font-bold break-words">
        {user.username}</h1>
    {/* Stats avec taux */}
    <div className="flex flex-col items-center gap-4 mt-4">
    <div className="flex gap-4">
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-sm">
          Victoire: {user.wins || 0}
        </div>
        <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg shadow-sm">
            Défaites: {user.losses || 0}
        </div>
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg shadow-sm">
            ELO: {user.elo || 0}
        </div>
    </div>
    {user.wins + user.losses > 0 && (
        <div className="text-gray-600">
        Taux de victoires: {Math.round((user.wins / (user.wins + user.losses)) * 100)}%
        </div>
    )}
    </div>
        <Link
      to="/menu"
      className="bg-indigo-400 text-white px-6 py-3 rounded-lg hover:bg-indigo-500 transition-colors mt-6"
    >
      Retour au Menu
    </Link>
    </div>
  );
};