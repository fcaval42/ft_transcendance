import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUser } from "../utils/useUser";

export const LogoutButton = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isLoading } = useUser();
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        navigate("/");
      }
    } catch {
      // Erreur lors de la déconnexion
    }
  };

  if (isLoading || !user) {
    return null;
  }

  return (
    <button
      className="bg-yellow-400 text-white px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors font-bold" onClick={handleLogout}
    >
      {t("header.disconnect")}
    </button>
  );
};