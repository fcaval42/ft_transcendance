import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./utils/protectedRoute";
import { Login } from "./pages/Login";
import { Game } from "./pages/Game";
import { Home } from "./pages/Home";

function App() {
  return (
    <Router>
      <Routes>
        { /* Route par défaut (page d'accueil) */}
        <Route path="/" element={<Home />} />
        { /* Route pour la page de connexion */}
        <Route path="/login" element={<Login />} />
        { /* Route disponibles si connecté */}
        <Route element={<ProtectedRoute />}>
          <Route path="/game" element={<Game />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
