import mongoose, { Schema } from 'mongoose';
import { ITopic, TopicType } from '../types';

// Quiz option schema
const quizOptionSchema = new Schema(
  {
    text: {
      type: String,
      required: [true, 'Option text is required'],
      trim: true,
    },
    isCorrect: {
      type: Boolean,
      required: [true, 'isCorrect is required'],
      default: false,
    },
  },
  { _id: false },
);

// Quiz question schema
const quizQuestionSchema = new Schema(
  {
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
    },
    options: [quizOptionSchema],
  },
  { _id: false },
);

const topicSchema = new Schema<ITopic>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    content: {
      type: String,
      trim: true,
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: [true, 'Lesson ID is required'],
    },
    order: {
      type: Number,
      required: [true, 'Order is required'],
      default: 0,
    },
    type: {
      type: String,
      enum: Object.values(TopicType),
      default: TopicType.CONTENT,
    },
    quiz: [quizQuestionSchema],
  },
  {
    timestamps: true,
  },
);

// Compound index for unique order within a lesson
topicSchema.index({ lessonId: 1, order: 1 }, { unique: true });

// Validate quiz data is present for quiz type
topicSchema.pre('validate', function (next) {
  if (this.type === TopicType.QUIZ && (!this.quiz || this.quiz.length === 0)) {
    this.invalidate(
      'quiz',
      'Quiz questions are required for quiz type topics',
      this.quiz,
    );
  }
  next();
});

const Topic = mongoose.model<ITopic>('Topic', topicSchema);

export default Topic;
