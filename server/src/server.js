
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded regardless of current working directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import mongoose from 'mongoose';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initCleanupScheduler } from './jobs/cleanupJob.js';

const PORT = process.env.PORT || 5000;

// Start application
const startServer = async () => {
  try {
    console.log('⏳ Connecting to MongoDB...');

    // Step 1: Connect Database (Lifecycle listeners configured in db.js)
    await connectDB();

    // Step 2: Verify connection
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB is not connected!');
    }

    // Step 3: Initialize cleanup scheduler
    initCleanupScheduler();

    // Step 4: Start HTTP server
    const server = app.listen(PORT, () => {
      console.log('===============================================');
      console.log('🚀 Docify API Server is Running!');
      console.log(`🔗 Port: ${PORT}`);
      console.log(
        `🌍 Environment: ${process.env.NODE_ENV || 'development'}`
      );
      console.log(
        `❤️ Health Check: http://localhost:${PORT}/api/health`
      );
      console.log('===============================================');
    });

    // Configure server timeouts for large PDF uploads and AI processing (5 minutes)
    server.timeout = 300000;
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;

    // Graceful shutdown
    const shutdown = async () => {
      console.log('\n⏳ Shutting down server...');

      server.close(async () => {
        try {
          await mongoose.connection.close();
          console.log('✅ MongoDB connection closed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Shutdown error:', error.message);
          process.exit(1);
        }
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error) {
    console.error('===============================================');
    console.error('❌ Server Startup Failed!');
    console.error(error.message);
    console.error('===============================================');

    process.exit(1);
  }
};

// Run application
startServer();
