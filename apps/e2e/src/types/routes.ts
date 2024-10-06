// This file is auto-generated. Do not edit manually.
// Modified at 2024-10-06T05:45:37.734Z

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
  '/': { query?: Record<string, string>
    ,  },
  '/posts/[postId]': { params: { postId: string }, query?: Record<string, string>
    ,  },
  '/users/[userId]': { params: { userId: string }, query?: Record<string, string>
    ,  }
}
