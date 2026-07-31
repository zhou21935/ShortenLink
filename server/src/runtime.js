import { access } from 'node:fs/promises'
import { constants } from 'node:fs'
import { config as loadDotenv } from 'dotenv'

export const serverEnvPath = new URL('../.env', import.meta.url)
export const defaultBuildDirectory = new URL('../../dist/', import.meta.url)

export function loadEnvironment({ env = process.env, envPath = serverEnvPath } = {}) {
  loadDotenv({ path: envPath, processEnv: env, override: false, quiet: true })
  return env
}

export async function assertProductionBuild(buildDirectory = defaultBuildDirectory) {
  try { await access(new URL('index.html', buildDirectory), constants.R_OK) }
  catch { throw new Error('Production build is missing: run npm run build before starting') }
  return buildDirectory
}
