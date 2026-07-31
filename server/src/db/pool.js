import pg from 'pg'

export function createPool({ databaseUrl, isProduction = false }) {
  return new pg.Pool({
    connectionString: databaseUrl,
    ssl: isProduction ? { rejectUnauthorized: false } : undefined,
  })
}
