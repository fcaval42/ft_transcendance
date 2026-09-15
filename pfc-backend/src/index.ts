import dotenv from "dotenv";
import express from "express";

dotenv.config({ path: "config/.env" });

// const app = express();

const app = require('express')();
const server = require('http').createServer(app)
const io = require('socket.io')(server)


const port = process.env.PORT || 3000;

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
