/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      resolveExtensions: [
        '.mdx',
        '.tsx',
        '.ts',
        '.jsx',
        '.js',
        '.mjs',
        '.json',
      ],
    },
  },
  eslint: {
    dirs: ['app', 'lib', 'components'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
