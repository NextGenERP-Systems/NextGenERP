/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async rewrites() {
    const isDev = process.env.NODE_ENV === "development";
    const salesBackend =
      process.env.BACKEND_API_URL ||
      (isDev ? "http://localhost:8080/api/:path*" : "http://sales_backend:8080/api/:path*");
    const workflowBackend =
      process.env.WORKFLOW_API_URL ||
      (isDev ? "http://localhost:8081/api/:path*" : "http://workflow_backend:8081/api/:path*");

    return [
      {
        source: "/api/v1/workflows/:path*",
        destination: isDev
          ? "http://localhost:8081/api/v1/workflows/:path*"
          : "http://workflow_backend:8081/api/v1/workflows/:path*",
      },
      {
        source: "/api/v1/documents/:path*",
        destination: isDev
          ? "http://localhost:8081/api/v1/documents/:path*"
          : "http://workflow_backend:8081/api/v1/documents/:path*",
      },
      {
        source: "/api/v1/templates/:path*",
        destination: isDev
          ? "http://localhost:8081/api/v1/templates/:path*"
          : "http://workflow_backend:8081/api/v1/templates/:path*",
      },
      {
        source: "/api/v1/ocr/:path*",
        destination: isDev
          ? "http://localhost:8081/api/v1/ocr/:path*"
          : "http://workflow_backend:8081/api/v1/ocr/:path*",
      },
      {
        source: "/api/:path*",
        destination: salesBackend,
      },
    ];
  },
};

export default nextConfig;
