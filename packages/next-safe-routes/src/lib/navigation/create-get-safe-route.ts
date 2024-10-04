// src/create-get-route.ts

import { BaseRoutes, PathConfig } from '@/types';

export function createGetSafeRoute<Routes extends BaseRoutes>() {
  return function getRoute<Path extends keyof Routes>(
    pathname: Path,
    ...pathConfig: PathConfig<Routes, Path>
  ): string {
    const [config] = pathConfig;

    if (!config) {
      return pathname as string;
    }

    let modifiedPathname = pathname as string;

    if (
      typeof config === 'object' &&
      'params' in config &&
      config.params &&
      typeof config.params === 'object'
    ) {
      const dynamicSegments = modifiedPathname.match(/\[([^\]]+)\]/g) || [];
      for (const segment of dynamicSegments) {
        const paramName = segment.slice(1, -1);
        if (!(paramName in config.params)) {
          throw new Error(`Missing required parameter: ${paramName}`);
        }
        const paramValue = config.params[paramName];
        if (typeof paramValue !== 'string' && !Array.isArray(paramValue)) {
          throw new Error(
            `Invalid parameter type for ${paramName}: expected string or array, got ${typeof paramValue}`
          );
        }
        modifiedPathname = modifiedPathname.replace(
          segment,
          encodeURIComponent(String(paramValue))
        );
      }
    }

    let query = '';
    if ('query' in config && config.query) {
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(config.query)) {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      }
      query = queryParams.toString();
    }

    const finalPath = `${modifiedPathname}${query ? `?${query}` : ''}`;

    // Check if the final path is a valid URL
    try {
      new URL(finalPath, 'http://example.com');
    } catch (error) {
      throw new Error(`Invalid route generated: ${finalPath}`);
    }

    return finalPath;
  };
}
