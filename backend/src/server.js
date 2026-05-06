import 'dotenv/config';
import express from 'express';
import cors    from 'cors';
import path    from 'path';
import { fileURLToPath } from 'url';

import { config }                    from './config/config.js';
import { testConnection }            from './config/db.js';
import apiRoutes                     from './routes/index.js';
import { errorHandler, notFound }    from './middleware/error.middleware.js';
import { sanitizeInputs }           from './middleware/security.middleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

/* ════════════════════════════════════════════════════════════
   1.  CORS
   ════════════════════════════════════════════════════════════ */
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:4173',
  'https://lasustech.edu.ng',
];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin, allowed origins, or vercel subdomains
    if (!origin || ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app')) {
      return cb(null, true);
    }
    cb(new Error(`CORS: origin ${origin} is not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/* ════════════════════════════════════════════════════════════
   2.  BODY PARSING & SANITIZATION
   ════════════════════════════════════════════════════════════ */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Strip malicious tags (XSS protection) from all incoming data
app.use(sanitizeInputs);

/* ════════════════════════════════════════════════════════════
   3.  SECURITY HEADERS  (no helmet dep needed)
   ════════════════════════════════════════════════════════════ */
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

/* ════════════════════════════════════════════════════════════
   4.  REQUEST LOGGER  (dev only)
   ════════════════════════════════════════════════════════════ */
if (config.env === 'development') {
  app.use((req, _res, next) => {
    console.log(`→ ${req.method} ${req.originalUrl}`);
    next();
  });
}

/* ════════════════════════════════════════════════════════════
   5.  STATIC — uploaded evidence files
   ════════════════════════════════════════════════════════════ */
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), { maxAge: '1d' }),
);

/* ════════════════════════════════════════════════════════════
   6.  API ROUTES   /api/v1
   ════════════════════════════════════════════════════════════ */
app.use('/api/v1', apiRoutes);

/* ════════════════════════════════════════════════════════════
   7.  ROOT  (quick smoke-test)
   ════════════════════════════════════════════════════════════ */
app.get('/', (_req, res) =>
  res.json({
    name:        'LASUSTECH Complaint Portal API',
    version:     '1.0.0',
    status:      'running',
    environment: config.env,
    endpoints: {
      health:      '/api/v1/health',
      auth:        '/api/v1/auth',
      complaints:  '/api/v1/complaints',
    },
  }),
);

/* ════════════════════════════════════════════════════════════
   8.  ERROR HANDLING  (must be LAST)
   ════════════════════════════════════════════════════════════ */
app.use(notFound);
app.use(errorHandler);

/* ════════════════════════════════════════════════════════════
   9.  BOOT — connect DB first, then listen
   ════════════════════════════════════════════════════════════ */
const PORT = process.env.PORT || config.port;   // honours raw env var too

const start = async () => {
  try {
    await testConnection();                      // verify MySQL before accepting traffic

    const server = app.listen(PORT, () => {
      console.log('');
      console.log('┌─────────────────────────────────────────┐');
      console.log(`│  🚀  LASUSTECH API — listening           │`);
      console.log(`│  PORT : ${String(PORT).padEnd(32)}│`);
      console.log(`│  ENV  : ${config.env.padEnd(32)}│`);
      console.log(`│  BASE : http://localhost:${String(PORT).padEnd(16)}/api/v1 │`);
      console.log('└─────────────────────────────────────────┘');
      console.log('');
    });

    /* ── Graceful shutdown ──────────────────────────────── */
    const shutdown = (signal) => {
      console.log(`\n${signal} received — shutting down gracefully…`);
      server.close(() => {
        console.log('✅ HTTP server closed.');
        process.exit(0);
      });
      // Force exit after 10 s if connections hang
      setTimeout(() => process.exit(1), 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

/* ── Catch unhandled promise rejections ─────────────────── */
process.on('unhandledRejection', (reason) => {
  console.error('⚠️  Unhandled Rejection:', reason);
});

start();
