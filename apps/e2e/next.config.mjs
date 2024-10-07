import { withNextSafeRoutes } from 'next-safe-routes/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = withNextSafeRoutes({}, { verbose: true });

export default nextConfig;
