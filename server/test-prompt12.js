import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from './src/models/User.js';
import { ActivityLog } from './src/models/ActivityLog.js';
import { History } from './src/models/History.js';
import { logActivity, recordHistory } from './src/services/loggerService.js';
import { requireAdmin } from './src/middleware/adminMiddleware.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function runPrompt12Tests() {
  console.log('--- STARTING PROMPT 12 SUITE VERIFICATION ---');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/docify';
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log('✓ Connected to MongoDB');
  } catch (err) {
    console.log('⚠ MongoDB connection timed out; testing models & middleware logic in memory/mock mode');
  }

  // 1. Test adminMiddleware with non-admin user
  let forbiddenCalled = false;
  const mockReqNonAdmin = {
    user: { id: 'u123', email: 'regular@docify.demo', role: 'user' },
  };
  const mockRes = {
    status: (code) => ({
      json: (data) => {
        if (code === 403) forbiddenCalled = true;
        return data;
      },
    }),
  };
  let nextCalled = false;
  await requireAdmin(mockReqNonAdmin, mockRes, () => {
    nextCalled = true;
  });

  if (!forbiddenCalled || nextCalled) {
    throw new Error('adminMiddleware failed to block non-admin user with 403 Forbidden!');
  }
  console.log('✓ adminMiddleware successfully rejected regular user with 403 Forbidden');

  // 2. Test adminMiddleware with admin user
  forbiddenCalled = false;
  nextCalled = false;
  const mockReqAdmin = {
    user: { id: 'a123', email: 'admin@docify.demo', role: 'admin' },
  };
  await requireAdmin(mockReqAdmin, mockRes, () => {
    nextCalled = true;
  });

  if (!nextCalled || forbiddenCalled) {
    throw new Error('adminMiddleware failed to allow admin user!');
  }
  console.log('✓ adminMiddleware successfully granted access to admin user');

  // 3. Test ActivityLog schema validation
  const testLog = new ActivityLog({
    userEmail: 'admin@docify.demo',
    action: 'TEST_AUDIT',
    module: 'admin',
    details: 'System test log verification',
    status: 'success',
  });
  const valError = testLog.validateSync();
  if (valError) throw new Error(`ActivityLog validation failed: ${valError.message}`);
  console.log('✓ ActivityLog schema validation passed');

  // 4. Test History schema validation
  const testHistory = new History({
    userId: new mongoose.Types.ObjectId(),
    itemType: 'document',
    title: 'Financial_Report_Q4.pdf',
    summary: '15 pages, 2.4 MB',
    action: 'Document Ingestion',
    module: 'documind',
    isFavorite: true,
  });
  const histValError = testHistory.validateSync();
  if (histValError) throw new Error(`History validation failed: ${histValError.message}`);
  console.log('✓ History schema validation passed');

  // 5. Test loggerService graceful error handling when DB is offline or mock
  const logRes = await logActivity({
    action: 'PDF_MERGE',
    module: 'smarttools',
    details: 'Merged 3 documents',
  });
  console.log('✓ loggerService.logActivity executed without crashing runtime');

  const histRes = await recordHistory({
    userId: new mongoose.Types.ObjectId(),
    itemType: 'tool_action',
    title: 'Watermarked PDF',
    module: 'smarttools',
  });
  console.log('✓ loggerService.recordHistory executed without crashing runtime');

  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }

  console.log('\n======================================================');
  console.log('PROMPT 12 ADMIN, AUDIT LOG & HISTORY TESTS PASSED 100%!');
  console.log('======================================================');
}

runPrompt12Tests().catch((err) => {
  console.error('TEST SUITE FAILED:', err);
  process.exit(1);
});
