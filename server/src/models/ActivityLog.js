import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    userEmail: {
      type: String,
      default: 'Anonymous',
      trim: true,
    },
    action: {
      type: String,
      required: [true, 'Action identifier is required'],
      trim: true,
      index: true,
    },
    module: {
      type: String,
      enum: ['documind', 'datainsight', 'smarttools', 'auth', 'admin'],
      required: [true, 'Module classification is required'],
      index: true,
    },
    details: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-expire log records after 90 days (7,776,000 seconds)
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
