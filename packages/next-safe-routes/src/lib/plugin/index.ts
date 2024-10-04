import { NextConfig } from 'next';
import { generateRoutes } from '@/core';
import path from 'path';
import webpack from 'webpack';

interface SafeRoutesConfig {
  useSrcDirectory?: boolean;
  outputPath?: string;
}

// This flag will be reset at the start of each build
let hasGeneratedRoutes = false;

export function withNextSafeRoutes(
  nextConfig: NextConfig = {},
  safeRoutesConfig?: SafeRoutesConfig
): NextConfig {
  const config: SafeRoutesConfig = {
    useSrcDirectory: safeRoutesConfig?.useSrcDirectory ?? true,
    outputPath: safeRoutesConfig?.outputPath ?? 'types/routes.ts',
  };

  const { useSrcDirectory, outputPath } = config;

  return {
    ...nextConfig,
    webpack: (config, options) => {
      if (options.isServer) {
        // Reset the flag at the start of each build
        config.plugins.push(
          new webpack.ProgressPlugin((percentage) => {
            if (percentage === 0) {
              hasGeneratedRoutes = false;
            }
          })
        );

        // Generate routes only if they haven't been generated in this build
        if (!hasGeneratedRoutes) {
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
          hasGeneratedRoutes = true;
          console.log('Routes generated successfully for this build.');
        }
      }

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }

      return config;
    },
  };
}
