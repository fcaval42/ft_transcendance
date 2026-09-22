// src/pages/AiInfo.tsx
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const AiInfo = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center p-4 pt-20">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-3xl">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            {t("aiInfo.title")}
          </h1>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-indigo-400 pb-2">
              {t("aiInfo.introTitle")}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t("aiInfo.introDesc")}
            </p>
          </section>

          {/* Fonctionnement */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-indigo-400 pb-2">
              {t("aiInfo.howTitle")}
            </h2>
            <p className="text-gray-600 mb-4">{t("aiInfo.howDesc")}</p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🏆</span>
                  <span className="text-gray-700">{t("aiInfo.howStep1")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🔄</span>
                  <span className="text-gray-700">{t("aiInfo.howStep2")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🎲</span>
                  <span className="text-gray-700">{t("aiInfo.howStep3")}</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Pourquoi cette approche */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-indigo-400 pb-2">
              {t("aiInfo.whyTitle")}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t("aiInfo.whyDesc")}
            </p>
          </section>

          {/* Fair-play */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-indigo-400 pb-2">
              {t("aiInfo.fairTitle")}
            </h2>
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-gray-600 leading-relaxed">
                {t("aiInfo.fairDesc")}
              </p>
            </div>
          </section>

          {/* Game customization */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-indigo-400 pb-2">
              {t("aiInfo.GameCustomizationTitle")}
            </h2>
            <div className="bg-pink-50 p-6 rounded-lg">
              <p className="text-gray-600 leading-relaxed">
                {t("aiInfo.GameCustomizationDesc")}
              </p>
            </div>
          </section>

          {/* Bouton retour menu */}
          <div className="text-center mt-8">
            <Link
              to="/menu"
              className="bg-indigo-400 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg transition-colors inline-block"
            >
              {t("profile.cancel")}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
