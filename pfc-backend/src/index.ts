import dotenv from "dotenv";
import express from "express";
import path from "path";
import { gameRouter } from "./game/routes";

dotenv.config({ path: "config/.env" });

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/game", gameRouter);

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
