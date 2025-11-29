/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['arweave.net', 'ipfs.io'],
  },
  experimental: {
    // Externalize dkg.js and its dependencies to avoid webpack bundling issues
    serverComponentsExternalPackages: ['dkg.js', 'assertion-tools', 'ethers'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize these packages on the server to avoid bundling issues
      config.externals = config.externals || [];
      config.externals.push('dkg.js', 'assertion-tools', 'ethers');
    }
    return config;
  },
}

module.exports = nextConfig
