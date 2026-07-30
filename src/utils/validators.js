const SHORT_CODE_PATTERN = /^[A-Za-z0-9_-]{3,32}$/

export function validateOriginalUrl(value) {
  const normalizedValue = value.trim()

  if (!normalizedValue) {
    return '請輸入原始網址'
  }

  if (!/^[a-z][a-z\d+.-]*:\/\//i.test(normalizedValue)) {
    return '請輸入包含 http:// 或 https:// 的完整網址'
  }

  let url
  try {
    url = new URL(normalizedValue)
  } catch {
    return '請輸入包含 http:// 或 https:// 的完整網址'
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    return '網址僅支援 http:// 或 https://'
  }

  if (!url.hostname) {
    return '請輸入包含 http:// 或 https:// 的完整網址'
  }

  return ''
}

export function validateShortCode(value) {
  if (!value || SHORT_CODE_PATTERN.test(value)) {
    return ''
  }

  return '短碼需為 3–32 位英數字、連字號或底線'
}
