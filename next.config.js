/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose']
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'images-na.ssl-images-amazon.com' },
      { protocol: 'https', hostname: 'www.imagineonline.store' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'rukminim1.flixcart.com' },
      { protocol: 'https', hostname: 'rukminim2.flixcart.com' },
      { protocol: 'https', hostname: 'rukmini1.flixcart.com' },
      { protocol: 'https', hostname: 'rukmini2.flixcart.com' },
      { protocol: 'https', hostname: 'assets.myntassets.com' },
      { protocol: 'http', hostname: 'assets.myntassets.com' },
    ]
  }
}

module.exports = nextConfig
