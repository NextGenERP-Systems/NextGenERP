const apiUrl = (process.env.CRM_API_URL || 'http://localhost:8088').replace(/\/$/, '');
const parsed = new URL(apiUrl);
if (!['http:', 'https:'].includes(parsed.protocol) || parsed.pathname !== '/' || parsed.search || parsed.hash) {
  throw new Error('CRM_API_URL must be an HTTP origin');
}
const config = {
  output: 'standalone',
  poweredByHeader: false,
  async rewrites() {
    return [{ source: '/api/v1/crm/:path*', destination: `${apiUrl}/api/v1/crm/:path*` }];
  },
};
export default config;
