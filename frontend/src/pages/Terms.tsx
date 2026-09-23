import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Terms = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center p-4 pt-20">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            {t("terms.title")}
          </h1>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-indigo-400 pb-2">
              {t("terms.simpleTitle")}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t("terms.simpleDesc")}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-indigo-400 pb-2">
              {t("terms.allowedTitle")}
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 mb-4">{t("terms.allowedDesc")}</p>
              <ul className="space-y-2 list-disc list-inside">
                <li className="text-gray-600">{t("terms.playGames")}</li>
                <li className="text-gray-600">{t("terms.useFeatures")}</li>
                <li className="text-gray-600">{t("terms.reportIssues")}</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-indigo-400 pb-2">
              {t("terms.forbiddenTitle")}
            </h2>
            <div className="bg-red-50 p-6 rounded-lg">
              <p className="text-gray-600 mb-4">{t("terms.forbiddenDesc")}</p>
              <ul className="space-y-2 list-disc list-inside">
                <li className="text-gray-600">{t("terms.noCheating")}</li>
                <li className="text-gray-600">{t("terms.noHacking")}</li>
                <li className="text-gray-600">{t("terms.noMultipleAccounts")}</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-indigo-400 pb-2">
              {t("terms.yourResponsibilitiesTitle")}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {t("terms.yourResponsibilitiesDesc")}
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li className="text-gray-600">{t("terms.keepCredentials")}</li>
              <li className="text-gray-600">{t("terms.followRules")}</li>
              <li className="text-gray-600">{t("terms.respectOthers")}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-indigo-400 pb-2">
              {t("terms.ourResponsibilitiesTitle")}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {t("terms.ourResponsibilitiesDesc")}
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li className="text-gray-600">{t("terms.provideService")}</li>
              <li className="text-gray-600">{t("terms.protectData")}</li>
              <li className="text-gray-600">{t("terms.maintainSecurity")}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-indigo-400 pb-2">
              {t("terms.limitationTitle")}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t("terms.limitationDesc")}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-indigo-400 pb-2">
              {t("terms.changesTitle")}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {t("terms.changesDesc")}
            </p>
            <p className="text-gray-600 leading-relaxed">
              {t("terms.changesNotification")}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-indigo-400 pb-2">
              {t("terms.contactTitle")}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t("terms.contactDesc")}
            </p>
          </section>

          <section className="mb-8">
            <p className="text-sm text-gray-500 text-center">
              {t("terms.lastUpdated")}
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
