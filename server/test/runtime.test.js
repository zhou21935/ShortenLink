import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import request from 'supertest'
import { loadConfig } from '../src/config.js'
import { loadEnvironment } from '../src/runtime.js'
import { runMigration } from '../src/migrate.js'
import { createApp } from '../src/app.js'
const service = { create: async () => ({ ok: true }), get: async () => ({}), resolve: async () => 'https://example.com' }
test('env preserves process values and loads file independent of cwd', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'sl-env-')); const file = join(dir, '.env')
  await writeFile(file, 'DATABASE_URL=postgresql://file/db\nPUBLIC_BASE_URL=https://file.example')
  const env = { DATABASE_URL: 'postgresql://process/db' }; const cwd = process.cwd(); process.chdir(tmpdir())
  try { loadEnvironment({ env, envPath: file }) } finally { process.chdir(cwd) }
  assert.equal(env.DATABASE_URL, 'postgresql://process/db'); assert.equal(env.PUBLIC_BASE_URL, 'https://file.example')
  assert.throws(() => loadConfig({}), /DATABASE_URL/)
})
test('migration commits, repeats, rolls back and cleans up', async () => {
  const calls = []; let ended = 0
  const client = { query: async sql => calls.push(sql), release() {} }; const pool = { connect: async () => client, end: async () => { ended++ } }
  await runMigration({ pool, sql: 'SQL' }); await runMigration({ pool, sql: 'SQL' })
  assert.deepEqual(calls, ['BEGIN','SQL','COMMIT','BEGIN','SQL','COMMIT']); assert.equal(ended, 2)
  const failCalls = []; let failEnded = false
  const failPool = { connect: async () => ({ query: async sql => { failCalls.push(sql); if (sql === 'BAD') throw new Error('postgresql://user:password@host/db') }, release() {} }), end: async () => { failEnded = true } }
  await assert.rejects(runMigration({ pool: failPool, sql: 'BAD' }), e => !/password|@host/.test(e.message))
  assert.deepEqual(failCalls, ['BEGIN','BAD','ROLLBACK']); assert.equal(failEnded, true)
})
test('production fixture serves home/assets while API and redirect retain precedence', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'sl-build-')); await writeFile(join(dir, 'index.html'), '<h1>app</h1>'); await writeFile(join(dir, 'app.js'), 'asset')
  const app = createApp({ service, buildDirectory: new URL(`file:///${dir.replace(/\\/g, '/')}/`) })
  assert.match((await request(app).get('/')).text, /app/); assert.equal((await request(app).get('/app.js')).text, 'asset')
  assert.equal((await request(app).post('/api/short-links').send({ originalUrl: 'https://example.com' })).status, 201)
  assert.equal((await request(app).get('/demo123')).status, 302)
})

test('missing production build fails before startup can listen', async () => {
  const { assertProductionBuild } = await import('../src/runtime.js')
  const missing = new URL(`file:///${join(tmpdir(), 'missing-build', 'dist').replace(/\\/g, '/')}/`)
  await assert.rejects(assertProductionBuild(missing), /Production build is missing/)
})
