import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }
  try {
    if (!process.env.JWT_SECRET) {
      res.status(500).json({ success: false, message: 'Server configuration error' });
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Not authorized for this role' });
      return;
    }
    next();
  };
};
