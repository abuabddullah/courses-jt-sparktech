import express from 'express';
import * as studentController from '../controllers/studentController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = express.Router();

// Apply authentication and authorization middleware to all routes
router.use(authenticate, authorize(UserRole.STUDENT));

// Course routes
router.get('/courses', studentController.getAllCourses);

router.get('/courses/:courseId', studentController.getCourseDetails);

router.post('/courses/:courseId/enroll', studentController.enrollInCourse);

router.get('/enrolled-courses', studentController.getEnrolledCourses);

router.post('/courses/:courseId/like', studentController.likeCourse);

// Teacher interaction routes
router.post('/teachers/:teacherId/follow', studentController.followTeacher);

router.delete(
  '/teachers/:teacherId/unfollow',
  studentController.unfollowTeacher,
);

router.get('/followed-teachers', studentController.getFollowedTeachers);

export default router;
