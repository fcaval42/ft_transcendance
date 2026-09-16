import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Login } from "./pages/Login";
import { Game } from "./pages/Game";
import { Home } from "./pages/Home";

function App() {
  return (
    <Router>
      {/*<AuthButtons />*/}
      <Routes>
        { /* Route par défaut (page d'accueil) */}
        <Route path="/" element={<Home />} />
        { /* Route pour la page de connexion */}
        <Route path="/login" element={<Login />} />
        { /* Route pour le jeu */}
        <Route path="/game" element={<Game />} />
      </Routes>
    </Router>
  );
}

export default App;
