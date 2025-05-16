import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { AuthRequest, UserRole } from '../types';
import * as authService from '../services/authService';
import { validate } from '../middleware/validate';
import { AppError } from '../middleware/error';

// Validation rules
export const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(Object.values(UserRole))
    .withMessage('Role must be either student or teacher'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const passwordChangeValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
];

// Controller functions
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password, role } = req.body;

    const { user, token } = await authService.registerUser(
      name,
      email,
      password,
      role,
    );

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'User registered successfully',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    const { user, token } = await authService.loginUser(email, password);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Login successful',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    const user = await authService.getUserProfile(req.user._id);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'User profile retrieved successfully',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    const { name, email } = req.body;
    const user = await authService.updateUserProfile(req.user._id, {
      name,
      email,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'User profile updated successfully',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(
      req.user._id,
      currentPassword,
      newPassword,
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Password changed successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
