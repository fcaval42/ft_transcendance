import { Request, Response, NextFunction } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { JwtPayload, prisma } from '../auth';
import { useTranslation } from 'react-i18next';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  const { t } = useTranslation();

  if (!token) {
    return res.status(401).json({ error: t("error.token") });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded; // Injecte les infos décodées (userId, email)
    await prisma.user.update({
        where: { id: decoded.userId },
        data: { lastSeenAt: new Date() }
      });
    next();
  } catch (error) {
    // Si le token est expiré
    if (error instanceof TokenExpiredError) {
      // Décode le token sans vérifier la signature pour récupérer l'userId
      const decoded = jwt.decode(token) as JwtPayload | null;

      if (decoded?.userId) {
        try {
          await prisma.user.update({
            where: { id: decoded.userId },
            data: {
              isOnline: false,
              lastSeenAt: new Date(),
            },
          });
        } catch (dbError) {
          console.error(t("error.db"), dbError);
        }
      }

      // Nettoie le cookie avec les mêmes paramètres que dans server.ts
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      return res.status(401).json({ error: t("error.tokenExpired") });
    }

    // Si le token est invalide (signature altérée, etc.)
    return res.status(403).json({ error: t("error.token") });
  }
}