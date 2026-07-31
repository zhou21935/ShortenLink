import { createApp } from './app.js'
import { loadConfig } from './config.js'
import { createPool } from './db/pool.js'
import { createShortLinksService } from './services/shortLinksService.js'
import { assertProductionBuild, defaultBuildDirectory, loadEnvironment } from './runtime.js'

export async function startServer({ env = process.env, buildDirectory = defaultBuildDirectory } = {}) {
  const config = loadConfig(loadEnvironment({ env }))
  const pool = createPool(config)
  try {
    const productionBuild = config.isProduction ? await assertProductionBuild(buildDirectory) : undefined
    const service = createShortLinksService({ pool, publicBaseUrl: config.publicBaseUrl })
    const app = createApp({ service, buildDirectory: productionBuild, healthCheck: () => pool.query('SELECT 1') })
    const server = app.listen(config.port)
    const shutdown = () => server.close(async () => { await pool.end(); process.exit(0) })
    process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown)
    return { app, server, pool }
  } catch (error) { await pool.end(); throw error }
}
await startServer()
