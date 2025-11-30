import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const permissionsMiddleware = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userPermission) {
      return res.status(403).json({ error: 'Permissão negada' });
    }
    if (!allowedRoles.includes(req.userPermission)) {
      return res.status(403).json({ error: 'Permissão insuficiente' });
    }
    next();
  };
};