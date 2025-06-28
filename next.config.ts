/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Untuk deployment
  images: {
    domains: [
      'localhost',
      'vercel.app',
      'railway.app',
      'cloudinary.com',
      'res.cloudinary.com'
    ], // Domain untuk upload gambar
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
}

module.exports = nextConfig
