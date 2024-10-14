import { withNextSafeRoutes } from 'next-safe-routes/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = withNextSafeRoutes(
  {},
  { withI18N: true, locales: ['en', 'es', 'de'] }
);

export default nextConfig;
