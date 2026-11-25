
import mongoose from 'mongoose';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initCleanupScheduler } from './jobs/cleanupJob.js';

const PORT = process.env.PORT || 5000;

// MongoDB Connection Events
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB Connected Successfully!');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB Connection Error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB Disconnected!');
});

// Start Server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize Cleanup Scheduler
    initCleanupScheduler();

    // Start HTTP Server
    app.listen(PORT, () => {
      console.log('===============================================');
      console.log('🚀 Docify API Server is Running!');
      console.log(`🔗 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`❤️ Health Check: http://localhost:${PORT}/api/health`);
      console.log('===============================================');
    });

  } catch (error) {
    console.error('❌ Server Startup Failed:', error.message);
    process.exit(1);
  }
};

// Run Server
startServer();
