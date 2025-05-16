import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UserRole } from '../types';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN as string;

if (!JWT_SECRET || !JWT_EXPIRES_IN) {
  console.error('JWT configuration is not defined in .env file');
  process.exit(1);
}

export type TJWTPayload = {
  _id: string;
  email: string;
  role: UserRole.STUDENT | UserRole.TEACHER;
};

export const generateToken = (jwtPayload: TJWTPayload): string => {
  return jwt.sign(jwtPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions); // Explicitly casting to SignOptions
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export default { generateToken, verifyToken };
