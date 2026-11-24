import { BadRequestError } from '@licenseplate-checker/shared/types'

/**
 * Narrows a route param to a string. Hono types `c.req.param()` as
 * `string | undefined` when it can't infer the route path, e.g. behind
 * middleware or with an explicit `Context` parameter.
 */
export function requireParam(value: string | undefined, name: string): string {
  if (!value) {
    throw new BadRequestError(`Missing route parameter: ${name}`, 'MISSING_PARAM')
  }
  return value
}
