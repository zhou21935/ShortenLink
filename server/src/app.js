import express from 'express'
import { fileURLToPath } from 'node:url'
import { AppError } from './errors.js'
import { validateOriginalUrl, validateShortCode } from './validation/shortLinks.js'
const missingHtml = '<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><title>找不到短網址</title><body><h1>找不到短網址</h1></body></html>'
export function createApp({ service, healthCheck = async () => {}, buildDirectory }) {
  const app = express(); app.disable('x-powered-by'); app.use(express.json())
  app.get('/api/health', async (req, res) => { try { await healthCheck(); res.json({ status: 'ok' }) } catch { res.status(503).json({ status: 'unavailable' }) } })
  app.post('/api/short-links', async (req, res, next) => { try { res.status(201).json(await service.create({ originalUrl: validateOriginalUrl(req.body?.originalUrl), customCode: validateShortCode(req.body?.customCode, true) })) } catch (e) { next(e) } })
  app.get('/api/short-links/:shortCode', async (req, res, next) => { try { res.json(await service.get(validateShortCode(req.params.shortCode))) } catch (e) { next(e) } })
  if (buildDirectory) {
    const root = fileURLToPath(buildDirectory)
    app.use(express.static(root, { index: false }))
    app.get('/', (req, res) => res.sendFile('index.html', { root }))
  }
  app.get('/:shortCode', async (req, res, next) => { try { const target = await service.resolve(validateShortCode(req.params.shortCode)); return target ? res.redirect(302, target) : res.status(404).type('html').send(missingHtml) } catch (e) { return next(e) } })
  app.use((error, req, res, next) => { if (res.headersSent) return next(error); if (error instanceof AppError) return res.status(error.status).json({ error: { code: error.code, message: error.message } }); return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '伺服器發生錯誤' } }) })
  return app
}
