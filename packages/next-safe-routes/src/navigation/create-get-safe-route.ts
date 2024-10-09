import { BaseRoutes, SpreadablePathConfig } from '@/types';

type ParamValue = string | number | string[] | undefined;
type Segment = 'dynamic' | 'catch-all' | 'optional-catch-all';

function extractDynamicSegments(pathname: string): string[] {
  return pathname.match(/\[(?:\[\.\.\.)?[^\]]+\](?:\])?/g) || [];
}

function validateParamValue(
  paramName: string,
  paramValue: ParamValue,
  segmentType: Segment
): void {
  if (segmentType === 'optional-catch-all') {
    if (paramValue !== undefined && !Array.isArray(paramValue)) {
      throw new Error(
        `Invalid parameter type for ${paramName}: expected array or undefined`
      );
    }
  } else if (segmentType === 'catch-all') {
    if (!Array.isArray(paramValue) || paramValue.length === 0) {
      throw new Error(
        `Invalid parameter type for ${paramName}: expected non-empty array`
      );
    }
  } else {
    if (typeof paramValue !== 'string') {
      throw new Error(
        `Invalid parameter type for ${paramName}: expected string, got ${typeof paramValue}`
      );
    }
  }
}

function replaceSegment(
  pathname: string,
  segment: string,
  paramValue: ParamValue,
  segmentType: Segment
): string {
  if (segmentType === 'optional-catch-all') {
    // Optional catch-all route
    if (Array.isArray(paramValue) && paramValue.length > 0) {
      return pathname.replace(
        segment,
        paramValue.map(encodeURIComponent).join('/')
      );
    }
    return pathname.replace(`/${segment}`, '');
  } else if (segmentType === 'catch-all') {
    // Catch-all route
    return pathname.replace(
      segment,
      (paramValue as string[]).map(encodeURIComponent).join('/')
    );
  } else {
    // Regular dynamic route
    return pathname.replace(segment, encodeURIComponent(String(paramValue)));
  }
}

function buildQueryString(
  query: Record<string, string | string[] | undefined>
): string {
  const queryParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        for (const item of value) {
          queryParams.append(key, String(item));
        }
      } else {
        queryParams.append(key, String(value));
      }
    }
  }
  return queryParams.toString();
}

function validateGeneratedPath(path: string): void {
  try {
    new URL(path, 'http://example.com');
  } catch (error: any) {
    throw new Error(`Invalid route generated: ${path}`);
  }
}

export function createGetSafeRoute<Routes extends BaseRoutes>() {
  return function getRoute<Path extends keyof Routes>(
    pathname: Path,
    ...pathConfig: SpreadablePathConfig<Routes, Path>
  ) {
    const [config] = pathConfig;

    if (!config) {
      return pathname as string;
    }

    let modifiedPathname = pathname as string;

    const dynamicSegments = extractDynamicSegments(modifiedPathname);

    if (dynamicSegments.length > 0) {
      for (const segment of dynamicSegments) {
        const paramName = segment.replace(/\[|\]|\.\.\./g, '');
        const paramValue = config.params?.[paramName];
        const segmentType =
          segment.startsWith('[[...') && segment.endsWith(']]')
            ? 'optional-catch-all'
            : segment.startsWith('[...') && segment.endsWith(']')
              ? 'catch-all'
              : 'dynamic';

        if (
          !config.params ||
          (!(paramName in config.params) &&
            segmentType !== 'optional-catch-all')
        ) {
          throw new Error(`Missing required parameter: ${paramName}`);
        }

        validateParamValue(paramName, paramValue, segmentType);
        modifiedPathname = replaceSegment(
          modifiedPathname,
          segment,
          paramValue,
          segmentType
        );
      }
    }

    let query = '';
    if ('query' in config && config.query) {
      query = buildQueryString(config.query);
    }

    const finalPath = `${modifiedPathname}${query ? `?${query}` : ''}`;

    // Check if the final path is a valid URL
    validateGeneratedPath(finalPath);

    return finalPath;
  };
}
