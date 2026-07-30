import { describe, expect, it } from 'vitest'

import { validateOriginalUrl, validateShortCode } from './validators'

describe('validateOriginalUrl', () => {
  it.each([
    ['https://example.com/article', ''],
    ['http://example.com', ''],
    ['example.com', '請輸入包含 http:// 或 https:// 的完整網址'],
    ['ftp://example.com', '網址僅支援 http:// 或 https://'],
    ['', '請輸入原始網址'],
  ])('validates %j', (value, expected) => {
    expect(validateOriginalUrl(value)).toBe(expected)
  })
})

describe('validateShortCode', () => {
  it.each([
    ['', ''],
    ['abc', ''],
    ['news_2026', ''],
    ['my-link', ''],
    ['ab', '短碼需為 3–32 位英數字、連字號或底線'],
    ['a/b', '短碼需為 3–32 位英數字、連字號或底線'],
  ])('validates %j', (value, expected) => {
    expect(validateShortCode(value)).toBe(expected)
  })
})
