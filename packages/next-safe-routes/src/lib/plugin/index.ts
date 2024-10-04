// src/next-plugin.ts

import { NextConfig } from 'next';
import { generateRoutes } from '@/core';
import path from 'path';

interface TypedRoutesConfig {
  useSrcDirectory?: boolean;
  outputPath?: string;
}

export function withNextSafeRoutes(
  nextConfig: NextConfig = {},
  typedRoutesConfig?: TypedRoutesConfig
): NextConfig {
  const config: TypedRoutesConfig = {
    useSrcDirectory: typedRoutesConfig?.useSrcDirectory ?? true,
    outputPath: typedRoutesConfig?.outputPath ?? 'types/routes.ts',
  };

  const { useSrcDirectory, outputPath } = config;

  return {
    ...nextConfig,
    webpack: (config, options) => {
      if (options.isServer) {
        const rootDir = process.cwd();
        const srcDir = useSrcDirectory ? 'src' : '';
        const fullPagesDir = path.join(rootDir, srcDir, 'app');
        const fullOutputPath = path.join(
          rootDir,
          srcDir,
          outputPath
            ? outputPath.startsWith('src') ||
              outputPath.startsWith('./src') ||
              outputPath.startsWith('/src')
              ? outputPath.slice(outputPath.indexOf('c') + 1)
              : outputPath
            : 'types/routes.ts'
        );

        generateRoutes(fullPagesDir, fullOutputPath);
      }

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }

      return config;
    },
  };
}
