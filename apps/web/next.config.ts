import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {
    resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.mjs'],
  },
}

export default nextConfig
