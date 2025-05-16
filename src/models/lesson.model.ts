import mongoose, { Schema } from 'mongoose';
import { ILesson } from '../types';

const lessonSchema = new Schema<ILesson>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
    },
    order: {
      type: Number,
      required: [true, 'Order is required'],
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for getting topics
lessonSchema.virtual('topics', {
  ref: 'Topic',
  localField: '_id',
  foreignField: 'lessonId',
  justOne: false,
});

// Compound index for unique order within a course
lessonSchema.index({ courseId: 1, order: 1 }, { unique: true });

const Lesson = mongoose.model<ILesson>('Lesson', lessonSchema);

export default Lesson;
