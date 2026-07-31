import test from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { DataType, newDb } from 'pg-mem'
import { createShortLinksService } from '../src/services/shortLinksService.js'

test('migration creates defaults and enforces short-code uniqueness', async () => {
  const db = newDb()
  db.public.registerFunction({
    name: 'gen_random_uuid',
    returns: DataType.uuid,
    implementation: randomUUID,
  })
  const sql = await readFile(
    new URL('../migrations/001_create_short_links.sql', import.meta.url),
    'utf8',
  )
  db.public.none(sql.replace('CREATE EXTENSION IF NOT EXISTS pgcrypto;', ''))
  db.public.none("INSERT INTO short_links (original_url, short_code) VALUES ('https://example.com', 'abc')")
  assert.equal(Number(db.public.one(
    "SELECT click_count FROM short_links WHERE short_code = 'abc'",
  ).click_count), 0)
  assert.throws(() => db.public.none(
    "INSERT INTO short_links (original_url, short_code) VALUES ('https://example.org', 'abc')",
  ))
})

test('ten concurrent redirects preserve all increments', async () => {
  let count = 0
  const service = createShortLinksService({
    pool: {
      query: async () => {
        count += 1
        return { rows: [{ original_url: 'https://example.com' }] }
      },
    },
    publicBaseUrl: 'https://sho.rt',
  })
  await Promise.all(Array.from({ length: 10 }, () => service.resolve('news_2026')))
  assert.equal(count, 10)
})
