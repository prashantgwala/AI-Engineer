const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const useSsl = process.env.PGSSLMODE === 'true';

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  max: Number(process.env.PGPOOL_MAX) || 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error.message);
});

const getDatabaseStatus = async () => {
  const { rows } = await pool.query(
    'SELECT NOW() AS server_time, current_database() AS database_name',
  );

  return rows[0];
};

module.exports = { pool, getDatabaseStatus };
