#!/usr/bin/env node
// src/cli/generate-routes.ts

import path from 'path';
import fs from 'fs';
import yargs, { Arguments, CommandBuilder } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { isUsingSrcDirectory } from '@/utils/is-using-src-directory';
import { getFullOuptutPath } from '@/utils/get-output-path';
import { logger } from '@/utils/logger';

async function importGereateRoutes() {
  return await import('@/core');
}

type RouteOptions = Arguments & {
  outPath?: string;
  verbose?: boolean;
};

export function buildRoutes(
  pagesDir: string,
  outPath: string,
  verbose: boolean
) {
  if (verbose) {
    logger.info(`Generating routes from ${pagesDir}`);
    logger.info(`Output file: ${outPath}`);
  }

  importGereateRoutes()
    .then(({ generateRoutes }) => generateRoutes(pagesDir, outPath))
    .catch((error: any) => logger.error('Error generating routes:', error));
}

const builder: CommandBuilder<RouteOptions, RouteOptions> = (yargs) => {
  return yargs
    .option('outPath', {
      alias: 'out',
      type: 'string',
      description: 'Output path for the generated routes file',
      default: 'types/routes.ts',
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging',
      default: false,
    });
};

yargs(hideBin(process.argv))
  .command(
    '$0',
    'Generate typed routes for Next.js',
    builder,

    async (argv) => {
      const rootDir = process.cwd();
      const useSrcDir = isUsingSrcDirectory();
      const srcDir = useSrcDir ? 'src' : '';
      const pagesDir = path.join(rootDir, srcDir, 'app');
      const fullOutPath = getFullOuptutPath(argv.outPath!, useSrcDir);

      if (argv.verbose) {
        console.log('Verbose mode enabled');
        console.log('Current working directory:', rootDir);
        console.log('Using src directory:', useSrcDir);
      }

      if (!fs.existsSync(pagesDir)) {
        console.error(`Error: The directory ${pagesDir} does not exist`);
        process.exit(1);
      }

      buildRoutes(pagesDir, fullOutPath, argv.verbose!);
    }
  )
  .help().argv;
