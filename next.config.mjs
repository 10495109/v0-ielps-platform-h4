/** @type {import('next').NextConfig} */
const nextConfig = {
  // Served from the live server's static learner mount, so the app is exported
  // as plain files under /learner. Same-origin means the browser can call the
  // live EILPS API directly - no proxy route is needed.
  output: 'export',
  // Defaults to the production mount. BASE_PATH lets the same source produce a
  // review copy at another path (e.g. a preview mount) without editing this
  // file, so the canonical build and the preview build differ only in where
  // they are served from.
  basePath: process.env.BASE_PATH ?? '/learner',
  trailingSlash: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
