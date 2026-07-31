import test from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { loadConfig } from '../src/config.js'
import { createApp } from '../src/app.js'
import { createShortLinksService } from '../src/services/shortLinksService.js'
import { validateOriginalUrl, validateShortCode } from '../src/validation/shortLinks.js'

const item = {
  originalUrl: 'https://example.com/article',
  shortCode: 'news_2026',
  shortUrl: 'https://sho.rt/news_2026',
  clickCount: 0,
}
const stub = (overrides = {}) => ({
  create: async () => item, get: async () => item,
  resolve: async () => item.originalUrl, ...overrides,
})

test('configuration validates required values', () => {
  assert.equal(loadConfig({
    DATABASE_URL: 'postgresql://localhost/db', PUBLIC_BASE_URL: 'https://sho.rt/',
  }).publicBaseUrl, 'https://sho.rt')
  assert.throws(() => loadConfig({ PUBLIC_BASE_URL: 'https://sho.rt' }))
  assert.throws(() => loadConfig({
    DATABASE_URL: 'postgresql://localhost/db', PUBLIC_BASE_URL: 'ftp://sho.rt',
  }))
})

for (const [url, valid] of [
  ['https://example.com/article', true], ['http://example.com', true],
  ['example.com', false], ['ftp://example.com', false], ['', false],
]) test(`validates URL ${url || 'empty'}`, () => {
  valid ? assert.doesNotThrow(() => validateOriginalUrl(url))
    : assert.throws(() => validateOriginalUrl(url), { code: 'INVALID_ORIGINAL_URL' })
})

for (const [code, valid] of [
  ['', true], ['abc', true], ['news_2026', true], ['a'.repeat(32), true],
  ['ab', false], ['a/b', false], ['a'.repeat(33), false],
]) test(`validates code ${code || 'empty'}`, () => {
  valid ? assert.doesNotThrow(() => validateShortCode(code, true))
    : assert.throws(() => validateShortCode(code, true), { code: 'INVALID_SHORT_CODE' })
})

test('create, metadata, redirect and HTML 404 routes', async () => {
  const app = createApp({ service: stub() })
  assert.equal((await request(app).post('/api/short-links').send({
    originalUrl: item.originalUrl, customCode: item.shortCode,
  })).status, 201)
  assert.deepEqual((await request(app).get('/api/short-links/news_2026')).body, item)
  assert.equal((await request(app).get('/news_2026')).headers.location, item.originalUrl)
  const missing = await request(createApp({ service: stub({ resolve: async () => null }) }))
    .get('/missing')
  assert.equal(missing.status, 404)
  assert.match(missing.headers['content-type'], /text\/html/)
})

test('conflicts retry five times and unexpected errors are hidden', async () => {
  let attempts = 0
  const pool = { query: async () => {
    attempts += 1
    throw Object.assign(new Error('SQL password'), { code: '23505' })
  } }
  const service = createShortLinksService({
    pool, publicBaseUrl: 'https://sho.rt', codeGenerator: () => 'Abc1234',
  })
  await assert.rejects(service.create({ originalUrl: item.originalUrl }), {
    code: 'SHORT_CODE_GENERATION_FAILED',
  })
  assert.equal(attempts, 5)
  const response = await request(createApp({ service: stub({
    get: async () => { throw new Error('SQL password') },
  }) })).get('/api/short-links/news_2026')
  assert.equal(response.status, 500)
  assert.doesNotMatch(response.text, /SQL|password/)
})

test('resolve uses one atomic parameterized update', async () => {
  const calls = []
  const service = createShortLinksService({
    pool: { query: async (...args) => (calls.push(args), { rows: [{ original_url: item.originalUrl }] }) },
    publicBaseUrl: 'https://sho.rt',
  })
  assert.equal(await service.resolve(item.shortCode), item.originalUrl)
  assert.match(calls[0][0], /click_count = click_count \+ 1/)
  assert.deepEqual(calls[0][1], [item.shortCode])
})

test('database readiness has fixed safe responses', async () => {
  assert.deepEqual((await request(createApp({ service: stub(), healthCheck: async () => {} })).get('/api/health')).body, { status: 'ok' })
  const failed = await request(createApp({ service: stub(), healthCheck: async () => { throw new Error('SELECT password host') } })).get('/api/health')
  assert.equal(failed.status, 503); assert.deepEqual(failed.body, { status: 'unavailable' }); assert.doesNotMatch(failed.text, /SELECT|password|host/)
})
