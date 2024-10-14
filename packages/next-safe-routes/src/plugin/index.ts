import fs from 'fs';
import path from 'path';
import { NextConfig } from 'next';
import { generateRoutes } from '@/core';
import { isUsingSrcDirectory } from '@/utils/is-using-src-directory';
import { getFullOuptutPath } from '@/utils/get-output-path';
import { logger } from '@/utils/logger';

interface SafeRoutesConfig {
  outPath?: string;
  verbose?: boolean;
  withI18N?: boolean;
  locales?: string[];
}

const cache = new Map<string, boolean>();

function buildRoutes(
  pagesDir: string,
  outPath: string,
  verbose: boolean,
  opts?: {
    withI18N: boolean;
    locales: string[];
  }
) {
  if (verbose) {
    logger.info(`Generating routes from ${pagesDir} for this build`);
    logger.info(`Output file: ${outPath}`);
  }

  try {
    generateRoutes(pagesDir, outPath, {
      withI18N: opts?.withI18N,
      locales: opts?.locales,
    });
    logger.info('Routes generated successfully for this build.');
  } catch (error: any) {
    logger.error('Error generating routes for this build', error);
    throw error;
  }
}

export function withNextSafeRoutes(
  nextConfig: NextConfig = {},
  safeRoutesConfig: SafeRoutesConfig = {
    outPath: 'types/routes.ts',
    verbose: false,
    withI18N: false,
    locales: ['en'],
  }
): NextConfig {
  const {
    outPath = 'types/routes.ts',
    verbose = false,
    withI18N = false,
    locales = ['en'],
  } = safeRoutesConfig;

  const nextSafeRoutesConfig: Partial<NextConfig> = {
    ...nextConfig,
  };

  // Function to generate routes
  const generateSafeRoutes = (buildId: string) => {
    if (!cache.has(buildId)) {
      const useSrcDir = isUsingSrcDirectory();
      const rootDir = process.cwd();
      const srcDir = useSrcDir ? 'src' : '';
      const pagesDir = path.join(rootDir, srcDir, 'app');
      const outputPath = getFullOuptutPath(outPath, useSrcDir);

      if (verbose) {
        logger.info('Verbose mode enabled');
        logger.info('Current working directory:', rootDir);
        logger.info('Using src directory:', useSrcDir);
      }

      if (!fs.existsSync(pagesDir)) {
        throw new Error(`The directory ${pagesDir} does not exist`);
      }

      buildRoutes(pagesDir, outputPath, verbose, {
        locales,
        withI18N,
      });
      cache.set(buildId, true);
    }
  };

  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const useTurbo = process.env.TURBOPACK === '1';

  if (!useTurbo) {
    nextSafeRoutesConfig.webpack = function (
      ...[config, options]: Parameters<NonNullable<NextConfig['webpack']>>
    ) {
      const { isServer, buildId } = options;

      if (isServer) {
        generateSafeRoutes(buildId);
      }

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }

      return config;
    };
  } else {
    logger.warn('Turbopack is not yet supported.');
    if (verbose) {
      logger.info(
        'To generate routes while using turbopack either run your projects build command or use the cli tool.'
      );
    }
  }

  return nextSafeRoutesConfig;
}
