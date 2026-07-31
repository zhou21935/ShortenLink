import { randomInt } from 'node:crypto'
import { errorOf } from '../errors.js'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
export const generateShortCode = () =>
  Array.from({ length: 7 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')

const mapRow = (row, base) => ({
  originalUrl: row.original_url,
  shortCode: row.short_code,
  shortUrl: `${base}/${row.short_code}`,
  clickCount: Number(row.click_count),
})

export function createShortLinksService({ pool, publicBaseUrl, codeGenerator = generateShortCode }) {
  const insert = async (originalUrl, shortCode) => {
    const { rows } = await pool.query(
      'INSERT INTO short_links (original_url, short_code) VALUES ($1, $2) RETURNING original_url, short_code, click_count',
      [originalUrl, shortCode],
    )
    return mapRow(rows[0], publicBaseUrl)
  }
  return {
    async create({ originalUrl, customCode }) {
      if (customCode) {
        try { return await insert(originalUrl, customCode) } catch (error) {
          if (error.code === '23505') throw errorOf(409, 'SHORT_CODE_CONFLICT', '此短碼已被使用')
          throw error
        }
      }
      for (let attempt = 0; attempt < 5; attempt += 1) {
        try { return await insert(originalUrl, codeGenerator()) } catch (error) {
          if (error.code !== '23505') throw error
        }
      }
      throw errorOf(503, 'SHORT_CODE_GENERATION_FAILED', '目前無法產生短碼，請稍後再試')
    },
    async get(shortCode) {
      const { rows } = await pool.query(
        'SELECT original_url, short_code, click_count FROM short_links WHERE short_code = $1',
        [shortCode],
      )
      if (!rows[0]) throw errorOf(404, 'SHORT_LINK_NOT_FOUND', '找不到此短網址')
      return mapRow(rows[0], publicBaseUrl)
    },
    async resolve(shortCode) {
      const { rows } = await pool.query(
        'UPDATE short_links SET click_count = click_count + 1 WHERE short_code = $1 RETURNING original_url',
        [shortCode],
      )
      return rows[0]?.original_url ?? null
    },
  }
}
