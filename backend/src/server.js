import 'dotenv/config';
import express from 'express';
import cors    from 'cors';
import path    from 'path';
import crypto  from 'crypto';
import { fileURLToPath } from 'url';

import { config }                    from './config/config.js';
import { testConnection, disconnectDB }    from './config/db.js';
import apiRoutes                     from './routes/index.js';
import { notFound }                  from './middleware/error.middleware.js';
import { productionErrorNormalizer } from './utils/productionErrorNormalizer.js';
import { sanitizeInputs }           from './middleware/security.middleware.js';
import { nosqlInjectionSanitizer, originValidator, secureHeaders, parameterPollutionGuard } from './middleware/securityHardening.js';
import { startKeepAlive }          from './utils/keepAlive.js';
import { registerCatastrophicProcessListeners, logStructured } from './utils/catastrophicLogger.js';
import { runMigrations } from './migrations/runner.js';
import { compressionMiddleware } from './middleware/compression.js';

// Setup uncaught process listeners immediately
registerCatastrophicProcessListeners(disconnectDB);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// 0. Inject Request Correlation ID
app.use((req, res, next) => {
  req.requestId = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  next();
});

// Compress all responses cleanly
app.use(compressionMiddleware);


/* ════════════════════════════════════════════════════════════
   1.  CORS
   ════════════════════════════════════════════════════════════ */
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:4173',
  'https://lasustech.edu.ng',
  process.env.FRONTEND_URL?.replace(/\/$/, ''), // Allow production URL, sanitised
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // 1. Allow requests with no origin (like mobile apps or curl)
    if (!origin) return cb(null, true);

    // 2. Allow exact matches from ALLOWED_ORIGINS
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);

    // 3. Allow any Vercel deployment URL (e.g., preview deployments)
    if (origin.endsWith('.vercel.app')) return cb(null, true);

    // Otherwise, block
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
app.use(nosqlInjectionSanitizer);
app.use(parameterPollutionGuard);

/* ════════════════════════════════════════════════════════════
   3.  SECURITY HARDENING & CSP HEADERS
   ════════════════════════════════════════════════════════════ */
app.use(originValidator);
app.use(secureHeaders);

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
app.use(productionErrorNormalizer);

/* ════════════════════════════════════════════════════════════
   9.  BOOT — connect DB first, then listen
   ════════════════════════════════════════════════════════════ */
const PORT = process.env.PORT || config.port;   // honours raw env var too

const start = async () => {
  try {
    const dbConn = await testConnection();                      // verify DB before accepting traffic
    if (dbConn) {
      await runMigrations();                     // run automated schema and index migrations
    } else {
      logStructured({
        level: 'WARN',
        message: '⚠️ Database connection failed. Bootstrapping server in RESILIENT FALLBACK MODE without applying migrations.'
      });
    }

    const server = app.listen(PORT, () => {
      logStructured({
        level: 'INFO',
        message: `LASUSTECH API — listening on PORT ${PORT} in ${config.env} environment`,
        metadata: { port: PORT, env: config.env }
      });
    });

    // 10. KEEP-ALIVE (Render Free Tier)
    if (process.env.RENDER_EXTERNAL_URL) {
      startKeepAlive(process.env.RENDER_EXTERNAL_URL);
    }

    /* ── Graceful shutdown ──────────────────────────────── */
    const shutdown = async (signal) => {
      logStructured({
        level: 'WARN',
        message: `${signal} received — starting graceful shutdown process…`
      });

      // Stop receiving new connections
      server.close(async () => {
        logStructured({ level: 'INFO', message: '. HTTP server closed.' });
        try {
          await disconnectDB();
          logStructured({ level: 'INFO', message: '. Database connections disconnected cleanly.' });
          process.exit(0);
        } catch (dbErr) {
          logStructured({
            level: 'ERROR',
            message: 'Error during DB pool close at shutdown',
            error: dbErr
          });
          process.exit(1);
        }
      });

      // Force exit after 10 s if connections hang
      setTimeout(() => {
        logStructured({ level: 'CRITICAL', message: 'Shutdown timeout breached — forcing exit.' });
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

  } catch (err) {
    logStructured({
      level: 'CRITICAL',
      message: `Failed to bootstrap Express application server: ${err.message}`,
      error: err
    });
    process.exit(1);
  }
};

start();
