import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { loadConfig } from './config.js'
import { createPool } from './db/pool.js'
import { loadEnvironment } from './runtime.js'

const migrationUrl = new URL('../migrations/001_create_short_links.sql', import.meta.url)
export async function runMigration({ pool, sql } = {}) {
  const ownedPool = !pool
  const activePool = pool ?? createPool(loadConfig(loadEnvironment()))
  const migrationSql = sql ?? await readFile(migrationUrl, 'utf8')
  let client
  try {
    client = typeof activePool.connect === 'function' ? await activePool.connect() : activePool
    await client.query('BEGIN'); await client.query(migrationSql); await client.query('COMMIT')
  } catch (error) {
    if (client) { try { await client.query('ROLLBACK') } catch {} }
    throw new Error('Database migration failed', { cause: error })
  } finally {
    client?.release?.()
    await activePool.end?.()
  }
}
async function main() {
  try { await runMigration(); console.log('Database migration completed') }
  catch { console.error('Database migration failed'); process.exitCode = 1 }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main()
