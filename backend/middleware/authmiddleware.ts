import { Request, Response, NextFunction } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { JwtPayload, prisma } from '../auth';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "Token is required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    await prisma.user.update({
        where: { id: decoded.userId },
        data: { lastSeenAt: new Date() }
      });
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
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
          void dbError;
        }
      }

      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      return res.status(401).json({ error: "Token is expired" });
    }

    return res.status(403).json({ error: "Token is invalid" });
  }
}