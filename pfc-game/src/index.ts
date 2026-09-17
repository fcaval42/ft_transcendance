import dotenv from "dotenv";
import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { gameRouter } from "./game/routes";
import { registerMatchmaking } from "./game/matchmaking";

dotenv.config({ path: "config/.env" });

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/game", gameRouter);

// On garde express, mais on l'enveloppe dans un serveur http "brut" pour
// pouvoir y brancher Socket.io (WebSocket) en plus des routes HTTP classiques.
const httpServer = createServer(app);
const io = new Server(httpServer);
registerMatchmaking(io);

httpServer.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
