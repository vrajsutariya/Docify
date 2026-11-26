import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema(
  {
    pageNumber: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    originalName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true,
    },
    fileName: {
      type: String,
      required: [true, 'Stored file name is required'],
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
      min: 0,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx', 'txt', 'image', 'other'],
      default: 'other',
    },
    pageCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    wordCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    readingTimeMinutes: {
      type: Number,
      default: 1,
      min: 1,
    },
    extractedText: {
      type: String,
      default: '',
    },
    pages: {
      type: [pageSchema],
      default: [],
    },
    ocrProcessed: {
      type: Boolean,
      default: false,
    },
    detectedLanguage: {
      type: String,
      enum: ['en', 'gu', 'hi', 'unknown'],
      default: 'unknown',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for rapid sorting & searching
documentSchema.index({ userId: 1, createdAt: -1 });
documentSchema.index({ userId: 1, originalName: 'text' });

documentSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const Document = mongoose.model('Document', documentSchema);
export default Document;
