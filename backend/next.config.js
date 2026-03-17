/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tamaño máximo del body en API routes
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },

  // Imágenes externas (Supabase Storage, etc.)
  images: {
    domains: ['localhost'],
  },

  // CORS para que el frontend Vite pueda llamar a la API
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.FRONTEND_URL || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
