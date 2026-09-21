import { Link } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useTranslation } from "react-i18next";

export const Menu = () => {
  const { t } = useTranslation();
  return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-6 relative">
        <Header />

      <main className="flex-1 flex flex-col items-center justify-center gap-6 pt-20">
        <h1 className="text-4xl font-bold mb-8">{t("menu.menu")}</h1>

        <Link
          to="/game"
          className="bg-red-300 text-white px-8 py-4 rounded-lg hover:bg-red-400 transition-colors text-xl w-64 text-center flex items-center justify-center gap-2"
        >
          <span>🤖</span> {t("menu.vsBot")}
        </Link>

        <Link
          to="/pvp"
          className="bg-sky-300 text-white px-8 py-4 rounded-lg hover:bg-sky-400 transition-colors text-xl w-64 text-center flex items-center justify-center gap-2"
        >
          <span>👥</span> {t("menu.vsPlayer")}
        </Link>
      </main>
      <Footer />
    </div>
  );
};
