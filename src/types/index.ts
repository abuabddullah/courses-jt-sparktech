import { Request } from 'express';
import { Document, Types } from 'mongoose';

// User types
export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  followingTeachers?: Types.ObjectId[];
  enrolledCourses?: Types.ObjectId[];
  comparePassword(password: string): Promise<boolean>;
}

// Auth types
export interface AuthRequest extends Request {
  user?: IUser;
}

// Course types
export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export interface ICourse extends Document {
  title: string;
  description: string;
  level: CourseLevel;
  teacher: Types.ObjectId;
  students: Types.ObjectId[];
  likes: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Lesson types
export interface ILesson extends Document {
  title: string;
  content: string;
  courseId: Types.ObjectId;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Topic types
export enum TopicType {
  CONTENT = 'content',
  QUIZ = 'quiz',
}

export interface IQuizOption {
  text: string;
  isCorrect: boolean;
}

export interface IQuizQuestion {
  question: string;
  options: IQuizOption[];
}

export interface ITopic extends Document {
  title: string;
  content?: string;
  lessonId: Types.ObjectId;
  order: number;
  type: TopicType;
  quiz?: IQuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

// Response types
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
  stack?: string;
}

// Query types
export interface FilterOptions {
  [key: string]: any;
}

export interface SortOptions {
  [key: string]: 'asc' | 'desc';
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface QueryOptions {
  filters?: FilterOptions;
  sort?: SortOptions;
  pagination?: PaginationOptions;
  searchTerm?: string;
  searchFields?: string[];
}
