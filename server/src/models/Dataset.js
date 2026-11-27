import mongoose from 'mongoose';

const columnSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['numeric', 'string', 'date', 'boolean', 'unknown'],
      default: 'string',
    },
    nullCount: {
      type: Number,
      default: 0,
    },
    uniqueCount: {
      type: Number,
      default: 0,
    },
    min: {
      type: Number,
      default: null,
    },
    max: {
      type: Number,
      default: null,
    },
    mean: {
      type: Number,
      default: null,
    },
    median: {
      type: Number,
      default: null,
    },
    stdDev: {
      type: Number,
      default: null,
    },
    sampleValues: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  { _id: false }
);

const cleaningHistorySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    affectedRows: {
      type: Number,
      default: 0,
    },
    affectedColumns: {
      type: [String],
      default: [],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    details: {
      type: String,
      default: '',
    },
    beforeStats: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    afterStats: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { _id: false }
);

const datasetSchema = new mongoose.Schema(
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
    fileType: {
      type: String,
      enum: ['csv', 'xlsx', 'xls', 'json', 'gsheet', 'other'],
      default: 'csv',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    fileUrl: {
      type: String,
      default: '',
    },
    rowCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    columnCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    columns: {
      type: [columnSchema],
      default: [],
    },
    sampleData: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    fullDataFilePath: {
      type: String,
      default: '',
    },
    summaryStats: {
      missingCellsCount: { type: Number, default: 0 },
      totalCellsCount: { type: Number, default: 0 },
      duplicateRowsCount: { type: Number, default: 0 },
      qualityScore: { type: Number, default: 100, min: 0, max: 100 },
    },
    cleaningHistory: {
      type: [cleaningHistorySchema],
      default: [],
    },
    chartRecommendations: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

datasetSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const Dataset = mongoose.model('Dataset', datasetSchema);
export default Dataset;
