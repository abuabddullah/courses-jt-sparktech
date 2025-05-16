import Course from '../models/course.model';
import Lesson from '../models/lesson.model';
import Topic from '../models/topic.model';
import User from '../models/user.model';
import { ICourse, ILesson, ITopic, UserRole } from '../types';
import { AppError } from '../middleware/error';
import QueryBuilder from '../utils/QueryBuilder';
import { Types } from 'mongoose';

// Course services for students
export const getAllCourses = async (
  queryOptions: any,
): Promise<{
  data: ICourse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  // Create query
  const queryBuilder = new QueryBuilder<ICourse>(Course, queryOptions);
  return await queryBuilder.findAll();
};

export const getPublicCourseDetails = async (
  courseId: string,
  studentId: string,
): Promise<ICourse> => {
  const course = await Course.findById(courseId)
    .populate({
      path: 'teacher',
      select: 'name',
    })
    .populate({
      path: 'lessons',
      options: { sort: { order: 1 } },
      populate: {
        path: 'topics',
        options: { sort: { order: 1 } },
      },
    });

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // If student is not enrolled and viewing course details, increment view count
  const studentIds = course.students.map((id) => id.toString());
  if (!studentIds.includes(studentId)) {
    course.viewCount += 1;
    await course.save();
  }

  return course;
};

export const enrollInCourse = async (
  courseId: string,
  studentId: string,
): Promise<ICourse> => {
  // Find course
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Find student
  const student = await User.findById(studentId);
  if (!student) {
    throw new AppError('Student not found', 404);
  }

  // Verify user is a student
  if (student.role !== UserRole.STUDENT) {
    throw new AppError('Only students can enroll in courses', 403);
  }

  // Check if student is already enrolled
  const enrolled = course.students.some((id) => id.toString() === studentId);
  if (enrolled) {
    throw new AppError('Student is already enrolled in this course', 400);
  }

  // Enroll student in course
  course.students.push(new Types.ObjectId(studentId));
  await course.save();

  // Add course to student's enrolled courses
  if (!student.enrolledCourses) {
    student.enrolledCourses = [];
  }
  student.enrolledCourses.push(new Types.ObjectId(courseId));
  await student.save();

  return course;
};

export const getEnrolledCourses = async (
  studentId: string,
  queryOptions: any,
): Promise<{
  data: ICourse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  // Find student to verify
  const student = await User.findById(studentId);
  if (!student) {
    throw new AppError('Student not found', 404);
  }

  // Filter for courses the student is enrolled in
  const filters = {
    students: studentId,
    ...queryOptions.filters,
  };

  // Create query with student filter
  const queryBuilder = new QueryBuilder<ICourse>(Course, {
    ...queryOptions,
    filters,
  });

  return await queryBuilder.findAll();
};

export const likeCourse = async (
  courseId: string,
  studentId: string,
): Promise<ICourse> => {
  // Find course
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Find student
  const student = await User.findById(studentId);
  if (!student) {
    throw new AppError('Student not found', 404);
  }

  // Verify student is enrolled in the course
  const enrolled = course.students.some((id) => id.toString() === studentId);
  if (!enrolled) {
    throw new AppError('You must be enrolled in the course to like it', 403);
  }

  // Increment likes
  course.likes += 1;
  await course.save();

  return course;
};

export const followTeacher = async (
  teacherId: string,
  studentId: string,
): Promise<void> => {
  // Find teacher
  const teacher = await User.findById(teacherId);
  if (!teacher) {
    throw new AppError('Teacher not found', 404);
  }

  // Verify user is a teacher
  if (teacher.role !== UserRole.TEACHER) {
    throw new AppError('You can only follow teachers', 400);
  }

  // Find student
  const student = await User.findById(studentId);
  if (!student) {
    throw new AppError('Student not found', 404);
  }

  // Verify user is a student
  if (student.role !== UserRole.STUDENT) {
    throw new AppError('Only students can follow teachers', 403);
  }

  // Check if student is already following this teacher
  if (!student.followingTeachers) {
    student.followingTeachers = [];
  }

  const isFollowing = student.followingTeachers.some(
    (id) => id.toString() === teacherId,
  );
  if (isFollowing) {
    throw new AppError('Already following this teacher', 400);
  }

  // Add teacher to student's following list
  student.followingTeachers.push(new Types.ObjectId(teacherId));
  await student.save();
};

export const unfollowTeacher = async (
  teacherId: string,
  studentId: string,
): Promise<void> => {
  // Find student
  const student = await User.findById(studentId);
  if (!student) {
    throw new AppError('Student not found', 404);
  }

  // Check if student is following this teacher
  if (!student.followingTeachers) {
    throw new AppError('Not following this teacher', 400);
  }

  const followingIndex = student.followingTeachers.findIndex(
    (id) => id.toString() === teacherId,
  );
  if (followingIndex === -1) {
    throw new AppError('Not following this teacher', 400);
  }

  // Remove teacher from student's following list
  student.followingTeachers.splice(followingIndex, 1);
  await student.save();
};

export const getFollowedTeachers = async (
  studentId: string,
): Promise<any[]> => {
  // Find student
  const student = await User.findById(studentId).populate({
    path: 'followingTeachers',
    select: 'name email',
  });

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  return student.followingTeachers || [];
};
