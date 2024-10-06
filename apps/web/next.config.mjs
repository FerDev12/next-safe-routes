import { withNextSafeRoutes } from 'next-safe-routes/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = withNextSafeRoutes({}, { useSrcDirectory: false });

export default nextConfig;
