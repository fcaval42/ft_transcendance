// useEffect = exécuter du code au chargement du composant
import React, { useState } from "react";
import "./AuthButtons.css";
import { platform } from "os";

// Icône Google.
// Ceci est un SVG = format image vectorielle. Dessin quoi.
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);


// Icône 42
const FortyTwoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
    <rect width="24" height="24" fill="#000000" rx="4" />
    <text x="12" y="15" fontFamily="Arial, sans-serif" fontSize="11" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">
      42
    </text>
  </svg>
);



const AuthButtons = () => {
// State pour simuler la connexion (à remplacer par du vrai backend plus tard)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // simulation pour basculer l'état local. Dans le backend on appellera le backend
  // pour gérer l'authentification.
  const toggleLogin = () => {
    setIsLoggedIn(!isLoggedIn);
  }

  return (
    <div className="auth-container">
        {isLoggedIn ? (
            // si connecté : bouton "Déconnexion"
            <button className="auth-button logout" onClick={toggleLogin}>
                Se déconnecter
            </button>
        ) : (
            // si déconnecté : boutons 42 + Google
            <div className="guest-menu">
                <button className="auth-button login-42" onClick={toggleLogin}>
                    <FortyTwoIcon /> Se connecter avec 42
                </button>
                <button className="auth-button google" onClick={toggleLogin}>
                    <GoogleIcon /> Se connecter avec Google
                </button>
            </div>
    )}
    </div>
  );
};

export default AuthButtons;