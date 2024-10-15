import fs from 'fs';
import path from 'path';
import * as ts from 'typescript';
import { Params, PageConfig } from '@/types';

type ParallelRouteConfig = {
  params: Params;
  query?: {
    required?: string[];
    optional?: string[];
  };
  omitFromRoutes?: boolean;
};

type RouteConfig = {
  params: Params;
  query?: {
    required?: string[];
    optional?: string[];
  };
  omitFromRoutes?: boolean;
  parallelRoutes?: Record<string, ParallelRouteConfig>;
};

function getRoutes(
  dir: string,
  baseRoute: string = '',
  parallelContext: string = ''
): Map<string, RouteConfig> {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const routesMap = new Map<string, RouteConfig>();

  for (const entry of entries) {
    if (shouldSkipEntry(entry)) continue;

    const route = path.join(baseRoute, entry.name);

    if (isRouteGroup(entry)) {
      handleRouteGroup(dir, entry, baseRoute, parallelContext, routesMap);
    } else if (isParallelRoute(entry)) {
      handleParallelRoute(dir, entry, baseRoute, routesMap);
    } else if (entry.isDirectory()) {
      handleSubDirectory(dir, entry, route, parallelContext, routesMap);
    } else if (isPageFile(entry)) {
      handlePageFile(dir, entry, baseRoute, parallelContext, routesMap);
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
  parallelContext: string,
  routesMap: Map<string, RouteConfig>
) {
  const subRoutes = getRoutes(
    path.join(dir, entry.name),
    baseRoute,
    parallelContext
  );
  mergeRoutes(routesMap, subRoutes);
}

function handleParallelRoute(
  dir: string,
  entry: fs.Dirent,
  baseRoute: string,
  routesMap: Map<string, RouteConfig>
) {
  const context = entry.name.slice(1);
  const subRoutes = getRoutes(path.join(dir, entry.name), baseRoute, context);
  mergeParallelRoutes(routesMap, subRoutes, context);
}

function handleSubDirectory(
  dir: string,
  entry: fs.Dirent,
  route: string,
  parallelContext: string,
  routesMap: Map<string, RouteConfig>
) {
  const subRoutes = getRoutes(
    path.join(dir, entry.name),
    route,
    parallelContext
  );
  mergeRoutes(routesMap, subRoutes);
}

function handlePageFile(
  dir: string,
  entry: fs.Dirent,
  baseRoute: string,
  parallelContext: string,
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
    query: pageConfig?.searchParams,
    omitFromRoutes: pageConfig?.omitFromRoutes,
  };

  if (parallelContext) {
    config.parallelRoutes = {
      [parallelContext]: {
        params,
        query: pageConfig?.searchParams,
        omitFromRoutes: pageConfig?.omitFromRoutes,
      },
    };
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
    .replace(/\[\[\.\.\.(\w+)\]\]/g, '[[...$1]]')
    .replace(/\[\.\.\.(\w+)\]/g, '[...$1]')
    .replace(/\[([^\]]+)\]/g, '[$1]');
}

function getRouteParams(routePath: string): Params {
  const params: Params = {};
  const segments = routePath.split('/');

  segments.forEach((segment) => {
    if (segment.startsWith('[') && segment.endsWith(']')) {
      let paramName = segment.slice(1, -1);

      if (paramName.startsWith('...')) {
        // Catch-all
        paramName = paramName.slice(3);
        params[paramName] = 'string[]';
      } else if (paramName.startsWith('[...') && paramName.endsWith(']')) {
        // Optional-catch-all
        paramName = paramName.slice(4, -1);
        params[paramName] = 'string[] | undefined';
      } else {
        // Normal dynamic segment
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

function mergeParallelRoutes(
  target: Map<string, RouteConfig>,
  source: Map<string, RouteConfig>,
  context: string
) {
  for (const [route, config] of source) {
    if (target.has(route)) {
      const existingConfig = target.get(route)!;
      existingConfig.parallelRoutes = existingConfig.parallelRoutes || {};
      existingConfig.parallelRoutes[context] = {
        params: config.params,
        query: config.query,
        omitFromRoutes: config.omitFromRoutes,
      };
      target.set(route, existingConfig);
    } else {
      const newConfig: RouteConfig = {
        params: config.params,
        parallelRoutes: {
          [context]: {
            params: config.params,
            query: config.query,
            omitFromRoutes: config.omitFromRoutes,
          },
        },
      };
      target.set(route, newConfig);
    }
  }
}

function mergeRouteConfigs(
  existing: RouteConfig,
  newConfig: RouteConfig
): RouteConfig {
  const mergedConfig: RouteConfig = {
    params: { ...existing.params, ...newConfig.params },
    omitFromRoutes: existing.omitFromRoutes && newConfig.omitFromRoutes,
  };

  if (existing.query || newConfig.query) {
    mergedConfig.query = {
      required: Array.from(
        new Set([
          ...(existing.query?.required ?? []),
          ...(newConfig.query?.required ?? []),
        ])
      ),
      optional: Array.from(
        new Set([
          ...(existing.query?.optional ?? []),
          ...(newConfig.query?.optional ?? []),
        ])
      ),
    };
  }

  if (existing.parallelRoutes || newConfig.parallelRoutes) {
    mergedConfig.parallelRoutes = { ...existing.parallelRoutes };
    for (const [context, config] of Object.entries(
      newConfig.parallelRoutes ?? {}
    )) {
      if (mergedConfig.parallelRoutes[context]) {
        mergedConfig.parallelRoutes[context] = mergeRouteConfigs(
          mergedConfig.parallelRoutes[context],
          config
        ) as ParallelRouteConfig;
      } else {
        mergedConfig.parallelRoutes[context] = config;
      }
    }
  }

  return mergedConfig;
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
    // eslint-disable-next-line no-undef
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

function generateTypeDefinition() {
  return `
/**
 * Routes Type Definition
 * 
 * This type represents all the routes in the application, with their respective
 * parameters and query configurations. For parallel routes with the same path,
 * configurations are merged according to the following rules:
 * - If one route has omitFromRoutes = true, its configuration is not merged
 * - If all parallel routes have omitFromRoutes = true, the route is not included
 * - All query parameters are optional at the top level
 * - When a context is selected, its specific query parameters become required
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
 *   - context?: For parallel routes, an optional property that, when specified, 
 *               makes certain query parameters required based on the selected context
 * 
 * Example:
 * '/products': {
 *   query: Record<string, string> & { 
 *     color?: string,
 *     size?: string,
 *     brand?: string,
 *     material?: string
 *   },
 *   context?: 'tshirts' | 'pants'
 * } & (
 *   | { context: 'tshirts', query: { color: string, size: string } }
 *   | { context: 'pants', query: { brand: string, material?: string } }
 * )
 * 
 * Usage:
 * - Use the Routes type for type-safe routing in your application
 * - When navigating, check the specific route implementation for required query parameters
 * - Additional query parameters can be added freely due to Record<string, string>
 * 
 * Note: This file is auto-generated. Do not edit manually.
 */`;
}

function generateRoute(route: string, config: RouteConfig) {
  const paramEntries = Object.entries(config.params);
  const paramsString =
    paramEntries.length > 0
      ? `params: { ${paramEntries
          .map(([key, type]) => `${key}: ${type}`)
          .join('; ')} };`
      : '';

  let queryString = '';
  let contextString = '';
  let conditionalQueryString = '';

  if (config.parallelRoutes) {
    const contexts = Object.keys(config.parallelRoutes);

    contextString = `context: ${contexts.map((ctx) => `'${ctx}'`).join(' | ')};`;

    conditionalQueryString = `} & (
  ${contexts
    .map((ctx) => {
      const parallelConfig = config.parallelRoutes![ctx];
      const requiredSearchParams = parallelConfig.query?.required || [];
      const optionalSearchParams = parallelConfig.query?.optional || [];
      const searchParams = [
        ...requiredSearchParams.map((param) => `${param}: string`),
        ...optionalSearchParams.map((param) => `${param}?: string`),
      ];
      return `| { context: '${ctx}'; query: Record<string, string>${searchParams.length > 0 ? ` & { ${searchParams.join('; ')} }` : ''} }`;
    })
    .join('\n    ')}
)`;
  } else {
    const requiredSearchParams = config.query?.required || [];
    const optionalSearchParams = config.query?.optional || [];
    const searchParams = [
      ...requiredSearchParams.map((param) => `${param}: string`),
      ...optionalSearchParams.map((param) => `${param}?: string`),
    ];
    queryString =
      searchParams.length > 0
        ? `query: Record<string, string> & ${`{ ${searchParams.join('; ')} } }`};`
        : 'query?: Record<string, string> }';
  }

  return `  '${route.startsWith('/') ? route : `/${route}`}': { ${paramsString}${queryString}${contextString}${conditionalQueryString}`;
}

export function generateRoutes(pagesDir: string, outputPath: string) {
  try {
    const routes = getRoutes(pagesDir);

    const modifiedAt = new Date().toISOString();

    const routesType = `// This file is auto-generated. Do not edit manually.
// Modified at ${modifiedAt}

${generateTypeDefinition()}

export type Routes = {
${Array.from(routes.entries())
  .filter(([, config]) => !config.omitFromRoutes)
  .sort(([routeA], [routeB]) => (routeA < routeB ? -1 : 1))
  .map(([route, config]) => generateRoute(route, config))
  .join(';\n')}
};

export type Path = keyof Routes
`;

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, routesType);
    console.log(`Routes type generated at ${outputPath}`);
  } catch (error) {
    console.error('Error generating routes:', error);
    throw error;
  }
}
