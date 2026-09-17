import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createUser, authenticateUser, setUserOffline, prisma, findOrCreateOAuthUser } from './auth';
import { AuthenticatedRequest, authenticateToken } from './middleware/authmiddleware';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.post('/api/signin', async (req, res) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { user, token } = await authenticateUser(req.body);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 3600 * 10000
    });
    res.status(200).json({ user, message: 'Connexion réussie' });
  } catch (error) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/logout', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (req.user) {
      await setUserOffline(req.user.userId);
    }
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
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
        elo: true,
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
  const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-f91e53fba85e441db218d0c6590325543e0c6275941e910086258c28c6b9d1cf&redirect_uri=https%3A%2F%2Flocalhost%3A8443%2Fapi%2Fauth%2F42%2Fcallback&response_type=code`;
  
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
    });

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

    res.cookie('token', authResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 3600 * 10000
    });
    res.redirect('https://localhost:8443/');
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

    res.cookie('token', authResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 3600 * 10000
    });
    res.redirect('https://localhost:8443/');
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Échec de l authentification Google' });
  }
});

setInterval(async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 3600000);

    const result = await prisma.user.updateMany({
      where: {
        isOnline: true,
        lastSeenAt: { lt: oneHourAgo }
      },
      data: {
        isOnline: false,
        lastSeenAt: new Date()
      }
    });

    if (result.count > 0) {
      console.log(`[Cleanup] ${result.count} utilisateur(s) marqué(s) comme hors ligne (inactifs > 1h)`);
    }
  } catch (error) {
    console.error('[Cleanup] Erreur:', error);
  }
}, 900000);

app.listen(3001, () => console.log("Serveur démarré sur http://localhost:3001"));