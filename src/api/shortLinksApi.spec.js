import { afterEach, describe, expect, it, vi } from 'vitest'

import { createShortLink, ShortLinkApiError } from './shortLinksApi'

const createdLink = {
  originalUrl: 'https://example.com/article',
  shortCode: 'news_2026',
  shortUrl: 'https://sho.rt/news_2026',
  clickCount: 0,
}

function mockResponse(payload, { ok = true, status = 201 } = {}) {
  return { ok, status, json: vi.fn().mockResolvedValue(payload) }
}

describe('createShortLink', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('posts a custom code and returns the backend result', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(createdLink))
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      createShortLink({ originalUrl: createdLink.originalUrl, customCode: 'news_2026' }),
    ).resolves.toEqual(createdLink)
    expect(fetchMock).toHaveBeenCalledWith('/api/short-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originalUrl: 'https://example.com/article',
        customCode: 'news_2026',
      }),
    })
  })

  it('omits an empty custom code from the request', async () => {
    const automaticResult = {
      ...createdLink,
      shortCode: 'q7X2k9P',
      shortUrl: 'https://sho.rt/q7X2k9P',
    }
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(automaticResult))
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      createShortLink({ originalUrl: createdLink.originalUrl, customCode: '' }),
    ).resolves.toEqual(automaticResult)
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      originalUrl: 'https://example.com/article',
    })
  })

  it('exposes a stable backend error contract', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        mockResponse(
          { error: { code: 'SHORT_CODE_CONFLICT', message: '此短碼已被使用' } },
          { ok: false, status: 409 },
        ),
      ),
    )

    const error = await createShortLink({
      originalUrl: createdLink.originalUrl,
      customCode: 'news_2026',
    }).catch((reason) => reason)

    expect(error).toBeInstanceOf(ShortLinkApiError)
    expect(error).toMatchObject({
      code: 'SHORT_CODE_CONFLICT',
      message: '此短碼已被使用',
      status: 409,
    })
  })

  it('classifies a rejected fetch as a network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('connection details')))

    await expect(
      createShortLink({ originalUrl: createdLink.originalUrl, customCode: '' }),
    ).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      message: '目前無法建立短網址，請稍後再試',
    })
  })

  it('classifies invalid success and error payloads as unknown errors', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockResponse({ unexpected: true }))
      .mockResolvedValueOnce(mockResponse({ error: 'raw SQL' }, { ok: false, status: 500 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      createShortLink({ originalUrl: createdLink.originalUrl, customCode: '' }),
    ).rejects.toMatchObject({ code: 'UNKNOWN_ERROR' })
    await expect(
      createShortLink({ originalUrl: createdLink.originalUrl, customCode: '' }),
    ).rejects.toMatchObject({
      code: 'UNKNOWN_ERROR',
      message: '目前無法建立短網址，請稍後再試',
    })
  })
})