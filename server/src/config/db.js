
import mongoose from 'mongoose';

const LOCAL_MONGO_URI = process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/docify';

let isSwitching = false;

// Handle runtime SSL/TLS drops gracefully
mongoose.connection.on('error', async (err) => {
  const msg = err.message || '';
  console.error('❌ MongoDB Connection Error:', msg);

  if ((msg.includes('SSL routines') || msg.includes('alert number 80') || msg.includes('tlsv1 alert')) && !isSwitching) {
    isSwitching = true;
    console.warn('⚠️ Atlas dropped TLS socket. Automatically recovering via local MongoDB fallback...');
    try {
      await mongoose.disconnect().catch(() => {});
      await mongoose.connect(LOCAL_MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      console.log('✅ Successfully restored database connection with local MongoDB!');
    } catch (fallbackErr) {
      console.error('❌ Local recovery failed:', fallbackErr.message);
    } finally {
      isSwitching = false;
    }
  }
});

export const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || LOCAL_MONGO_URI;

  try {
    console.log(`🔌 Connecting to primary MongoDB: ${primaryUri.replace(/:([^:@]{4})[^:@]*@/, ':****@')}`);
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 6000,
      connectTimeoutMS: 6000,
      socketTimeoutMS: 30000,
    });

    // Verify operational readiness
    await conn.connection.db.admin().ping();

    console.log('===============================================');
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.name} (${conn.connection.host})`);
    console.log('===============================================');
    return conn;
  } catch (primaryError) {
    console.warn(`⚠️ Primary MongoDB connection failed (${primaryError.message}).`);

    if (primaryUri !== LOCAL_MONGO_URI) {
      console.log(`🔄 Switching immediately to local MongoDB (${LOCAL_MONGO_URI})...`);
      try {
        await mongoose.disconnect().catch(() => {});
        const localConn = await mongoose.connect(LOCAL_MONGO_URI, {
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 5000,
        });
        console.log('===============================================');
        console.log(`✅ Local MongoDB Connected: ${localConn.connection.name} (${localConn.connection.host})`);
        console.log('===============================================');
        return localConn;
      } catch (localError) {
        console.error('❌ Local MongoDB fallback failed:', localError.message);
        throw localError;
      }
    }
    throw primaryError;
  }
};

export default connectDB;
