import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProtectedRoute, UnlogRoute } from "./utils/checkRoute";
import { Login } from "./pages/Login";
import { Game } from "./pages/Game";
import { Pvp } from "./pages/Pvp_ben";
import { Menu } from "./pages/Menu"
import { Home } from "./pages/Home";
import { Register } from "./pages/Register";

function App() {
  return (
    <Router>
      <Routes>
        { /* Route par défaut (page d'accueil) */}
        <Route path="/" element={<Home />} />
        { /* Route pour la page de connexion */}
        <Route element={<UnlogRoute />}>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Route>
        { /* Route disponibles si connecté */}
        <Route element={<ProtectedRoute />}>
          <Route path="/Menu" element={<Menu />} />
          <Route path="/game" element={<Game />} />
          <Route path="/pvp" element={<Pvp />} />
        </Route>
      </Routes>
    </Router>
  );
}
export default App;
