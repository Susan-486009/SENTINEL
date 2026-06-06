/**
 * db.js — MySQL Connection Pool
 *
 * Uses mysql2/promise with a connection pool.
 * All config is read from environment variables via config.js.
 *
 * Exports:
 *   pool          — raw pool for advanced use
 *   query()       — parameterised single query (auto-returns rows)
 *   queryOne()    — same but returns the first row or null
 *   execute()     — alias with explicit [rows, fields] destructure
 *   withTransaction() — runs multiple queries in a single ACID transaction
 *   testConnection()  — verifies DB is reachable (used on server boot)
 */

import mysql from 'mysql2/promise';
import { config } from './config.js';

/* ══════════════════════════════════════════════════════════
   CONNECTION POOL
   ══════════════════════════════════════════════════════════ */
const pool = mysql.createPool({
  host:               config.db.host,
  port:               config.db.port,
  user:               config.db.user,
  password:           config.db.password,
  database:           config.db.database,

  // Pool tuning
  waitForConnections: true,   // queue requests when pool is full
  connectionLimit:    10,     // max simultaneous connections
  queueLimit:         0,      // 0 = unlimited queue
  idleTimeout:        60_000, // release idle connections after 60 s
  enableKeepAlive:    true,   // prevent firewall from dropping idle conns
  keepAliveInitialDelay: 10_000,

  // Always return JS Date instead of strings for DATETIME columns
  dateStrings: false,

  // Timezone — store & retrieve UTC
  timezone: '+00:00',

  // Charset
  charset: 'utf8mb4',
});

/* ══════════════════════════════════════════════════════════
   CORE HELPERS
   ══════════════════════════════════════════════════════════ */

/**
 * Run a parameterised query and return the result rows array.
 *
 * @example
 *   const users = await query('SELECT * FROM users WHERE role = ?', ['admin']);
 */
export const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

/**
 * Same as query() but returns only the FIRST row, or null if no rows found.
 *
 * @example
 *   const user = await queryOne('SELECT * FROM users WHERE id = ?', [id]);
 *   if (!user) throw new AppError('User not found', 404);
 */
export const queryOne = async (sql, params = []) => {
  const rows = await query(sql, params);
  return rows[0] ?? null;
};

/**
 * Low-level execute — returns raw [rows, fields] tuple.
 * Useful when you need column metadata.
 *
 * @example
 *   const [rows, fields] = await execute('SHOW COLUMNS FROM complaints');
 */
export const execute = async (sql, params = []) => {
  return pool.execute(sql, params);
};

/* ══════════════════════════════════════════════════════════
   TRANSACTION HELPER
   ══════════════════════════════════════════════════════════ */

/**
 * Wraps multiple queries in an ACID transaction.
 * Automatically COMMITS on success or ROLLBACKs on error.
 *
 * The callback receives a `conn` object with the same
 * query() / queryOne() API bound to the transaction connection.
 *
 * @example
 *   const complaintId = await withTransaction(async (conn) => {
 *     const r1 = await conn.query('INSERT INTO complaints ...', [...]);
 *     await conn.query('INSERT INTO complaint_files ...', [...]);
 *     return r1.insertId;
 *   });
 */
export const withTransaction = async (callback) => {
  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    // Build a minimal scoped API so callers use the same connection
    const scopedQuery = async (sql, params = []) => {
      const [rows] = await conn.execute(sql, params);
      return rows;
    };

    const scopedQueryOne = async (sql, params = []) => {
      const rows = await scopedQuery(sql, params);
      return rows[0] ?? null;
    };

    const result = await callback({ query: scopedQuery, queryOne: scopedQueryOne, conn });

    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;                // re-throw so errorHandler catches it
  } finally {
    conn.release();           // always return connection to pool
  }
};

/* ══════════════════════════════════════════════════════════
   CONNECTION STATUS / HEALTH
   ══════════════════════════════════════════════════════════ */

/**
 * Ping the database. Used during server boot and health-check endpoint.
 * Throws if the connection fails.
 */
export const testConnection = async () => {
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
  console.log(
    `. MySQL connected → ${config.db.user}@${config.db.host}:${config.db.port}/${config.db.database}`,
  );
};

/**
 * Return current pool stats — useful in a /health endpoint.
 */
export const poolStats = () => ({
  all:     pool.pool?._allConnections?.length    ?? '—',
  free:    pool.pool?._freeConnections?.length   ?? '—',
  queued:  pool.pool?._connectionQueue?.length   ?? '—',
});

/* ══════════════════════════════════════════════════════════
   EXPORT RAW POOL (for advanced / streaming queries)
   ══════════════════════════════════════════════════════════ */
export default pool;
