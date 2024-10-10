import {
  createMockDirent,
  fsMock,
  pathMock,
  setupMockConfigFiles,
  setupMockFileSystem,
} from './mocks/fs-mocks';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateRoutes } from '../core';

// Mock the fs and path modules
vi.mock('fs', () => ({ default: fsMock }));

// Mock the path module
vi.mock('path', () => ({ default: pathMock }));

describe('generateRoutes', () => {
  const mockPagesDir = '/mock/src/app';
  const mockOutputPath = '/mock/src/output/routes.ts';

  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure the output directory exists
    fsMock.existsSync.mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should generate routes for a simple structure', () => {
    const mockFileSystem = {
      [mockPagesDir]: [
        createMockDirent('page.tsx', false),
        createMockDirent('about', true),
        createMockDirent('users', true),
      ],
      [`${mockPagesDir}/about`]: [createMockDirent('page.tsx', false)],
      [`${mockPagesDir}/users`]: [createMockDirent('[userId]', true)],
      [`${mockPagesDir}/users/[userId]`]: [createMockDirent('page.tsx', false)],
    };

    setupMockFileSystem(mockFileSystem);
    fsMock.readFileSync.mockReturnValue('');

    generateRoutes(mockPagesDir, mockOutputPath);

    const writeFileCall = fsMock.writeFileSync.mock.calls[0];
    expect(writeFileCall[0]).toBe(mockOutputPath);

    expect(writeFileCall[1]).toContain('export type Routes = {');
    expect(writeFileCall[1]).toContain("'/': {");
    expect(writeFileCall[1]).toContain("'/about': {");
    expect(writeFileCall[1]).toContain(
      "'/users/[userId]': { params: { userId: string };"
    );
  });

  it('should handle parallel routes', () => {
    const mockFileSystem = {
      [mockPagesDir]: [
        createMockDirent('@dashboard', true),
        createMockDirent('@auth', true),
      ],
      [`${mockPagesDir}/@dashboard`]: [createMockDirent('page.tsx', false)],
      [`${mockPagesDir}/@auth`]: [
        createMockDirent('page.tsx', false),
        createMockDirent('login', true),
        createMockDirent('register', true),
      ],
      [`${mockPagesDir}/@auth/login`]: [createMockDirent('page.tsx', false)],
      [`${mockPagesDir}/@auth/register`]: [createMockDirent('page.tsx', false)],
    };

    setupMockFileSystem(mockFileSystem);
    fsMock.readFileSync.mockReturnValue('');

    generateRoutes(mockPagesDir, mockOutputPath);

    const writeFileCall = fsMock.writeFileSync.mock.calls[0];
    expect(writeFileCall[0]).toBe(mockOutputPath);

    expect(writeFileCall[1]).toContain('export type Routes = {');
    expect(writeFileCall[1]).toContain("context: 'dashboard' | 'auth'");
    expect(writeFileCall[1]).toContain("context: 'dashboard'");
    expect(writeFileCall[1]).toContain("context: 'auth'");
  });

  it('should handle route groups', () => {
    const mockFileSystem = {
      [mockPagesDir]: [
        createMockDirent('(marketing)', true),
        createMockDirent('(shop)', true),
      ],
      [`${mockPagesDir}/(marketing)`]: [
        createMockDirent('about', true),
        createMockDirent('contact', true),
      ],
      [`${mockPagesDir}/(marketing)/about`]: [
        createMockDirent('page.tsx', false),
      ],
      [`${mockPagesDir}/(marketing)/contact`]: [
        createMockDirent('page.tsx', false),
      ],
      [`${mockPagesDir}/(shop)`]: [
        createMockDirent('products', true),
        createMockDirent('categories', true),
      ],
      [`${mockPagesDir}/(shop)/categories`]: [
        createMockDirent('[category]', true),
      ],
      [`${mockPagesDir}/(shop)/categories/[category]`]: [
        createMockDirent('page.tsx', false),
      ],
      [`${mockPagesDir}/(shop)/products`]: [
        createMockDirent('page.tsx', false),
      ],
    };

    setupMockFileSystem(mockFileSystem);
    fsMock.readFileSync.mockReturnValue('');

    generateRoutes(mockPagesDir, mockOutputPath);

    const writeFileCall = fsMock.writeFileSync.mock.calls[0];
    expect(writeFileCall[0]).toBe(mockOutputPath);

    expect(writeFileCall[1]).toContain('export type Routes = {');
    expect(writeFileCall[1]).toContain("'/about': {");
    expect(writeFileCall[1]).toContain("'/contact': {");
    expect(writeFileCall[1]).toContain("'/products': {");
    expect(writeFileCall[1]).toContain(
      "'/categories/[category]': { params: { category: string };"
    );
  });

  it('should handle page.config.ts options', () => {
    const mockFileSystem = {
      [mockPagesDir]: [
        createMockDirent('page.tsx', false),
        createMockDirent('page.config.ts', false),
        createMockDirent('about', true),
        createMockDirent('products', true),
      ],
      [`${mockPagesDir}/about`]: [
        createMockDirent('page.tsx', false),
        createMockDirent('page.config.ts', false),
      ],
      [`${mockPagesDir}/products`]: [
        createMockDirent('page.tsx', false),
        createMockDirent('page.config.ts', false),
        createMockDirent('[id]', true),
      ],
      [`${mockPagesDir}/products/[id]`]: [
        createMockDirent('page.tsx', false),
        createMockDirent('page.config.ts', false),
      ],
    };

    setupMockFileSystem(mockFileSystem);
    fsMock.readFileSync.mockReturnValue('');

    const mockConfigs = {
      [`${mockPagesDir}/page.config.ts`]: `
        export const config = {
          searchParams: { required: ['q'] },
          omitFromRoutes: false,
        };
      `,
      [`${mockPagesDir}/about/page.config.ts`]: `
        export const config = {
          searchParams: { optional: ['filter'] },
          omitFromRoutes: false,
        };
      `,
      [`${mockPagesDir}/products/page.config.ts`]: `
        export const config = {
          searchParams: { required: ['category'], optional: ['sort'] },
          omitFromRoutes: false,
        };
      `,
      [`${mockPagesDir}/products/[id]/page.config.ts`]: `
        export const config = {
          searchParams: { required: ['variant'] },
          omitFromRoutes: true,
        };
      `,
    };

    setupMockConfigFiles(mockConfigs);

    generateRoutes(mockPagesDir, mockOutputPath);

    const writeFileCall = fsMock.writeFileSync.mock.calls[0];
    expect(writeFileCall[0]).toBe(mockOutputPath);

    expect(writeFileCall[1]).toContain('export type Routes = {');
    expect(writeFileCall[1]).toContain(
      "'/': { query: Record<string, string> & { q: string } }"
    );
    expect(writeFileCall[1]).toContain(
      "'/about': { query: Record<string, string> & { filter?: string } }"
    );
    expect(writeFileCall[1]).toContain(
      "'/products': { query: Record<string, string> & { category: string; sort?: string } }"
    );
    expect(writeFileCall[1]).not.toContain("'/products/[id]'");
  });
});
