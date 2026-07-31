export function loadConfig(env = process.env) {
  const databaseUrl = env.DATABASE_URL?.trim()
  if (!databaseUrl) throw new Error('Missing required environment variable: DATABASE_URL')

  let publicBaseUrl
  try {
    const parsed = new URL(env.PUBLIC_BASE_URL)
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error()
    publicBaseUrl = parsed.toString().replace(/\/$/, '')
  } catch {
    throw new Error('PUBLIC_BASE_URL must be an absolute HTTP or HTTPS URL')
  }

  const port = env.PORT === undefined ? 3000 : Number(env.PORT)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer from 1 through 65535')
  }
  return { databaseUrl, publicBaseUrl, port, isProduction: env.NODE_ENV === 'production' }
}
