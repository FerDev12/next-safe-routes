import { NextConfig } from 'next';
import { generateRoutes } from '@/core';
import path from 'path';
import { isUsingSrcDirectory } from '@/utils/is-using-src-directory';
import { getFullOuptutPath } from '@/utils/get-output-path';

interface SafeRoutesConfig {
  outPath?: string;
  verbose?: boolean;
}

function buildRoutes(pagesDir: string, outPath: string, verbose: boolean) {
  if (verbose) {
    console.log(`Generating routes from ${pagesDir} for this build`);
    console.log(`Output file: ${outPath}`);
  }

  try {
    generateRoutes(pagesDir, outPath);
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
    verbose: false,
  }
): NextConfig {
  const { outPath = 'types/routes.ts', verbose = false } = safeRoutesConfig;

  const nextSafeRoutesConfig: Partial<NextConfig> = {
    ...nextConfig,
  };

  nextSafeRoutesConfig.webpack = function (
    ...[config, options]: Parameters<NonNullable<NextConfig['webpack']>>
  ) {
    const { isServer, buildId } = options;

    if (isServer && !cache.has(buildId)) {
      // Generate routes only if they haven't been generated in this build
      const useSrcDir = isUsingSrcDirectory();
      const rootDir = process.cwd();
      const srcDir = useSrcDir ? 'src' : '';
      const fullPagesDir = path.join(rootDir, srcDir, 'app');
      const fullOutputPath = getFullOuptutPath(outPath, useSrcDir);
      buildRoutes(fullPagesDir, fullOutputPath, verbose);
      cache.set(buildId, true);
    }

    if (typeof nextConfig.webpack === 'function') {
      return nextConfig.webpack(config, options);
    }

    return config;
  };

  return nextSafeRoutesConfig;
}
