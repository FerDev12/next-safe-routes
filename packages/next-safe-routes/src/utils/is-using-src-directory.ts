import fs from 'fs';
import path from 'path';

export function isUsingSrcDirectory(): boolean {
  const rootDir = process.cwd();
  const srcDir = path.join(rootDir, 'src');

  // Check if the src directory exists
  if (fs.existsSync(srcDir)) {
    // Check for common Next.js directories within src
    const commonDirs = ['pages', 'app', 'components'];
    for (const dir of commonDirs) {
      if (fs.existsSync(path.join(srcDir, dir))) {
        return true;
      }
    }
  }

  // If src doesn't exist or doesn't contain common Next.js directories, assume it's not used.
  return false;
}
