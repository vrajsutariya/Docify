import app from './app.js';
import { connectDB } from './config/db.js';
import { initCleanupScheduler } from './jobs/cleanupJob.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Initialize scheduled cleanup job for temp uploads
  initCleanupScheduler();

  // Start HTTP Listener
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 Docify API Server active on port: ${PORT}`);
    console.log(`🔗 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });
};

startServer();
