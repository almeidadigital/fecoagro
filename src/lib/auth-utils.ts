const INVALID_TOKEN_PATTERNS = [
  'Invalid Refresh Token',
  'Refresh Token Not Found',
  'refresh_token_not_found',
  'invalid_refresh_token',
  'JWT expired',
]

export function isInvalidTokenError(error: unknown): boolean {
  if (!error) return false
  const message =
    typeof error === 'string'
      ? error
      : String((error as Record<string, unknown>)?.message || '')
  return INVALID_TOKEN_PATTERNS.some((p) =>
    message.toLowerCase().includes(p.toLowerCase()),
  )
}

export async function clearStaleSession(): Promise<void> {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (
        key.startsWith('sb-') &&
        (key.includes('-auth-token') || key.includes('auth-token'))
      ) {
        localStorage.removeItem(key)
      }
    })
  } catch {
    // localStorage may be unavailable
  }
}

export function isAuthApiError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const err = error as Record<string, unknown>
  return (
    err.name === 'AuthApiError' ||
    err.__isAuthError === true ||
    isInvalidTokenError(error)
  )
}
