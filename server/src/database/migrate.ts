import { getPool, initializeDatabase } from './index.js';
import { env } from '../config/index.js';

async function migrate(): Promise<void> {
  console.log(`\n  🔄 Running BOQ AI Database Migration`);
  console.log(`  📦 Database: ${env.DATABASE_NAME} on ${env.DATABASE_HOST}:${env.DATABASE_PORT}\n`);

  try {
    await initializeDatabase();
    console.log('  ✅ Schema initialized successfully');

    // Migration tracking
    const pool = getPool();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const migrations = ['001_initial'];
    for (const name of migrations) {
      const existing = await pool.query('SELECT id FROM migrations WHERE name = $1', [name]);
      if (existing.rows.length === 0) {
        await pool.query('INSERT INTO migrations (name) VALUES ($1)', [name]);
        console.log(`  ✅ Applied migration: ${name}`);
      } else {
        console.log(`  ⏭️  Skipped migration: ${name} (already applied)`);
      }
    }

    console.log(`\n  🎉 Migration complete!\n`);
  } catch (error) {
    console.error('\n  ❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
