import express from 'express';
import * as teacherController from '../controllers/teacherController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { UserRole } from '../types';

const router = express.Router();

// Apply authentication and authorization middleware to all routes
router.use(authenticate, authorize(UserRole.TEACHER));

// Course routes
router.post(
  '/courses',
  validate(teacherController.courseValidation),
  teacherController.createCourse,
);

router.get('/courses', teacherController.getTeacherCourses);

router.get('/courses/:courseId', teacherController.getCourseDetails);

router.put(
  '/courses/:courseId',
  validate(teacherController.courseValidation),
  teacherController.updateCourse,
);

router.delete('/courses/:courseId', teacherController.deleteCourse);

// Lesson routes
router.post(
  '/courses/:courseId/lessons',
  validate(teacherController.lessonValidation),
  teacherController.createLesson,
);

router.put(
  '/lessons/:lessonId',
  validate(teacherController.lessonValidation),
  teacherController.updateLesson,
);

router.delete('/lessons/:lessonId', teacherController.deleteLesson);

// Topic routes
router.post(
  '/lessons/:lessonId/topics',
  validate(teacherController.topicValidation),
  teacherController.createTopic,
);

router.put(
  '/topics/:topicId',
  validate(teacherController.topicValidation),
  teacherController.updateTopic,
);

router.delete('/topics/:topicId', teacherController.deleteTopic);

// Analytics routes
router.get(
  '/analytics/courses/:courseId',
  teacherController.getCourseAnalytics,
);

export default router;
