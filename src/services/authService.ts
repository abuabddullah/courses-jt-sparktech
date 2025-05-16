import User from '../models/user.model';
import { IUser, UserRole } from '../types';
import { generateToken } from '../config/jwt';
import { AppError } from '../middleware/error';

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: UserRole,
): Promise<{ user: IUser; token: string }> => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  // Generate JWT token
  const jwtPayload = {
    _id: user._id as string,
    email: user.email as string,
    role: user.role,
  };
  const token = generateToken(jwtPayload);

  return { user, token };
};

export const loginUser = async (
  email: string,
  password: string,
): Promise<{ user: IUser; token: string }> => {
  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check if password is correct
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate JWT token
  const jwtPayload = {
    _id: user._id as string,
    email: user.email as string,
    role: user.role,
  };
  const token = generateToken(jwtPayload);

  return { user, token };
};

export const getUserProfile = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};

export const updateUserProfile = async (
  userId: string,
  updateData: Partial<IUser>,
): Promise<IUser> => {
  // Remove sensitive fields that shouldn't be updated directly
  const { password, role, ...updatableData } = updateData;

  const user = await User.findByIdAndUpdate(userId, updatableData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<IUser> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  return user;
};
