const CREATE_SHORT_LINK_PATH = '/api/short-links'
const UNKNOWN_ERROR_MESSAGE = '目前無法建立短網址，請稍後再試'

export class ShortLinkApiError extends Error {
  constructor(code, message, status = 0) {
    super(message)
    this.name = 'ShortLinkApiError'
    this.code = code
    this.status = status
  }
}

function isShortLinkResult(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.originalUrl === 'string' &&
    typeof value.shortCode === 'string' &&
    typeof value.shortUrl === 'string' &&
    typeof value.clickCount === 'number'
  )
}

export async function createShortLink({ originalUrl, customCode }) {
  const body = { originalUrl }
  if (customCode) body.customCode = customCode

  let response
  try {
    response = await fetch(CREATE_SHORT_LINK_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new ShortLinkApiError('NETWORK_ERROR', UNKNOWN_ERROR_MESSAGE)
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new ShortLinkApiError('UNKNOWN_ERROR', UNKNOWN_ERROR_MESSAGE, response.status)
  }

  if (!response.ok) {
    const apiError = payload?.error
    if (typeof apiError?.code === 'string' && typeof apiError?.message === 'string') {
      throw new ShortLinkApiError(apiError.code, apiError.message, response.status)
    }
    throw new ShortLinkApiError('UNKNOWN_ERROR', UNKNOWN_ERROR_MESSAGE, response.status)
  }

  if (!isShortLinkResult(payload)) {
    throw new ShortLinkApiError('UNKNOWN_ERROR', UNKNOWN_ERROR_MESSAGE, response.status)
  }

  return payload
}