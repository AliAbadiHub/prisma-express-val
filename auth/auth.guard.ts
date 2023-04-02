import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const authService = new AuthService(prisma);

export const authGuard = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decodedToken = await authService.verifyAccessToken(token);

    // Attach the decoded user information to the request object
    (req as any).user = decodedToken;

    // Proceed to the next middleware function or route handler
    next();
  } catch (error) {
    console.error('Error in authGuard:', error);
    res.status(403).json({ message: 'Invalid token.' });
  }
};