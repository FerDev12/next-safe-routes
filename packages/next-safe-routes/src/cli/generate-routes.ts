#!/usr/bin/env node
// src/cli/generate-routes.ts

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import path from 'path';
import { generateRoutes } from '@/core';

yargs(hideBin(process.argv))
  .command(
    '$0',
    'Generate typed routes for Next.js',
    (yargs) => {
      return yargs
        .option('useSrcDir', {
          alias: 'src',
          type: 'boolean',
          description: 'Directory containing Next.js pages',
          default: true,
        })
        .option('outPath', {
          alias: 'out',
          type: 'string',
          description: 'Output path for the generated routes file',
          default: 'types/routes.ts',
        });
    },
    (argv) => {
      const rootDir = process.cwd();
      const useSrcDir = argv.useSrcDir;
      const srcDir = useSrcDir ? 'src' : '';
      const out =
        argv.outPath.startsWith('src') ||
        argv.outPath.startsWith('/src') ||
        argv.outPath.startsWith('./src')
          ? argv.outPath.slice(argv.outPath.indexOf('c') + 1)
          : argv.outPath;

      const pagesDir = path.join(rootDir, srcDir, 'app');
      const outPath = path.join(rootDir, srcDir, out);

      console.log({ outPath });

      console.log(`Generating routes from ${pagesDir}`);
      console.log(`Output file: ${outPath}`);

      generateRoutes(pagesDir, outPath);
    }
  )
  .help().argv;
