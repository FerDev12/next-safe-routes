// This file is auto-generated. Do not edit manually.
// Modified at 2024-10-11T23:20:16.042Z

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
 */

export type Routes = {
  '/': { query?: Record<string, string>; locale?: 'en' | 'es' | 'de' };
};

export type Path = keyof Routes;
