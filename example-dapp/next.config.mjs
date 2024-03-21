/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push("pino-pretty");

    config.resolve.fallback = {
      fs: false,
    };

    return config;
  },
};

export default nextConfig;
