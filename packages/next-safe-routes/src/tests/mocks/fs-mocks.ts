import { vi } from 'vitest';
import fs from 'fs';

// Mock the fs module
export const fsMock = {
  readdirSync: vi.fn(),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  readFileSync: vi.fn(),
  existsSync: vi.fn(),
  statSync: vi.fn(),
};

// Mock the path module
export const pathMock = {
  join: vi.fn((...args) => args.join('/')),
  dirname: vi.fn((p) => p.split('/').slice(0, -1).join('/')),
};

// Helper function to create mock fs.Dirent objects
export function createMockDirent(
  name: string,
  isDirectory: boolean
): fs.Dirent {
  return {
    name,
    isDirectory: () => isDirectory,
    isFile: () => !isDirectory,
    isBlockDevice: () => false,
    isCharacterDevice: () => false,
    isSymbolicLink: () => false,
    isFIFO: () => false,
    isSocket: () => false,
  } as fs.Dirent;
}

// Helper function to create mock fs.Stats objects
export function createMockStats(isDirectory: boolean): fs.Stats {
  return {
    isDirectory: () => isDirectory,
    isFile: () => !isDirectory,
  } as fs.Stats;
}

// Helper function to setup mock file system
export function setupMockFileSystem(
  mockFileSystem: Record<string, fs.Dirent[]>
) {
  fsMock.readdirSync.mockImplementation((path: string) => {
    console.log(`Mock readdirSync called with: ${path}`);
    return mockFileSystem[path] || [];
  });

  fsMock.statSync.mockImplementation((path: string) => {
    console.log(`Mock statSync called with: ${path}`);
    const pathStr = path.toString();
    const fileName = pathStr.split('/').pop() || '';
    const isDirectory = !fileName.includes('.');
    return createMockStats(isDirectory);
  });
}

// Helper function to setup mock config files
export function setupMockConfigFiles(mockConfigs: Record<string, string>) {
  fsMock.readFileSync.mockImplementation((path: string) => {
    const pathStr = path.toString();
    return mockConfigs[pathStr] || '';
  });
}
