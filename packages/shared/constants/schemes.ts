export const BLOCKED_URL_SCHEMES = ['file:', 'javascript:', 'data:', 'blob:', 'ftp:']

export const PRIVATE_IP_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
]

export const PRIVATE_HOSTNAMES = ['localhost', '[::1]', 'metadata.google.internal']
