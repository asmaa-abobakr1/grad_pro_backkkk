import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Fix DNS for MongoDB Atlas on Windows
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch {}

mongoose.set('strictQuery', false);

// ── Routes ────────────────────────────────────────────────────────────────────
import authRoutes      from './routes/auth.js';
import productRoutes   from './routes/products.js';
import categoryRoutes  from './routes/categories.js';
import orderRoutes     from './routes/orders.js';
import userRoutes      from './routes/users.js';
import analyticsRoutes from './routes/analytics.js';
import uploadRoutes    from './routes/upload.js';

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow no-origin requests (Postman, mobile apps, same-origin)
    if (!origin) return callback(null, true);
    // Allow localhost in dev
    if (origin.includes('localhost')) return callback(null, true);
    // Allow any vercel.app subdomain
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    // Allow explicit CLIENT_URL from env
    if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) return callback(null, true);
    // Block everything else
    return callback(new Error(`CORS: origin "${origin}" not allowed`));
  },
  credentials: true,
}));

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Request logger (dev only) ─────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ── MongoDB connection (works for both serverless & traditional) ───────────────
let connectingPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  if (connectingPromise) return connectingPromise;

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not defined in environment variables');
    return;
  }

  connectingPromise = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  }).then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    connectingPromise = null;
  }).catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    connectingPromise = null;
    throw err;
  });

  return connectingPromise;
};

// Start eager connection
connectDB().catch(() => {});

// Connect on every serverless cold start BEFORE routes
app.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB middleware error:', err.message);
    res.status(500).json({ success: false, message: 'Database connection failed: ' + err.message });
  }
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/analytics',  analyticsRoutes);
app.use('/api/upload',     uploadRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  res.json({
    status:      'OK',
    message:     'Volt API is running 🚀',
    dbState:     mongoose.connection.readyState,
    hasMongoUri: !!(process.env.MONGODB_URI || process.env.MONGO_URI),
    timestamp:   new Date().toISOString(),
    uptime:      Math.floor(process.uptime()),
  });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('❌ Server Error:', err);
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: messages.join(' ') });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ success: false, message: `Duplicate value for ${field}.` });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: `Invalid ${err.path}: ${err.value}.` });
  }
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error.' : err.message,
  });
});

// Start server locally (not on Vercel)
if (!process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Volt API running on http://localhost:${PORT}`);
    });
  }).catch(() => {});
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

export default app;
