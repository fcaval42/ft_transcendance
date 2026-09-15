import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createUser, authenticateUser, logoutUser, prisma, findOrCreateOAuthUser } from './auth';
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

app.get('/api/auth/42', (req, res) => {
  const redirectUri = encodeURIComponent(process.env.FORTYTwo_REDIRECT_URI!);
  const clientId = process.env.FORTYTwo_CLIENT_ID;
  const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-30acd738b29aef30cd1ad79a2199d52ee801d85b62f353d861bf73891f95aa76&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fapi%2Fauth%2F42%2Fcallback&response_type=code`;
  
  res.redirect(authUrl);
});

app.get('/api/auth/42/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Code d authorization manquant' });
  }

  try {
    const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: process.env.FORTYTWO_CLIENT_ID || '',
    client_secret: process.env.FORTYTWO_CLIENT_SECRET || '',
    code: code as string,
    redirect_uri: process.env.FORTYTWO_REDIRECT_URI || '',
  });
  
  const tokenResponse = await fetch('https://api.intra.42.fr/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });;

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) throw new Error(tokenData.error_description || 'Erreur Token 42');

    const userResponse = await fetch('https://api.intra.42.fr/v2/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = await userResponse.json();
    const authResult = await findOrCreateOAuthUser({
      email: userData.email,
      username: userData.login,
      avatarUrl: userData.image?.link,
      provider: '42',
      providerId: String(userData.id),
    });

    res.redirect(`http://localhost:3000/auth-success?token=${authResult.token}`);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Échec de l authentification OAuth' });
  }
});

app.get('/api/auth/google', (req, res) => {
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  
  googleAuthUrl.searchParams.append('client_id', process.env.GOOGLE_CLIENT_ID!);
  googleAuthUrl.searchParams.append('redirect_uri', process.env.GOOGLE_REDIRECT_URI!);
  googleAuthUrl.searchParams.append('response_type', 'code');
  googleAuthUrl.searchParams.append('scope', 'openid email profile');
  googleAuthUrl.searchParams.append('access_type', 'offline');

  res.redirect(googleAuthUrl.toString());
});

app.get('/api/auth/google/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Code d authorization manquant' });
  }

  try {
    const params = new URLSearchParams({
      code: code as string,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: 'authorization_code',
    });

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) throw new Error(tokenData.error_description || 'Erreur Token Google');

    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = await userResponse.json();

    const authResult = await findOrCreateOAuthUser({
      email: userData.email,
      username: userData.name || userData.email.split('@')[0],
      avatarUrl: userData.picture,
      provider: 'google',
      providerId: userData.id,
    });

    res.redirect(`http://localhost:3000/auth-success?token=${authResult.token}`);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Échec de l authentification Google' });
  }
});

app.listen(3001, () => console.log("Serveur démarré sur http://localhost:3001"));