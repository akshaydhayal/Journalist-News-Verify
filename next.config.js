/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['arweave.net', 'ipfs.io'],
  },
  // Externalize DKG packages to avoid webpack bundling issues with ethers
  experimental: {
    serverComponentsExternalPackages: ['dkg.js', 'assertion-tools', 'dkg-evm-module', 'ethers'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle these packages - let Node.js resolve them at runtime
      config.externals = [...(config.externals || []), 
        'dkg.js', 
        'assertion-tools', 
        'dkg-evm-module',
        'ethers',
        /^dkg\.js\/.*/,
        /^assertion-tools\/.*/,
        /^ethers\/.*/,
      ];
    }
    return config;
  },
}

module.exports = nextConfig
