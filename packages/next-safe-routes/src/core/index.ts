import fs from 'fs';
import path from 'path';
import * as ts from 'typescript';
import { RouteConfig, PageConfig } from '@/types';

function getRoutes(
  dir: string,
  baseRoute: string = '',
  isParallel: boolean = false
): Map<string, RouteConfig> {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const routesMap = new Map<string, RouteConfig>();

  for (const entry of entries) {
    if (shouldSkipEntry(entry)) continue;

    let route = path.join(baseRoute, entry.name);

    if (isRouteGroup(entry)) {
      handleRouteGroup(dir, entry, baseRoute, isParallel, routesMap);
    } else if (isParallelRoute(entry)) {
      handleParallelRoute(dir, entry, baseRoute, routesMap);
    } else if (entry.isDirectory()) {
      handleSubDirectory(dir, entry, route, isParallel, routesMap);
    } else if (isPageFile(entry)) {
      handlePageFile(dir, entry, baseRoute, routesMap);
    }
  }

  return routesMap;
}

function shouldSkipEntry(entry: fs.Dirent): boolean {
  return entry.name.startsWith('_') || entry.name === 'api';
}

function isRouteGroup(entry: fs.Dirent): boolean {
  return (
    entry.isDirectory() &&
    entry.name.startsWith('(') &&
    entry.name.endsWith(')')
  );
}

function isParallelRoute(entry: fs.Dirent): boolean {
  return entry.name.startsWith('@');
}

function isPageFile(entry: fs.Dirent): boolean {
  return (
    entry.isFile() && (entry.name === 'page.tsx' || entry.name === 'page.ts')
  );
}

function handleRouteGroup(
  dir: string,
  entry: fs.Dirent,
  baseRoute: string,
  isParallel: boolean,
  routesMap: Map<string, RouteConfig>
) {
  const subRoutes = getRoutes(
    path.join(dir, entry.name),
    baseRoute,
    isParallel
  );
  mergeRoutes(routesMap, subRoutes);
}

function handleParallelRoute(
  dir: string,
  entry: fs.Dirent,
  baseRoute: string,
  routesMap: Map<string, RouteConfig>
) {
  const subRoutes = getRoutes(path.join(dir, entry.name), baseRoute, true);
  mergeRoutes(routesMap, subRoutes);
}

function handleSubDirectory(
  dir: string,
  entry: fs.Dirent,
  route: string,
  isParallel: boolean,
  routesMap: Map<string, RouteConfig>
) {
  const subRoutes = getRoutes(path.join(dir, entry.name), route, isParallel);
  for (const [subRoute, config] of subRoutes) {
    routesMap.set(subRoute, config);
  }
}

function handlePageFile(
  dir: string,
  entry: fs.Dirent,
  baseRoute: string,
  routesMap: Map<string, RouteConfig>
) {
  const routePath = normalizeRoutePath(baseRoute);
  const params = getRouteParams(routePath);
  const pageConfigPath = path.join(
    dir,
    entry.name.replace(/\.(tsx|ts)$/, '.config.ts')
  );
  const pageConfig = getPageConfig(pageConfigPath);

  const config: RouteConfig = {
    params,
    omitFromRoutes: pageConfig?.omitFromRoutes,
  };

  if (pageConfig?.searchParams) {
    config.query = pageConfig.searchParams;
  }

  if (routesMap.has(routePath)) {
    routesMap.set(
      routePath,
      mergeRouteConfigs(routesMap.get(routePath)!, config)
    );
  } else {
    routesMap.set(routePath, config);
  }
}

function normalizeRoutePath(route: string): string {
  return route
    .replace(/\\/g, '/')
    .replace(/\[\[\.\.\.(\w+)\]\]/g, '[[...$1]]') // Preserve optional catch-all syntax
    .replace(/\[\.\.\.(\w+)\]/g, '[...$1]') // Preserve catch-all syntax
    .replace(/\[([^\]]+)\]/g, '[$1]');
}

function getRouteParams(
  routePath: string
): Record<string, string | string[] | undefined> {
  const params: Record<string, string | string[] | undefined> = {};
  const segments = routePath.split('/');

  segments.forEach((segment) => {
    if (segment.startsWith('[') && segment.endsWith(']')) {
      let paramName = segment.slice(1, -1);

      if (paramName.startsWith('...')) {
        // Catch-all route
        paramName = paramName.slice(3);
        params[paramName] = 'string[]';
      } else if (paramName.startsWith('[...') && paramName.endsWith(']')) {
        // Optional catch-all route
        paramName = paramName.slice(4, -1);
        params[paramName] = 'string[] | undefined';
      } else {
        // Regular dynamic route
        params[paramName] = 'string';
      }
    }
  });

  return params;
}

function mergeRoutes(
  target: Map<string, RouteConfig>,
  source: Map<string, RouteConfig>
) {
  for (const [route, config] of source) {
    if (target.has(route)) {
      target.set(route, mergeRouteConfigs(target.get(route)!, config));
    } else {
      target.set(route, config);
    }
  }
}

function mergeRouteConfigs(
  existing: RouteConfig,
  newConfig: RouteConfig
): RouteConfig {
  let query: string[] = [];
  if (!existing.omitFromRoutes) {
    query = Array.from(
      new Set([
        ...query,
        ...(existing.query?.required ?? []),
        ...(existing.query?.optional ?? []),
      ])
    );
  }
  if (!newConfig.omitFromRoutes) {
    query = Array.from(
      new Set([
        ...query,
        ...(newConfig.query?.required ?? []),
        ...(newConfig.query?.optional ?? []),
      ])
    );
  }
  return {
    params: { ...existing.params, ...newConfig.params },
    query: query.length > 0 ? { optional: query } : undefined,
    omitFromRoutes: existing.omitFromRoutes && newConfig.omitFromRoutes,
  };
}

function getPageConfig(filePath: string): PageConfig | undefined {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(
      filePath,
      fileContent,
      ts.ScriptTarget.Latest,
      true
    );

    let pageConfig: PageConfig | undefined;

    ts.forEachChild(sourceFile, (node) => {
      if (ts.isVariableStatement(node)) {
        const declaration = node.declarationList.declarations[0] as ts.Node;
        if (
          ts.isVariableDeclaration(declaration) &&
          declaration.name.getText() === 'config'
        ) {
          const initializer = declaration.initializer;
          if (initializer && ts.isObjectLiteralExpression(initializer)) {
            pageConfig = parsePageConfig(initializer);
          }
        }
      }
    });

    return pageConfig;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error(`Error reading page config file ${filePath}:`, error);
    }
    return undefined;
  }
}

function parsePageConfig(node: ts.ObjectLiteralExpression): PageConfig {
  const pageConfig: PageConfig = {};

  node.properties.forEach((prop) => {
    if (ts.isPropertyAssignment(prop)) {
      const propName = prop.name?.getText();
      if (propName === 'searchParams') {
        pageConfig.searchParams = parseSearchParams(prop.initializer);
      } else if (propName === 'omitFromRoutes') {
        pageConfig.omitFromRoutes =
          (prop.initializer as ts.Expression).getText() === 'true';
      }
      // Future configurations can be parsed here
    }
  });

  return pageConfig;
}

function parseSearchParams(
  node: ts.Expression
): { required?: string[]; optional?: string[] } | undefined {
  if (ts.isObjectLiteralExpression(node)) {
    const searchParams: { required?: string[]; optional?: string[] } = {};
    node.properties.forEach((prop) => {
      if (
        ts.isPropertyAssignment(prop) &&
        ts.isArrayLiteralExpression(prop.initializer)
      ) {
        const key = prop.name.getText();
        const values = prop.initializer.elements.map((el) =>
          el.getText().replace(/['"]/g, '')
        );
        if (key === 'required' || key === 'optional') {
          searchParams[key] = values;
        }
      }
    });
    return searchParams;
  }
  return undefined;
}

export function generateRoutes(pagesDir: string, outputPath: string) {
  try {
    const routes = getRoutes(pagesDir);

    const modifiedAt = new Date().toISOString();

    const routesType = `// This file is auto-generated. Do not edit manually.
// Modified at ${modifiedAt}

/**
 * Routes Type Definition
 * 
 * This type represents all the routes in the application, with their respective
 * parameters and query configurations. For parallel routes with the same path,
 * configurations are merged according to the following rules:
 * - If one route has omitFromRoutes = true, its configuration is not merged
 * - If all parallel routes have omitFromRoutes = true, the route is not included
 * - When merging query parameters, all parameters become optional
 * 
 * Structure:
 * - Each key is a route path (e.g., '/users/[id]')
 * - Each value is an object with the following properties:
 *   - params: An object representing path parameters
 *     - Dynamic segments are represented as [paramName]: string
 *     - Catch-all segments are represented as [...paramName]: string[]
 *     - Optional catch-all segments are represented as [[...paramName]]: string[] | undefined
 *   - query: An object representing query parameters
 *     - Always includes Record<string, string> to allow for any string key-value pairs
 *     - All specific query parameters are optional (key?: string)
 *     - Note: Some query parameters might be required in specific contexts, even though they're typed as optional
 * 
 * Example:
 * '/users/[id]': {
 *   params: { id: string },
 *   query: Record<string, string> & { 
 *     sort?: string,
 *     filter?: string
 *   }
 * }
 * 
 * Usage:
 * - Use the Routes type for type-safe routing in your application
 * - When navigating, check the specific route implementation for required query parameters
 * - Additional query parameters can be added freely due to Record<string, string>
 * 
 * Note: This file is auto-generated. Do not edit manually.
 */

export type Routes = {
${Array.from(routes.entries())
  .filter(([, config]) => !config.omitFromRoutes)
  .sort(([routeA], [routeB]) => (routeA < routeB ? -1 : 1))
  .map(([route, config]) => {
    const paramEntries = Object.entries(config.params);
    const paramsString =
      paramEntries.length > 0
        ? `params: { ${paramEntries
            .map(([key, type]) => `${key}: ${type}`)
            .join(', ')} }, `
        : '';
    const queryString = `query${config.query ? '' : '?'}: Record<string, string>
    ${
      config.query
        ? ` & { ${
            config.query?.required
              ? `${config.query.required
                  .map((q) => `${q}: string`)
                  .join(', ')}, `
              : ''
          }
    ${
      config.query.optional
        ? `${config.query.optional.map((q) => `${q}?: string`).join(', ')}`
        : ''
    } }`
        : ''
    }, `;
    return `  '/${route}': { ${paramsString}${queryString} }`;
  })
  .join(',\n')}
}
`;

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, routesType);
    console.log(`Routes type generated at ${outputPath}`);
  } catch (error) {
    console.error('Error generating routes:', error);
    throw error;
  }
}
