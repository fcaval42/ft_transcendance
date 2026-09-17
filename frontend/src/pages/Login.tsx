// src/pages/Login.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthButtons from "../components/AuthButtons";
import { Toast } from "../components/Toast";


export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" |
    "error" }>
    ({
      show: false,
      message: "",
      type: "success",
    });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Pour la redirection

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Identifiants invalides.");
      }

      // affiche le toast (popup) puis on redirige
      setToast({ show: true, message: "Connexion réussie ! Bienvenue", type: "success"});
      setTimeout(() => navigate("/menu"), 1000)

    } catch (err: any) {
      setError(err.message || "Erreur lors de la connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({...toast, show: false})}
          />
      )}
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Connexion</h1>

        {/* BOUTONS 42 + GOOGLE*/}
        <AuthButtons />

        {/* Séparateur "ou" */}
        <div className="my-4 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="mx-2 text-gray-500">ou</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* ERREURS */}
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
            {error}
          </div>
        )}

        {/* FORMULAIRE CLASSIQUE */}
        <form onSubmit={handleSubmit}>
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
              placeholder="ton@email.com"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Mot de passe
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
          <button
            type="submit"
            className="w-full bg-indigo-400 text-white p-2 rounded hover:bg-indigo-500 transition-colors"
          >
            Se connecter
          </button>

          {/* Séparateur "s'inscrire" */}
          <div className="my-4 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="mx-2 text-gray-500">Pas encore inscrit ?</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <Link
            to="/register"
            className="block w-full bg-pink-400 text-white p-2 rounded hover:bg-pink-500 transition-colors text-center"
          >
            S'inscrire
          </Link>
        </form>

        <div className="mt-4 text-center">
          <Link to="/" className="text-blue-500 hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};