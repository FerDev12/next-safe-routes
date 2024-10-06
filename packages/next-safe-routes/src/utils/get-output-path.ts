import path from 'path';

export function getFullOuptutPath(
  basePath: string,
  useSrcDir: boolean
): string {
  let fullOutPath = basePath;
  const srcDir = useSrcDir ? 'src' : '';
  const rootDir = process.cwd();
  if (basePath.startsWith('src/')) {
    fullOutPath = basePath.slice(3);
  } else if (basePath.startsWith('/src/')) {
    fullOutPath = basePath.slice(4);
  } else if (basePath.startsWith('./src/')) {
    fullOutPath = basePath.slice(5);
  } else if (basePath.startsWith('/')) {
    fullOutPath = basePath.slice(1);
  }
  return path.join(rootDir, srcDir, fullOutPath);
}
