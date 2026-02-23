import { Scalar } from '@scalar/hono-api-reference'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

export const docsRouter = new Hono()

docsRouter.get(
  '/',
  Scalar({
    url: '/openapi.json',
    theme: 'kepler',
    layout: 'modern',
    defaultHttpClient: { targetKey: 'js', clientKey: 'fetch' },
  })
)

export const openapiRoute = new Hono()

openapiRoute.get('/', cors({ origin: '*' }), async (c) => {
  const spec = await Bun.file(
    new URL('../../openapi.json', import.meta.url).pathname
  ).json()
  return c.json(spec)
})
