import { errorOf } from '../errors.js'

const CODE = /^[A-Za-z0-9_-]{3,32}$/

export function validateOriginalUrl(value) {
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
    return url.toString()
  } catch {
    throw errorOf(400, 'INVALID_ORIGINAL_URL', '原始網址必須是完整的 HTTP 或 HTTPS 網址')
  }
}

export function validateShortCode(value, optional = false) {
  if (optional && (value === undefined || value === '')) return null
  if (typeof value !== 'string' || !CODE.test(value)) {
    throw errorOf(400, 'INVALID_SHORT_CODE', '短碼需為 3–32 位英數字、連字號或底線')
  }
  return value
}
