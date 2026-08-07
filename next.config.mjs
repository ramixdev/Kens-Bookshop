/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // pg optionally tries to load pg-native (a C addon) — we don't have it installed.
      // Tell webpack to resolve it to false so it silently falls back to pure-JS pg.
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "pg-native": false,
      };
    }
    return config;
  },
};

export default nextConfig;
