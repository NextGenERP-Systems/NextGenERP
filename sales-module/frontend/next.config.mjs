/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          process.env.BACKEND_API_URL ||
          (process.env.NODE_ENV === "development"
            ? "http://localhost:8080/api/:path*"
            : "http://backend:8080/api/:path*"),
      },
    ];
  },
};

export default nextConfig;
