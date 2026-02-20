/** @type {import('next').NextConfig} */

// PRODUCTION: point /api to Railway backend
const PRODUCTION_API_BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://neuron-book-production.up.railway.app";

const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "50mb" },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  rewrites: async () => {
    return [
      {
        source: "/api/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:5328/api/:path*"
            : `${PRODUCTION_API_BACKEND}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
