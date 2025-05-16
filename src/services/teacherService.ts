import Course from '../models/course.model';
import Lesson from '../models/lesson.model';
import Topic from '../models/topic.model';
import User from '../models/user.model';
import { ICourse, ILesson, ITopic, TopicType, UserRole } from '../types';
import { AppError } from '../middleware/error';
import QueryBuilder from '../utils/QueryBuilder';

// Course services
export const createCourse = async (
  teacherId: string,
  courseData: Partial<ICourse>,
): Promise<ICourse> => {
  // Validate teacher exists and has correct role
  const teacher = await User.findById(teacherId);
  if (!teacher) {
    throw new AppError('Teacher not found', 404);
  }

  if (teacher.role !== UserRole.TEACHER) {
    throw new AppError('Only teachers can create courses', 403);
  }

  // Create course
  const course = await Course.create({
    ...courseData,
    teacher: teacherId,
  });

  return course;
};

export const updateCourse = async (
  courseId: string,
  teacherId: string,
  updateData: Partial<ICourse>,
): Promise<ICourse> => {
  // Find course
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Verify teacher owns this course
  if (course.teacher.toString() !== teacherId) {
    throw new AppError('You can only update your own courses', 403);
  }

  // Update course
  const updatedCourse = await Course.findByIdAndUpdate(courseId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedCourse) {
    throw new AppError('Failed to update course', 500);
  }

  return updatedCourse;
};

export const deleteCourse = async (
  courseId: string,
  teacherId: string,
): Promise<void> => {
  // Find course
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Verify teacher owns this course
  if (course.teacher.toString() !== teacherId) {
    throw new AppError('You can only delete your own courses', 403);
  }

  // Delete associated lessons and topics
  const lessons = await Lesson.find({ courseId });
  for (const lesson of lessons) {
    await Topic.deleteMany({ lessonId: lesson._id });
  }
  await Lesson.deleteMany({ courseId });

  // Delete course
  await Course.findByIdAndDelete(courseId);
};

export const getTeacherCourses = async (
  teacherId: string,
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
  // Filter for teacher's courses
  const filters = {
    teacher: teacherId,
    ...queryOptions.filters,
  };

  // Create query with teacher filter
  const queryBuilder = new QueryBuilder<ICourse>(Course, {
    ...queryOptions,
    filters,
  });

  return await queryBuilder.findAll();
};

export const getCourseDetails = async (
  courseId: string,
  teacherId: string,
): Promise<ICourse> => {
  const course = await Course.findById(courseId)
    .populate({
      path: 'teacher',
      select: 'name email',
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

  // If requester is the teacher, increment view count
  if (course.teacher._id.toString() !== teacherId) {
    throw new AppError('You can only view details of your own courses', 403);
  }

  return course;
};

// Lesson services
export const createLesson = async (
  courseId: string,
  teacherId: string,
  lessonData: Partial<ILesson>,
): Promise<ILesson> => {
  // Find course
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Verify teacher owns this course
  if (course.teacher.toString() !== teacherId) {
    throw new AppError('You can only add lessons to your own courses', 403);
  }

  // Get the highest order number
  const highestOrderLesson = await Lesson.findOne({ courseId })
    .sort({ order: -1 })
    .limit(1);

  const nextOrder = highestOrderLesson ? highestOrderLesson.order + 1 : 1;

  // Create lesson
  const lesson = await Lesson.create({
    ...lessonData,
    courseId,
    order: lessonData.order || nextOrder,
  });

  return lesson;
};

export const updateLesson = async (
  lessonId: string,
  teacherId: string,
  updateData: Partial<ILesson>,
): Promise<ILesson> => {
  // Find lesson
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new AppError('Lesson not found', 404);
  }

  // Find course to verify ownership
  const course = await Course.findById(lesson.courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Verify teacher owns the course
  if (course.teacher.toString() !== teacherId) {
    throw new AppError('You can only update lessons in your own courses', 403);
  }

  // Update lesson
  const updatedLesson = await Lesson.findByIdAndUpdate(lessonId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedLesson) {
    throw new AppError('Failed to update lesson', 500);
  }

  return updatedLesson;
};

export const deleteLesson = async (
  lessonId: string,
  teacherId: string,
): Promise<void> => {
  // Find lesson
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new AppError('Lesson not found', 404);
  }

  // Find course to verify ownership
  const course = await Course.findById(lesson.courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Verify teacher owns the course
  if (course.teacher.toString() !== teacherId) {
    throw new AppError('You can only delete lessons in your own courses', 403);
  }

  // Delete associated topics
  await Topic.deleteMany({ lessonId });

  // Delete lesson
  await Lesson.findByIdAndDelete(lessonId);
};

// Topic services
export const createTopic = async (
  lessonId: string,
  teacherId: string,
  topicData: Partial<ITopic>,
): Promise<ITopic> => {
  // Find lesson
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new AppError('Lesson not found', 404);
  }

  // Find course to verify ownership
  const course = await Course.findById(lesson.courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Verify teacher owns the course
  if (course.teacher.toString() !== teacherId) {
    throw new AppError('You can only add topics to your own courses', 403);
  }

  // Get the highest order number
  const highestOrderTopic = await Topic.findOne({ lessonId })
    .sort({ order: -1 })
    .limit(1);

  const nextOrder = highestOrderTopic ? highestOrderTopic.order + 1 : 1;

  // Create topic
  const topic = await Topic.create({
    ...topicData,
    lessonId,
    order: topicData.order || nextOrder,
  });

  return topic;
};

export const updateTopic = async (
  topicId: string,
  teacherId: string,
  updateData: Partial<ITopic>,
): Promise<ITopic> => {
  // Find topic
  const topic = await Topic.findById(topicId);
  if (!topic) {
    throw new AppError('Topic not found', 404);
  }

  // Find lesson
  const lesson = await Lesson.findById(topic.lessonId);
  if (!lesson) {
    throw new AppError('Lesson not found', 404);
  }

  // Find course to verify ownership
  const course = await Course.findById(lesson.courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Verify teacher owns the course
  if (course.teacher.toString() !== teacherId) {
    throw new AppError('You can only update topics in your own courses', 403);
  }

  // Update topic
  const updatedTopic = await Topic.findByIdAndUpdate(topicId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedTopic) {
    throw new AppError('Failed to update topic', 500);
  }

  return updatedTopic;
};

export const deleteTopic = async (
  topicId: string,
  teacherId: string,
): Promise<void> => {
  // Find topic
  const topic = await Topic.findById(topicId);
  if (!topic) {
    throw new AppError('Topic not found', 404);
  }

  // Find lesson
  const lesson = await Lesson.findById(topic.lessonId);
  if (!lesson) {
    throw new AppError('Lesson not found', 404);
  }

  // Find course to verify ownership
  const course = await Course.findById(lesson.courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Verify teacher owns the course
  if (course.teacher.toString() !== teacherId) {
    throw new AppError('You can only delete topics in your own courses', 403);
  }

  // Delete topic
  await Topic.findByIdAndDelete(topicId);
};

// Analytics services
export const getCourseAnalytics = async (
  courseId: string,
  teacherId: string,
): Promise<any> => {
  // Find course
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Verify teacher owns this course
  if (course.teacher.toString() !== teacherId) {
    throw new AppError('You can only view analytics for your own courses', 403);
  }

  // Get course details with populated students
  const courseDetails = await Course.findById(courseId).populate({
    path: 'students',
    select: 'name email',
  });

  return {
    courseId: course._id,
    title: course.title,
    studentCount: course.students.length,
    likes: course.likes,
    viewCount: course.viewCount,
    students: courseDetails?.students || [],
  };
};
