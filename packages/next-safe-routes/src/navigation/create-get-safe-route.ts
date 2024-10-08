import { BaseRoutes, Params, SpreadablePathConfig } from '@/types';

type ParamValue = string | number | string[] | undefined;
type Segment = 'dynamic' | 'catch-all' | 'optional-catch-all';

function extractDynamicSegments(pathname: string): string[] {
  return pathname.match(/\[(?:\[\.\.\.)?[^\]]+\](?:\])?/g) || [];
}

function extractParamName(segment: string): string {
  return segment.replace(/\[|\]|\.\.\./g, '');
}

function determineSegmentType(segment: string): Segment {
  if (segment.startsWith('[[...') && segment.endsWith(']]')) {
    return 'optional-catch-all';
  }
  if (segment.startsWith('[...') && segment.endsWith(']')) {
    return 'catch-all';
  }
  return 'dynamic';
}

function validateParam(
  segmentType: Segment,
  paramName: string,
  inputParams?: Params
) {
  if (
    segmentType !== 'optional-catch-all' &&
    (inputParams === undefined || !(paramName in inputParams))
  ) {
    throw new Error(`Missing required parameter: ${paramName}`);
  }
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
  }

  if (segmentType === 'catch-all') {
    // Catch-all route
    return pathname.replace(
      segment,
      (paramValue as string[]).map(encodeURIComponent).join('/')
    );
  }

  // Regular dynamic route
  return pathname.replace(segment, encodeURIComponent(String(paramValue)));
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

    let modifiedPathname = pathname as string;

    const dynamicSegments = extractDynamicSegments(modifiedPathname);

    if (dynamicSegments.length > 0) {
      for (const segment of dynamicSegments) {
        const segmentType = determineSegmentType(segment);
        const paramName = extractParamName(segment);
        const paramValue = config?.params?.[paramName];

        validateParam(segmentType, paramName, config?.params);
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
    if (config?.query) {
      query = buildQueryString(config.query);
    }

    const finalPath = `${modifiedPathname}${query ? `?${query}` : ''}`;

    // Check if the final path is a valid URL
    validateGeneratedPath(finalPath);

    return finalPath;
  };
}
