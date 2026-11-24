import type { Context } from 'hono'

/**
 * Hook for `zValidator` that keeps the 400 body for failed validation as
 * `{ success: false, error: { issues, name: 'ZodError' } }`.
 *
 * zod 4 serialises a ZodError as `{ name, message }` where `message` is a JSON
 * string, and drops `issues`. Without this hook the response body that
 * `zValidator` sends on validation failure would change shape.
 */
export const zodErrorHook = (
  result: { success: boolean; error?: { issues: unknown[] } },
  c: Context
) => {
  if (!result.success && result.error) {
    return c.json(
      {
        success: false as const,
        error: { issues: result.error.issues, name: 'ZodError' },
      },
      400
    )
  }
}
