import { fileURLToPath } from 'url';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { env } from '../config/index.js';

let pool: Pool;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: env.DATABASE_HOST,
      port: env.DATABASE_PORT,
      database: env.DATABASE_NAME,
      user: env.DATABASE_USER,
      password: env.DATABASE_PASSWORD,

      ssl:
        env.NODE_ENV === 'production' ||
        (env.DATABASE_HOST &&
          env.DATABASE_HOST.trim() !== 'localhost' &&
          env.DATABASE_HOST.trim() !== '127.0.0.1')
          ? { rejectUnauthorized: false }
          : false,

      // Supabase PgBouncer pooler has connection limits per project.
      // Keep pool small to avoid exhausting them.
      max: 10,
      min: 2,

      // Drop idle clients back to PgBouncer quickly
      idleTimeoutMillis: 30000,
      allowExitOnIdle: true,

      // Connection timeout: 10s is safe for remote Supabase pooler
      connectionTimeoutMillis: 10000,

      // Recycle connections before PgBouncer's server_idle_timeout kills them.
      // Supabase default is 600s; use 300s to stay well under.
      maxLifetimeSeconds: 300,

      // TCP keep-alive detects dead connections (PgBouncer may close idle backends)
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,

      // Server-side timeouts sent as GUC parameters on connect.
      // Prevents any single query from holding a connection indefinitely.
      statement_timeout: 30000,
      query_timeout: 30000,
    });

    pool.on('error', (err) => {
      console.error('[DB] Unexpected pool error:', err.message);
    });

    pool.on('connect', () => {
      console.log('[DB] New client connected to pool');
    });

    pool.on('remove', () => {
      console.log('[DB] Client removed from pool');
    });
  }
  return pool;
}

function logPoolState(label: string): void {
  if (env.NODE_ENV !== 'development') return;
  const p = getPool();
  console.log(
    `[DB POOL] ${label} — total: ${p.totalCount}, idle: ${p.idleCount}, waiting: ${p.waitingCount}`
  );
}

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  logPoolState(`before query (first 60 chars: ${text.slice(0, 60)}...)`);
  const client = await getPool().connect();
  try {
    const result = await client.query<T>(text, params);
    logPoolState(`after query (first 60 chars: ${text.slice(0, 60)}...)`);
    return result;
  } catch (err) {
    console.error(
      `[DB] Query failed (first 60 chars: ${text.slice(0, 60)}...):`,
      (err as Error).message
    );
    throw err;
  } finally {
    client.release();
  }
}

export async function queryOne<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const result = await query<T>(text, params);
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function queryMany<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const result = await query<T>(text, params);
  return result.rows;
}

export async function executeTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  logPoolState('before transaction');
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    logPoolState('after transaction (committed)');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logPoolState('after transaction (rolled back)');
    throw error;
  } finally {
    client.release();
  }
}

export async function initializeDatabase(): Promise<void> {
  const fs = await import('fs');
  const schemaPath = fileURLToPath(new URL('./schema.sql', import.meta.url));
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  // Try the whole schema first — works when PgBouncer allows multi-statement.
  // If it fails (PgBouncer transaction mode), fall back to statement-by-statement.
  console.log('[DB INIT] Attempting whole-schema apply...');
  let wholeSchemaOk = false;
  try {
    await getPool().query(schema);
    wholeSchemaOk = true;
    console.log('[DB INIT] Whole-schema apply succeeded');
  } catch (err) {
    console.log('[DB INIT] Whole-schema apply failed, falling back to individual statements...');
  }

  if (!wholeSchemaOk) {
    // Split on semicolons, but protect $$ delimiters (PL/pgSQL bodies)
    // by temporarily replacing them with a placeholder.
    const protectedSchema = schema.replace(/\$\$/g, '§§DELIM§§');
    const statements = protectedSchema
      .split(';')
      .map((s) => s.trim().replace(/§§DELIM§§/g, '$$'))
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    let applied = 0;
    let errors = 0;

    for (const stmt of statements) {
      try {
        await getPool().query(stmt);
        applied++;
      } catch (err) {
        const msg = (err as Error).message;
        if (
          msg.includes('already exists') ||
          msg.includes('does not exist') ||
          msg.includes('duplicate key')
        ) {
          applied++;
        } else {
          errors++;
          console.error(`[DB INIT] Statement failed: ${stmt.slice(0, 80)}... — ${msg}`);
        }
      }
    }

    console.log(`[DB INIT] Schema statements: ${applied} applied, ${errors} errors`);
  }

  const criticalTables = [
    'users',
    'verification_tokens',
    'password_reset_tokens',
    'projects',
    'subscriptions',
  ];

  const missing: string[] = [];

  console.log('[DB INIT] Checking table existence...');
  for (const table of criticalTables) {
    const result = await getPool().query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = $1
      ) AS exists`,
      [table]
    );
    const exists = result.rows[0].exists;
    console.log(`[DB INIT] Table '${table}': ${exists ? 'EXISTS' : 'MISSING'}`);
    if (!exists) {
      missing.push(table);
    }
  }

  if (missing.length > 0) {
    console.log(`[DB INIT] Missing tables: ${missing.join(', ')}. Attempting auto-creation...`);

    const tableDDLs: Record<string, string> = {
      verification_tokens: `
        CREATE TABLE IF NOT EXISTS verification_tokens (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token VARCHAR(255) NOT NULL UNIQUE,
          type VARCHAR(50) NOT NULL DEFAULT 'email_verification',
          expires_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `,
      password_reset_tokens: `
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token VARCHAR(255) NOT NULL UNIQUE,
          expires_at TIMESTAMPTZ NOT NULL,
          used_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `,
      projects: `
        CREATE TABLE IF NOT EXISTS projects (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          client VARCHAR(255),
          type VARCHAR(50) NOT NULL DEFAULT 'residential',
          location VARCHAR(255),
          currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
          description TEXT,
          status VARCHAR(50) NOT NULL DEFAULT 'draft',
          building_type VARCHAR(100),
          num_floors INTEGER DEFAULT 1,
          total_area DECIMAL(15, 2),
          start_date DATE,
          completion_date DATE,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `,
      subscriptions: `
        CREATE TABLE IF NOT EXISTS subscriptions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
          plan VARCHAR(50) NOT NULL DEFAULT 'free',
          status VARCHAR(50) NOT NULL DEFAULT 'active',
          current_period_start TIMESTAMPTZ,
          current_period_end TIMESTAMPTZ,
          cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
          payment_provider VARCHAR(50),
          provider_subscription_id VARCHAR(255),
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `,
      users: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL DEFAULT '',
          role VARCHAR(50) NOT NULL DEFAULT 'quantity_surveyor',
          is_verified BOOLEAN NOT NULL DEFAULT FALSE,
          google_id VARCHAR(255),
          avatar_url TEXT,
          refresh_token TEXT,
          last_login_at TIMESTAMPTZ,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `,
    };

    for (const table of missing) {
      const ddl = tableDDLs[table];
      if (ddl) {
        try {
          console.log(`[DB INIT] Creating table '${table}'...`);
          await getPool().query(ddl);
          console.log(`[DB INIT] Table '${table}' created successfully`);
        } catch (createErr) {
          console.error(`[DB INIT] Failed to create table '${table}':`, createErr);
        }
      } else {
        console.error(`[DB INIT] No DDL found for missing table '${table}'`);
      }
    }

    const stillMissing: string[] = [];
    for (const table of missing) {
      const result = await getPool().query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = $1
        ) AS exists`,
        [table]
      );
      if (!result.rows[0].exists) {
        stillMissing.push(table);
      }
    }

    if (stillMissing.length > 0) {
      throw new Error(
        `Critical tables still missing after auto-creation: ${stillMissing.join(', ')}. Run the migration manually.`
      );
    }

    console.log('[DB INIT] All missing tables created successfully');
  }

  console.log('[DB INIT] Schema verified');

  // ── RLS enforcement (runs on every startup) ──────────────────────
  // Belt-and-suspenders: even if someone disables RLS via the Supabase
  // dashboard, this re-enables it on the next server restart.
  // ALTER TABLE ... ENABLE ROW LEVEL SECURITY is idempotent.
  // ──────────────────────────────────────────────────────────────────
  console.log('[DB INIT] Enabling Row-Level Security on all tables...');
  const allTables = [
    'users', 'verification_tokens', 'password_reset_tokens',
    'onboarding_data', 'projects', 'drawings', 'construction_stages',
    'boq_sections', 'boqs', 'boq_items',
    'material_schedules', 'material_schedule_items',
    'regions', 'rate_categories', 'rate_library',
    'reports', 'exports', 'subscriptions', 'payments',
    'notifications', 'audit_logs', 'jobs',
    'teams', 'team_members', 'project_shares', 'templates',
  ];
  for (const table of allTables) {
    try {
      await getPool().query(`ALTER TABLE IF EXISTS ${table} ENABLE ROW LEVEL SECURITY`);
    } catch (err) {
      console.error(`[DB INIT] Failed to enable RLS on '${table}':`, (err as Error).message);
    }
  }
  console.log('[DB INIT] RLS enforcement complete');
}

export function logPoolStats(label: string): void {
  const p = getPool();
  console.log(
    `[DB POOL] ${label} — totalCount: ${p.totalCount}, idleCount: ${p.idleCount}, waitingCount: ${p.waitingCount}`
  );
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    logPoolStats('closing');
    await pool.end();
  }
}
