/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa');

const config = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true
  }
};

const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
};

module.exports = withPWA(pwaConfig)(config);