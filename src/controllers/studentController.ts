import { Response, NextFunction } from 'express';
import { param, query } from 'express-validator';
import { AuthRequest } from '../types';
import * as studentService from '../services/studentService';
import { validate } from '../middleware/validate';
import { AppError } from '../middleware/error';

// Controller functions for courses
export const getAllCourses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const searchTerm = req.query.searchTerm as string;

    const queryOptions = {
      pagination: { page, limit },
      searchTerm,
      searchFields: ['title', 'description', 'level'],
    };

    const result = await studentService.getAllCourses(queryOptions);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Courses retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseDetails = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    const { courseId } = req.params;
    const course = await studentService.getPublicCourseDetails(
      courseId,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Course details retrieved successfully',
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

export const enrollInCourse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    const { courseId } = req.params;
    const course = await studentService.enrollInCourse(courseId, req.user._id);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Enrolled in course successfully',
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

export const getEnrolledCourses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const searchTerm = req.query.searchTerm as string;

    const queryOptions = {
      pagination: { page, limit },
      searchTerm,
      searchFields: ['title', 'description', 'level'],
    };

    const result = await studentService.getEnrolledCourses(
      req.user._id,
      queryOptions,
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Enrolled courses retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const likeCourse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    const { courseId } = req.params;
    const course = await studentService.likeCourse(courseId, req.user._id);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Course liked successfully',
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

// Controller functions for teacher interaction
export const followTeacher = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    const { teacherId } = req.params;
    await studentService.followTeacher(teacherId, req.user._id);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Teacher followed successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const unfollowTeacher = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    const { teacherId } = req.params;
    await studentService.unfollowTeacher(teacherId, req.user._id);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Teacher unfollowed successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const getFollowedTeachers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    const teachers = await studentService.getFollowedTeachers(req.user._id);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Followed teachers retrieved successfully',
      data: { teachers },
    });
  } catch (error) {
    next(error);
  }
};
