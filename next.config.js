/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose']
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'www.imagineonline.store',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      }
    ]
  }
}

module.exports = nextConfig
