import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'aerocode-secret-key';

export interface AuthRequest extends Request {
  userId?: number;
  userPermission?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; nivelPermissao: string };

    req.userId = decoded.id;
    req.userPermission = decoded.nivelPermissao;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};