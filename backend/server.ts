import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createUser, authenticateUser } from './auth';

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

app.post('/api/login', async (req, res) => {
  try {
    const user = await authenticateUser(req.body);
    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.listen(3001, () => console.log("Serveur démarré sur http://localhost:3001"));