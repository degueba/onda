import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  // /registry and /lib live outside /www. Next.js needs explicit permission
  // to compile TS/TSX sources from outside the project root.
  experimental: {
    externalDir: true,
  },
};

export default config;
