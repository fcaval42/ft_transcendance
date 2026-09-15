import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createUser, authenticateUser, logoutUser, prisma } from './auth';
import { AuthenticatedRequest, authenticateToken } from './middleware/authmiddleware';

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

// Déconnexion
app.post('/api/logout', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (req.user) {
      await logoutUser(req.user.userId);
    }
    res.status(200).json({ message: 'Déconnexion réussie' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer son propre profil (Exemple de route protégée)
app.get('/api/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      select: {
        id: true,
        email: true,
        username: true,
        avatarUrl: true,
        isOnline: true,
        wins: true,
        losses: true,
        createdAt: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.listen(3001, () => console.log("Serveur démarré sur http://localhost:3001"));