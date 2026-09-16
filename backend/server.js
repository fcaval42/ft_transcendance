"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = require("./auth");
const authmiddleware_1 = require("./middleware/authmiddleware");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.post('/api/users', async (req, res) => {
    try {
        const user = await (0, auth_1.createUser)(req.body);
        res.status(201).json(user);
    }
    catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});
app.post('/api/login', async (req, res) => {
    try {
        const { user, token } = await (0, auth_1.authenticateUser)(req.body);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 3600000
        });
        res.status(200).json({ user, message: 'Connexion réussie' });
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});
app.post('/api/logout', authmiddleware_1.authenticateToken, async (req, res) => {
    try {
        if (req.user) {
            await (0, auth_1.logoutUser)(req.user.userId);
        }
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        });
        res.status(200).json({ message: 'Déconnexion réussie' });
    }
    catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});
app.get('/api/me', authmiddleware_1.authenticateToken, async (req, res) => {
    try {
        const user = await auth_1.prisma.user.findUnique({
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
        if (!user)
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});
app.get('/api/auth/42', (req, res) => {
    const redirectUri = encodeURIComponent(process.env.FORTYTwo_REDIRECT_URI);
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
            code: code,
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
        if (!tokenResponse.ok)
            throw new Error(tokenData.error_description || 'Erreur Token 42');
        const userResponse = await fetch('https://api.intra.42.fr/v2/me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const userData = await userResponse.json();
        const authResult = await (0, auth_1.findOrCreateOAuthUser)({
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
            maxAge: 3600000
        });
        res.redirect('https://localhost:8443/');
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Échec de l authentification OAuth' });
    }
});
app.get('/api/auth/google', (req, res) => {
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.append('client_id', process.env.GOOGLE_CLIENT_ID);
    googleAuthUrl.searchParams.append('redirect_uri', process.env.GOOGLE_REDIRECT_URI);
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
            code: code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code',
        });
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
        });
        const tokenData = await tokenResponse.json();
        if (!tokenResponse.ok)
            throw new Error(tokenData.error_description || 'Erreur Token Google');
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const userData = await userResponse.json();
        const authResult = await (0, auth_1.findOrCreateOAuthUser)({
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
            maxAge: 3600000
        });
        res.redirect('https://localhost:8443/');
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Échec de l authentification Google' });
    }
});
app.listen(3001, () => console.log("Serveur démarré sur http://localhost:3001"));
