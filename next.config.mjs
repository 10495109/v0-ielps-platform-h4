/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  basePath: process.env.IELPS_PANEL_BASE_PATH || '',
  // The panel is mounted behind `location = /learner { return 302 /learner/; }`
  // and `location ^~ /learner/`. With Next's default the app would answer
  // /learner/ with a 308 to /learner, nginx would send that straight back to
  // /learner/, and the Access Panel home would be an infinite redirect loop.
  // Making the trailing slash canonical means /learner/ is served directly and
  // no nginx change is needed. Existing no-slash addresses still resolve, via
  // one 308.
  trailingSlash: true,
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
      { source: '/lesson', destination: '/app/adult/player/', permanent: false },
      { source: '/discover', destination: '/app/adult/discover/', permanent: false },
    ]
  },
}

export default nextConfig
