import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['mcq', 'true_false', 'fill_in_the_blank', 'short_answer'],
      default: 'mcq',
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      default: [],
    },
    correctAnswer: {
      type: String,
      required: true,
      trim: true,
    },
    explanation: {
      type: String,
      default: '',
      trim: true,
    },
    topic: {
      type: String,
      default: 'General',
      trim: true,
    },
    sourcePage: {
      type: Number,
      default: 1,
    },
  },
  { _id: false }
);

const flashcardSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    front: {
      type: String,
      required: true,
      trim: true,
    },
    back: {
      type: String,
      required: true,
      trim: true,
    },
    topic: {
      type: String,
      default: 'General',
      trim: true,
    },
    box: {
      type: Number,
      default: 1,
      min: 1,
      max: 3, // Leitner 3-box model: 1 = Frequent/New, 2 = Review, 3 = Mastered
    },
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 1,
    },
    timeTakenSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    wrongQuestionIds: {
      type: [String],
      default: [],
    },
    topicBreakdown: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: [true, 'Document ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
    },
    language: {
      type: String,
      enum: ['en', 'gu', 'hi'],
      default: 'en',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    questions: {
      type: [questionSchema],
      default: [],
      validate: [
        (val) => val.length > 0,
        'Quiz must contain at least one question',
      ],
    },
    flashcards: {
      type: [flashcardSchema],
      default: [],
    },
    shareId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: [attemptSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
quizSchema.index({ userId: 1, documentId: 1, createdAt: -1 });
quizSchema.index({ shareId: 1, isPublic: 1 });

quizSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const Quiz = mongoose.model('Quiz', quizSchema);
