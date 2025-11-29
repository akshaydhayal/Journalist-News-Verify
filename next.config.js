const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['arweave.net', 'ipfs.io'],
  },
  // Use standalone output for proper file tracing
  output: 'standalone',
  // Include dkg-publish files in the serverless function bundle
  outputFileTracingIncludes: {
    '/api/publish': ['./dkg-publish/**/*'],
  },
  experimental: {
    outputFileTracingRoot: path.join(__dirname),
  },
}

module.exports = nextConfig

