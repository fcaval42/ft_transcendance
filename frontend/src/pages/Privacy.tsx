import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Privacy = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center p-4 pt-20">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            {t("privacy.title")}
          </h1>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-indigo-400 pb-2">
              {t("privacy.simpleTitle")}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t("privacy.simpleDesc")}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-indigo-400 pb-2">
              {t("privacy.collectTitle")}
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 mb-4">{t("privacy.collectDesc")}</p>
              <ul className="space-y-2 list-disc list-inside">
                <li className="text-gray-600">{t("privacy.email")}</li>
                <li className="text-gray-600">{t("privacy.username")}</li>
                <li className="text-gray-600">{t("privacy.password")}</li>
                <li className="text-gray-600">{t("privacy.avatar")}</li>
                <li className="text-gray-600">{t("privacy.gameStats")}</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-indigo-400 pb-2">
              {t("privacy.useTitle")}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t("privacy.useDesc")}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-indigo-400 pb-2">
              {t("privacy.sharingTitle")}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {t("privacy.sharingDesc")}
            </p>
            <p className="text-gray-600 leading-relaxed">
              {t("privacy.sharingException")}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-indigo-400 pb-2">
              {t("privacy.cookiesTitle")}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t("privacy.cookiesDesc")}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-indigo-400 pb-2">
              {t("privacy.rightsTitle")}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {t("privacy.rightsDesc")}
            </p>
            <p className="text-gray-600 leading-relaxed">
              {t("privacy.rightsContact")}
            </p>
          </section>

          <section className="mb-8">
            <p className="text-sm text-gray-500 text-center">
              {t("privacy.lastUpdated")}
            </p>
          </section>

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
