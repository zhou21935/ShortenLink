const MOCK_BASE_URL = 'https://sho.rt'
const AUTOMATIC_SHORT_CODE = 'q7X2k9P'

export async function createShortLink({ originalUrl, customCode }) {
  const shortCode = customCode || AUTOMATIC_SHORT_CODE

  return {
    originalUrl,
    shortCode,
    shortUrl: `${MOCK_BASE_URL}/${shortCode}`,
    clickCount: 0,
  }
}
