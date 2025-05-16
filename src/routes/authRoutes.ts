import express from 'express';
import * as authController from '../controllers/authController';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post(
  '/register',
  validate(authController.registerValidation),
  authController.register,
);

router.post(
  '/login',
  validate(authController.loginValidation),
  authController.login,
);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);

router.put('/profile', authenticate, authController.updateProfile);

router.put(
  '/change-password',
  authenticate,
  validate(authController.passwordChangeValidation),
  authController.changePassword,
);

export default router;
