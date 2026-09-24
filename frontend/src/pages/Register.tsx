import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Toast } from "../components/Toast";
import { HeaderLogout } from "../components/Header";
import { Footer } from "../components/Footer";
import { useTranslation } from "react-i18next";

export const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { t } = useTranslation();
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success",
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setError(t("error.empty") as string);
      return;
    }
    if (!/\.(com|fr)$/i.test(email.trim())) {
      setError(t("error.email") as string);
      return;
    }
    if (password !== confirmPassword) {
      setError(t("error.password") as string);
      return;
    }

    try {
      const response = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        throw new Error(String(t("error.register")));
      }

      setToast({ show: true, message: t("register.inscription"), type: "success" });
      setTimeout(() => navigate("/menu"), 1000);

    } catch (error: any) {
      setToast({ show: true, message: error.message || t("error.register"), type: "error" });
      setError(error.message || t("error.register"));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <HeaderLogout />
      <main className="flex-1 flex flex-col items-center justify-center p-4 pt-20">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("register.connection")}</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 mb-2">
              Pseudo
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ton pseudo"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="name@email.com"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 mb-2">
              {t("register.password")}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
              {t("register.confirmPassword")}
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-pink-400 text-white p-2 rounded hover:bg-pink-500 transition-colors"
          >
            {t("register.register")}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/login" className="text-blue-400 hover:underline">
            {t("register.already")}
          </Link>
        </div>
        <div className="mt-4 text-center">
          <Link to="/" className="text-blue-500 hover:underline">
            {t("register.back")}
          </Link>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
};