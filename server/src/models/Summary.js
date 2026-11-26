import mongoose from 'mongoose';

const keyInfoSchema = new mongoose.Schema(
  {
    people: { type: [String], default: [] },
    organizations: { type: [String], default: [] },
    dates: { type: [String], default: [] },
    metrics: { type: [String], default: [] },
    keywords: { type: [String], default: [] },
  },
  { _id: false }
);

const sentimentSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral',
    },
    score: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 1,
    },
    reason: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'General',
    },
    confidence: {
      type: Number,
      default: 0.8,
      min: 0,
      max: 1,
    },
  },
  { _id: false }
);

const translationItemSchema = new mongoose.Schema(
  {
    short: { type: String, default: '' },
    medium: { type: [String], default: [] },
    detailed: { type: String, default: '' },
    translatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const summarySchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: [true, 'Document ID is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    shortSummary: {
      type: String,
      required: true,
      default: '',
    },
    mediumSummary: {
      type: [String],
      default: [],
    },
    detailedSummary: {
      type: String,
      default: '',
    },
    keyInfo: {
      type: keyInfoSchema,
      default: () => ({}),
    },
    sentiment: {
      type: sentimentSchema,
      default: () => ({}),
    },
    category: {
      type: categorySchema,
      default: () => ({}),
    },
    language: {
      type: String,
      enum: ['en', 'gu', 'hi', 'unknown'],
      default: 'en',
    },
    translations: {
      type: Map,
      of: translationItemSchema,
      default: () => new Map(),
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying existing summary by document and language
summarySchema.index({ documentId: 1, language: 1 });

summarySchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const Summary = mongoose.model('Summary', summarySchema);
export default Summary;
