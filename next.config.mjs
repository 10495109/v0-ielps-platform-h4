/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  basePath: process.env.IELPS_PANEL_BASE_PATH || '',
  turbopack: { root: process.cwd() },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
