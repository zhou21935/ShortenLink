import { createApp } from './app.js'
import { loadConfig } from './config.js'
import { createPool } from './db/pool.js'
import { createShortLinksService } from './services/shortLinksService.js'

const config = loadConfig()
const pool = createPool(config)
const service = createShortLinksService({ pool, publicBaseUrl: config.publicBaseUrl })
const server = createApp({ service }).listen(config.port)

const shutdown = () => server.close(async () => {
  await pool.end()
  process.exit(0)
})
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
