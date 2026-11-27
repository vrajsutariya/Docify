import mongoose from 'mongoose';

const historySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for history tracking'],
      index: true,
    },
    itemType: {
      type: String,
      enum: ['document', 'dataset', 'quiz', 'tool_action'],
      required: [true, 'Item type is required'],
      index: true,
    },
    itemId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Activity title is required'],
      trim: true,
    },
    summary: {
      type: String,
      default: '',
      trim: true,
    },
    action: {
      type: String,
      default: '',
      trim: true,
    },
    module: {
      type: String,
      enum: ['documind', 'datainsight', 'smarttools'],
      default: 'documind',
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast user module and favorite filtering
historySchema.index({ userId: 1, isFavorite: 1, createdAt: -1 });
historySchema.index({ userId: 1, module: 1, createdAt: -1 });

export const History = mongoose.model('History', historySchema);
export default History;
