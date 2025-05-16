import { Response, NextFunction } from 'express';
import { body, param, query } from 'express-validator';
import { AuthRequest, CourseLevel, TopicType } from '../types';
import * as teacherService from '../services/teacherService';
import { validate } from '../middleware/validate';
import { AppError } from '../middleware/error';

// Validation rules
export const courseValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('level')
    .optional()
    .isIn(Object.values(CourseLevel))
    .withMessage('Invalid course level'),
];

export const lessonValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('order').optional().isNumeric().withMessage('Order must be a number'),
];

export const topicValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('type')
    .isIn(Object.values(TopicType))
    .withMessage('Type must be either content or quiz'),
  body('content')
    .if(body('type').equals(TopicType.CONTENT))
    .notEmpty()
    .withMessage('Content is required for content type topics'),
  body('quiz')
    .if(body('type').equals(TopicType.QUIZ))
    .isArray()
    .withMessage('Quiz must be an array for quiz type topics'),
  body('quiz.*.question')
    .if(body('type').equals(TopicType.QUIZ))
    .notEmpty()
    .withMessage('Quiz question is required'),
  body('quiz.*.options')
    .if(body('type').equals(TopicType.QUIZ))
    .isArray({ min: 2 })
    .withMessage('Quiz options must be an array with at least 2 options'),
  body('quiz.*.options.*.text')
    .if(body('type').equals(TopicType.QUIZ))
    .notEmpty()
    .withMessage('Option text is required'),
  body('quiz.*.options.*.isCorrect')
    .if(body('type').equals(TopicType.QUIZ))
    .isBoolean()
    .withMessage('isCorrect must be a boolean'),
  body('order').optional().isNumeric().withMessage('Order must be a number'),
];

// Controller functions for courses
export const createCourse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    const course = await teacherService.createCourse(req.user._id, req.body);

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Course created successfully',
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    const { courseId } = req.params;
    const course = await teacherService.updateCourse(
      courseId,
      req.user._id,
      req.body,
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Course updated successfully',
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    const { courseId } = req.params;
    await teacherService.deleteCourse(courseId, req.user._id);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Course deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const getTeacherCourses = async (
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

    const result = await teacherService.getTeacherCourses(
      req.user._id,
      queryOptions,
    );

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
    const course = await teacherService.getCourseDetails(
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

// Controller functions for lessons
export const createLesson = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    const { courseId } = req.params;
    const lesson = await teacherService.createLesson(
      courseId,
      req.user._id,
      req.body,
    );

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Lesson created successfully',
      data: { lesson },
    });
  } catch (error) {
    next(error);
  }
};

export const updateLesson = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    const { lessonId } = req.params;
    const lesson = await teacherService.updateLesson(
      lessonId,
      req.user._id,
      req.body,
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Lesson updated successfully',
      data: { lesson },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLesson = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    const { lessonId } = req.params;
    await teacherService.deleteLesson(lessonId, req.user._id);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Lesson deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Controller functions for topics
export const createTopic = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    const { lessonId } = req.params;
    const topic = await teacherService.createTopic(
      lessonId,
      req.user._id,
      req.body,
    );

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Topic created successfully',
      data: { topic },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTopic = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    const { topicId } = req.params;
    const topic = await teacherService.updateTopic(
      topicId,
      req.user._id,
      req.body,
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Topic updated successfully',
      data: { topic },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTopic = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    const { topicId } = req.params;
    await teacherService.deleteTopic(topicId, req.user._id);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Topic deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Controller functions for analytics
export const getCourseAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    const { courseId } = req.params;
    const analytics = await teacherService.getCourseAnalytics(
      courseId,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Course analytics retrieved successfully',
      data: { analytics },
    });
  } catch (error) {
    next(error);
  }
};
