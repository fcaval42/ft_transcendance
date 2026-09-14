import express from 'express';
import cors from 'cors';
import { createUser } from './auth';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/users', async (req, res) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.listen(3001, () => console.log("Serveur démarré sur http://localhost:3001"));