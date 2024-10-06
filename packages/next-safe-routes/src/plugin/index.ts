import { NextConfig } from 'next';
import { generateRoutes } from '@/core';
import path from 'path';
import { isUsingSrcDirectory } from '@/utils/is-using-src-directory';
import { getFullOuptutPath } from '@/utils/get-output-path';

interface SafeRoutesConfig {
  outPath?: string;
}

function buildRoutes(outPath: string) {
  const useSrcDir = isUsingSrcDirectory();
  const rootDir = process.cwd();
  const srcDir = useSrcDir ? 'src' : '';
  const fullPagesDir = path.join(rootDir, srcDir, 'app');
  const fullOutputPath = getFullOuptutPath(outPath, useSrcDir);

  try {
    generateRoutes(fullPagesDir, fullOutputPath);
    console.log('Routes generated successfully for this build.');
  } catch (error: any) {
    console.error('Error generating routes for this build', error);
  }
}

const cache = new Map<string, boolean>();

export function withNextSafeRoutes(
  nextConfig: NextConfig = {},
  safeRoutesConfig: SafeRoutesConfig = {
    outPath: 'types/routes.ts',
  }
): NextConfig {
  const { outPath = 'types/routes.ts' } = safeRoutesConfig;

  const nextSafeRoutesConfig: Partial<NextConfig> = {
    ...nextConfig,
  };

  nextSafeRoutesConfig.webpack = function (
    ...[config, options]: Parameters<NonNullable<NextConfig['webpack']>>
  ) {
    const { isServer, buildId } = options;

    if (isServer && !cache.has(buildId)) {
      // Generate routes only if they haven't been generated in this build
      buildRoutes(outPath);
      cache.set(buildId, true);
    }

    if (typeof nextConfig.webpack === 'function') {
      return nextConfig.webpack(config, options);
    }

    return config;
  };

  return nextSafeRoutesConfig;
}
