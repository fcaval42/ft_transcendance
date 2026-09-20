import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProtectedRoute, UnlogRoute } from "./utils/checkRoute";
import { Login } from "./pages/Login";
import { Game } from "./pages/Game";
import { Menu } from "./pages/Menu"
import { Home } from "./pages/Home";
import { Register } from "./pages/Register";
import { Profile } from "./pages/Profile";
import { Pvp } from "./pages/Pvp";

function App() {
  return (
    <Router>
      <Routes>
        { /* Route par défaut (page d'accueil) */}
        { /* Route pour la page de connexion */}
        <Route element={<UnlogRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Route>
        { /* Route disponibles si connecté */}
        <Route element={<ProtectedRoute />}>
          <Route path="/menu" element={<Menu />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/game" element={<Game />} />
          <Route path="/Pvp" element={<Pvp />} />
        </Route>
      </Routes>
    </Router>
  );
}
export default App;
