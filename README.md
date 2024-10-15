# Next Safe Routes

> Type-safe navigation for Next.js

## Quickstart

> Next Safe Routes requires you having a Next.js app version >= 13.0.0 and TypeScript installed as a dev dependency.

1. Install next-safe-routes

   ```bash
   npm install next-safe-routes
   ```

2. Add the Next.js plugin provided by Next Safe Routes

   ```mjs
   import { withNextSafeRoutes } from 'next-safe-routes/plugin';

   /** @type {import('next').NextConfig} */
   const nextConfig = withNextSafeRoutes({
     // The rest of your next.config.
   });

   export default nextConfig;
   ```

3. Build your project

   _This will generate a route.ts file at src/types/routes.ts that exports the type Routes_

   > Next Safe Routes currently does not support the use of turbopack. Consider using the CLI tool <code>npm run generate-routes</code> or running <code>npm run build</code> before starting your dev server if you are using turbopack.

   ```bash
   npm run dev
   # or
   npm run build
   ```

4. Create your navigation utils

   _We recommend creating a navigation.ts file at the root of your src directory_

   ```ts
   import { createNextSafeNavigation } from 'next-safe-routes';
   import { Routes } from './types/routes';

   export const { getRoute, Link, useRouter, redirect } =
     createNextSafeNavigation<Routes>();
   ```

## Page Config

You can add extra information to your generated Routes type in a per-page basis by adding a
page.config.ts file in the same folder as the page you want to modify:

```
src
└── app
    ├── page.tsx
    ├── profile
    │   ├── page.tsx
    │   └── page.config.ts
    └── posts
        └── [postId]
            ├── page.tsx
            └── page.config.ts
```

```ts
type PageConfig = {
  searchParams?: {
    required?: string[];
    optional?: string[];
  };
  // If you want to hide your route and not make it routable through
  // next-safe-routes you can set omitFromRoutes = true.
  // This will filter-out any route from the generated Routes type.
  omitFromRoutes?: boolean;
};
```

```ts
// src/app/profile/page.config.ts

import type { PageConfig } from 'next-safe-routes';

export const config: PageConfig = {
  searchParams: {
    // You can make search-parameters required when navigating to a route
    required: ['foo', 'bar'],
    optional: ['cat', 'dog'],
  },
};
```

## Example Usage

### getRoute

![getRoute example GIF](https://next-safe-routes.vercel.app/get-route-example.gif)

### useRouter

![useRouter example GIF](https://next-safe-routes.vercel.app/use-router-example.gif)

### redirect

![redirect example GIF](https://next-safe-routes.vercel.app/redirect-example.gif)

### \<Link>

![Link example GIF](https://next-safe-routes.vercel.app/link-example.gif)

## Routes

example Routes type generated by next-safe-routes

```ts
export type Routes = {
  '/': { query?: Record<string, string> };
  '/auth/sign-in/[[...provider]]': {
    params: { provider: string[] | undefined };
    query?: Record<string, string>;
  };
  '/products/[productId]': {
    params: { productId: string };
    query?: Record<string, string>;
  };
  '/profile': { context: 'org' | 'user' } & (
    | {
        context: 'org';
        query: Record<string, string> & { orgId: string; employeeId?: string };
      }
    | { context: 'user'; query: Record<string, string> & { userId: string } }
  );
  '/users/[userId]': {
    params: { userId: string };
    query?: Record<string, string>;
  };
};
```

## Generate Routes

There are two ways of generating your Routes type:

1. Using the provided Next.js plugin

   ```mjs
   import { withNextSafeRoutes } from 'next-safe-routes/plugin';

   /** @type {import('next').NextConfig} */
   const nextConfig = withNextSafeRoutes({
     // The rest of your next.config.
   });

   export default nextConfig;
   ```

2. Or running the command
   ```bash
   npm run generate-routes
   ```

By default both will generate a file at src/types/routes.ts or types/routes.ts if you're not using the src directory.

To change the output path you can pass an options object to the plugin:

```mjs
import { withNextSafeRoutes } from 'next-safe-routes/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = withNextSafeRoutes(
  {
    // The rest of your next.config.
  },
  {
    outPath: 'src/lib/types/generated-routes.ts',
    verbose: true,
  }
);

export default nextConfig;
```

Or pass flags to the cli command:

```bash
npm run generate-routes --out=src/lib/types/generated-routes.ts --v=true
```

Check out our [Full Documentation](https://next-safe-routes.vercel.app) for a more details and examples.
