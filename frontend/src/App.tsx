import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProtectedRoute, UnlogRoute } from "./utils/checkRoute";
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
        <Route element={<UnlogRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>
        { /* Route disponibles si connecté */}
        <Route element={<ProtectedRoute />}>
          <Route path="/game" element={<Game />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
