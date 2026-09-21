// src/pages/Instructions.tsx
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Instructions = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center p-4 pt-20">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-3xl">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            {t("instructions.title")}
          </h1>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-indigo-400 pb-2">
              {t("instructions.welcome")}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t("instructions.intro")}
            </p>
          </section>

          {/* Règles de base */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-indigo-400 pb-2">
              {t("instructions.basicRules")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("instructions.rulesDesc")}
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🪨</span>
                  <span className="text-gray-700">{t("instructions.rockBeats")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✂️</span>
                  <span className="text-gray-700">{t("instructions.scissorsBeat")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">📄</span>
                  <span className="text-gray-700">{t("instructions.paperBeats")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">⚖️</span>
                  <span className="text-gray-700">{t("instructions.equal")}</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Mode contre le Bot */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-indigo-400 pb-2">
              {t("instructions.vsBotTitle")}
            </h2>
            <ol className="space-y-3 list-decimal list-inside">
              <li className="text-gray-600">{t("instructions.vsBotStep1")}</li>
              <li className="text-gray-600">{t("instructions.vsBotStep2")}</li>
              <li className="text-gray-600">{t("instructions.vsBotStep3")}</li>
              <li className="text-gray-600">{t("instructions.vsBotStep4")}</li>
              <li className="text-gray-600">{t("instructions.vsBotStep5")}</li>
            </ol>
          </section>

          {/* Mode PvP */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-indigo-400 pb-2">
              {t("instructions.vsPlayerTitle")}
            </h2>
            <p className="text-gray-600 mb-4">{t("instructions.vsPlayerDesc")}</p>
            <ol className="space-y-3 list-decimal list-inside">
              <li className="text-gray-600">{t("instructions.vsPlayerStep1")}</li>
              <li className="text-gray-600">{t("instructions.vsPlayerStep2")}</li>
              <li className="text-gray-600">{t("instructions.vsPlayerStep3")}</li>
              <li className="text-gray-600">{t("instructions.vsPlayerStep4")}</li>
              <li className="text-gray-600">{t("instructions.vsPlayerStep5")}</li>
            </ol>
          </section>

          {/* Système de score et Elo */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-indigo-400 pb-2">
              {t("instructions.scoringTitle")}
            </h2>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-blue-800 mb-3">{t("instructions.winsLosses")}</h3>
              <p className="text-gray-600 mb-4">{t("instructions.winsLossesDesc")}</p>
              
              <h3 className="text-xl font-bold text-blue-800 mb-3">{t("instructions.eloTitle")}</h3>
              <p className="text-gray-600 mb-4">{t("instructions.eloDesc")}</p>
              <ul className="space-y-2 list-disc list-inside">
                <li className="text-gray-600">{t("instructions.eloWin")}</li>
                <li className="text-gray-600">{t("instructions.eloLose")}</li>
                <li className="text-gray-600">{t("instructions.eloAgainst")}</li>
              </ul>
            </div>
          </section>

          {/* Conseils */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-indigo-400 pb-2">
              {t("instructions.tipsTitle")}
            </h2>
            <div className="bg-green-50 p-6 rounded-lg">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-xl">💡</span>
                  <span className="text-gray-700">{t("instructions.tip1")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">⏱️</span>
                  <span className="text-gray-700">{t("instructions.tip2")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">📊</span>
                  <span className="text-gray-700">{t("instructions.tip3")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">🎯</span>
                  <span className="text-gray-700">{t("instructions.tip4")}</span>
                </li>
              </ul>
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
