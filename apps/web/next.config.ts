import type { NextConfig } from 'next'

const path = require('path')
const nextConfig: NextConfig = {
  turbopack: {
    resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.mjs'],
    root: path.join(__dirname, '..'),
  },
}

export default nextConfig
