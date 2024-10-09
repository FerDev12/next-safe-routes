import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/plugin/index.ts',
    'src/navigation/index.ts',
    'src/navigation/create-get-safe-route.ts',
    'src/types/index.ts',
    'src/cli/index.ts',
  ],
  format: ['cjs', 'esm'], // Build for commonJS and ESmodules
  dts: true, // Generate declaration file (.d.ts),
  sourcemap: false, // TODO: Only emit when in development
  clean: true,
  outDir: 'dist',
  splitting: false,
  minify: true,
  external: ['next', 'react', 'react-dom', '@types/react', '@types/react-dom'],
});
