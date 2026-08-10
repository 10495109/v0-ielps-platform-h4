/** @type {import('next').NextConfig} */
const nextConfig = {
  // Served from the live server's static learner mount, so the app is exported
  // as plain files under /learner. Same-origin means the browser can call the
  // live EILPS API directly - no proxy route is needed.
  output: 'export',
  basePath: '/learner',
  trailingSlash: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
