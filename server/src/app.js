import express from 'express'
import { AppError } from './errors.js'
import { validateOriginalUrl, validateShortCode } from './validation/shortLinks.js'

const missingHtml = '<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><title>找不到短網址</title><body><h1>找不到短網址</h1></body></html>'

export function createApp({ service }) {
  const app = express()
  app.disable('x-powered-by')
  app.use(express.json())
  app.post('/api/short-links', async (req, res, next) => {
    try {
      const originalUrl = validateOriginalUrl(req.body?.originalUrl)
      const customCode = validateShortCode(req.body?.customCode, true)
      res.status(201).json(await service.create({ originalUrl, customCode }))
    } catch (error) { next(error) }
  })
  app.get('/api/short-links/:shortCode', async (req, res, next) => {
    try { res.json(await service.get(validateShortCode(req.params.shortCode))) }
    catch (error) { next(error) }
  })
  app.get('/:shortCode', async (req, res, next) => {
    try {
      const target = await service.resolve(validateShortCode(req.params.shortCode))
      if (!target) return res.status(404).type('html').send(missingHtml)
      return res.redirect(302, target)
    } catch (error) { return next(error) }
  })
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error)
    if (error instanceof AppError) {
      return res.status(error.status).json({ error: { code: error.code, message: error.message } })
    }
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '伺服器發生錯誤' } })
  })
  return app
}
