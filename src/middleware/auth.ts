import { Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import { AuthRequest, UserRole } from '../types';
import { AppError } from './error';
import User from '../models/user.model';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1) Check if token exists
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError(
          'You are not logged in. Please log in to get access.',
          401,
        ),
      );
    }

    // 2) Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }

    // 3) Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401),
      );
    }

    // 4) Add user to request object
    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Authentication failed', 401));
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new AppError(
          'You are not logged in. Please log in to get access.',
          401,
        ),
      );
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }

    next();
  };
};
