import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/docify';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    // Do not crash server in development if local Mongo is not yet running
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};
