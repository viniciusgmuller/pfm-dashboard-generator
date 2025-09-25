/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_FLY_WORKER_URL: process.env.NEXT_PUBLIC_FLY_WORKER_URL || 'https://dashboard-gen-pfm.fly.dev',
  },
}

module.exports = nextConfig