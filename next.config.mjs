/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  basePath: process.env.IELPS_PANEL_BASE_PATH || '',
  turbopack: { root: process.cwd() },
  images: {
    unoptimized: true,
  },
  async redirects() {
    // /learner/lesson and /learner/discover are approved parts of the
    // architecture and are live today on the release this build replaces.
    // They are kept as aliases so no existing link breaks. basePath is applied
    // to both sides automatically, so under IELPS_PANEL_BASE_PATH=/learner
    // these are /learner/lesson and /learner/discover.
    return [
      { source: '/lesson', destination: '/app/adult/player', permanent: false },
      { source: '/discover', destination: '/app/adult/discover', permanent: false },
    ]
  },
}

export default nextConfig
