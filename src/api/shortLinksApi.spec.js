import { describe, expect, it } from 'vitest'

import { createShortLink } from './shortLinksApi'

describe('createShortLink', () => {
  it('returns the fixed result shape with a custom code', async () => {
    await expect(
      createShortLink({
        originalUrl: 'https://example.com/article',
        customCode: 'news_2026',
      }),
    ).resolves.toEqual({
      originalUrl: 'https://example.com/article',
      shortCode: 'news_2026',
      shortUrl: 'https://sho.rt/news_2026',
      clickCount: 0,
    })
  })

  it('uses the predictable automatic code when custom code is empty', async () => {
    const result = await createShortLink({
      originalUrl: 'https://example.com/article',
      customCode: '',
    })

    expect(result.shortCode).toBe('q7X2k9P')
    expect(result.shortUrl).toBe('https://sho.rt/q7X2k9P')
  })
})
