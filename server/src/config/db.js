import mongoose from 'mongoose';

const LOCAL_MONGO_URI = process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/docify';
const PRIMARY_MONGO_URI = process.env.MONGO_URI || LOCAL_MONGO_URI;

let isLifecycleInitialized = false;
let isConnectedAndReady = false;

/**
 * Single source of truth for Mongoose connection lifecycle listeners.
 * Configured once to provide clear, robust monitoring without duplicate events
 * or destructive recursive reconnection loops.
 */
export const initMongooseLifecycleListeners = () => {
  if (isLifecycleInitialized) return;
  isLifecycleInitialized = true;

  mongoose.connection.on('connected', () => {
    isConnectedAndReady = true;
    const host = mongoose.connection.host || 'unknown';
    const port = mongoose.connection.port ? `:${mongoose.connection.port}` : '';
    const name = mongoose.connection.name || 'docify';
    console.log(`✅ MongoDB Connection Established: ${name} (${host}${port})`);
  });

  mongoose.connection.on('disconnected', () => {
    if (isConnectedAndReady) {
      console.log('⚠️ MongoDB Connection Lost — driver awaiting network restoration...');
      isConnectedAndReady = false;
    }
  });

  mongoose.connection.on('reconnected', () => {
    isConnectedAndReady = true;
    console.log(`🔄 MongoDB Connection Restored: ${mongoose.connection.name} (${mongoose.connection.host})`);
  });

  mongoose.connection.on('error', (err) => {
    // Only log active runtime errors; never force disconnect() inside error handlers,
    // as Mongoose's internal driver automatically manages transient pool recovery.
    if (isConnectedAndReady) {
      console.error('❌ MongoDB Connection Error:', err.message);
    }
  });
};

/**
 * Establishes stable MongoDB connection with automatic fallback.
 * Validates connection state and handles TLS options properly on Node.js 24.
 */
export const connectDB = async () => {
  initMongooseLifecycleListeners();

  // If already connected, return existing connection immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const baseOptions = {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 2,
    autoIndex: true,
  };

  const primaryTarget = PRIMARY_MONGO_URI;
  const isAtlas = primaryTarget.includes('mongodb+srv') || primaryTarget.includes('mongodb.net');
  const targetOptions = isAtlas
    ? {
        ...baseOptions,
        tls: true,
        tlsAllowInvalidCertificates: true,
      }
    : baseOptions;

  try {
    const masked = primaryTarget.replace(/:([^:@]{4})[^:@]*@/, ':****@');
    console.log(`🔌 Connecting to primary database: ${masked}`);

    await mongoose.connect(primaryTarget, targetOptions);
    await mongoose.connection.db.admin().ping();

    isConnectedAndReady = true;
    console.log('===============================================');
    console.log(`✅ MongoDB Connected Successfully: ${mongoose.connection.name} (${mongoose.connection.host})`);
    console.log('===============================================');
    return mongoose.connection;
  } catch (primaryErr) {
    console.warn(`⚠️ Primary MongoDB unavailable (${primaryErr.message}).`);

    if (primaryTarget !== LOCAL_MONGO_URI) {
      console.log(`🔄 Switching cleanly to local MongoDB: ${LOCAL_MONGO_URI}...`);
      try {
        if (mongoose.connection.readyState !== 0) {
          await mongoose.disconnect().catch(() => {});
        }

        await mongoose.connect(LOCAL_MONGO_URI, baseOptions);
        await mongoose.connection.db.admin().ping();

        isConnectedAndReady = true;
        console.log('===============================================');
        console.log(`✅ Local MongoDB Connected & Ready: ${mongoose.connection.name} (${mongoose.connection.host})`);
        console.log('===============================================');
        return mongoose.connection;
      } catch (localErr) {
        console.error('❌ Local MongoDB fallback failed:', localErr.message);
        throw localErr;
      }
    }

    throw primaryErr;
  }
};

export default connectDB;
