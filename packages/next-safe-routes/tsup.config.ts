import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/lib/plugin/index.ts',
    'src/lib/navigation/index.ts',
    'src/lib/navigation/create-get-safe-route.ts',
    'src/types/index.ts',
    'src/cli/generate-routes.ts',
  ],
  format: ['cjs', 'esm'], // Build for commonJS and ESmodules
  dts: true, // Generate declaration file (.d.ts)
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  external: ['next', 'react', 'react-dom'],
});
