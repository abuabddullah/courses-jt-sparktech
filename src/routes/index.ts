import express from 'express';
import authRoutes from './authRoutes';
import teacherRoutes from './teacherRoutes';
import studentRoutes from './studentRoutes';

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/teacher', teacherRoutes);
router.use('/student', studentRoutes);

// Course search route - this is accessible without authentication
import Course from '../models/course.model';
import QueryBuilder from '../utils/QueryBuilder';

router.get('/course', async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const searchTerm = req.query.searchTerm as string;

    const queryOptions = {
      pagination: { page, limit },
      searchTerm,
      searchFields: ['title', 'description', 'level'],
    };

    const queryBuilder = new QueryBuilder(Course, queryOptions);
    const result = await queryBuilder.findAll();

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
});

export default router;
