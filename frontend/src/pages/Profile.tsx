// src/pages/Profile.tsx
import { useAuthStatus } from "../utils/checkRoute";
import { Link, Navigate } from "react-router-dom";
import { useUser } from "../utils/useUser";
import { Header } from "../components/Header";
import { useTranslation } from "react-i18next";

export const Profile = () => {
    const { t } = useTranslation();
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
    <div className="flex flex-col items-center gap-4 mt-4 w-full max-w-md">
        <div className="bg-gray-300/30 rounded-xl p-6 shadow-sm w-full border-5 border-indigo-400">
        <div className="flex flex-col items-center gap-4">
        <div className="text-gray-700 font-medium">
            {t("profile.created")} {new Date(user.createdAt).toLocaleDateString('fr-FR')}
        </div>

        <div className="flex gap-4">
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-sm">
            {t("profile.victory")} {user.wins || 0}
            </div>
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg shadow-sm">
            {t("profile.defeat")} {user.losses || 0}
            </div>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg shadow-sm">
            {t("profile.elo")} {user.elo || 0}
            </div>
        </div>

        {user.wins + user.losses > 0 && (
            <div className="text-gray-700">
            {t("profile.rate")} {Math.round((user.wins / (user.wins + user.losses)) * 100)}%
            </div>
        )}
        <Link
            to="/menu"
            className="bg-indigo-400 text-white px-6 py-3 rounded-lg hover:bg-indigo-500 transition-colors mt-6 mx-auto"
            >
            {t("profile.cancel")}
        </Link>
        </div>
    </div>
    </div>
    </div>
  );
};