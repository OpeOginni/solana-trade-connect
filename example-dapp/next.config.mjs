/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push("pino-pretty");

    config.resolve.fallback = {
      fs: false,
    };

    return config;
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tailwindui.com",
        port: "",
        pathname: "/img/**",
      },
      {
        protocol: "https",
        hostname: "nftstorage.link",
        port: "",
        pathname: "/ipfs/**",
      },
    ],
  },
};

export default nextConfig;
