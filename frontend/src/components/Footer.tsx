// src/components/Footer.tsx
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full bg-indigo-950 text-white py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-lg font-bold">Transcendance</p>
            <p className="text-sm text-gray-400">{t("footer.poweredBy")}</p>
          </div>
          <nav className="flex gap-4 md:gap-6">
            <Link
              to="/instructions"
              className="text-gray-300 hover:text-white transition-colors text-sm"
            >
              {t("footer.instructions")}
            </Link>
            <Link
              to="/privacy"
              className="text-gray-300 hover:text-white transition-colors text-sm"
            >
              {t("footer.privacy")}
            </Link>
            <Link
              to="/terms"
              className="text-gray-300 hover:text-white transition-colors text-sm"
            >
              {t("footer.terms")}
            </Link>
            <Link
              to="/ai-info"
              className="text-gray-300 hover:text-white transition-colors text-sm"
            >
              {t("footer.aiInfo")}
            </Link>
          </nav>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-900 text-center text-xs text-white-500">
          <p>© 2026 Transcendance.</p>
        </div>
      </div>
    </footer>
  );
};
