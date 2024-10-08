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

   > Next Safe Routes currently does not support the use of turbopack. Consider using the CLI tool <code>npx generate-routes</code> or running <code>npm run build</code> before starting your dev server if you are using turbopack.

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

## Example Usage

### - getRoute

```ts
import { getRoute } from './navigation.ts';

const route = getRoute('/posts/[postId]', {
  params: {
    postId: '123',
  },
  query: {
    foo: 'bar',
  },
});

// route === '/posts/123?foo=bar
```

### - useRouter

```tsx
'use client';

import { useRouter } from './navigation.ts';

export function Component() {
  const router = useRouter();

  const handleClick = () => {
    router.prefetch();
    router.push('/products/[productId]', {
      params: {
        productId: '123',
      },
      query: {
        foo: 'bar',
      },
    });
  };

  return <button onClick={handleClick}>Go</button>;
}
```

### - redirect

```ts
import { redirect } from './navigation.ts';

export async function Page() {
  const { isAuthed } = await auth();

  if (!isAuthed) {
    return redirect('/auth/sign-in/[[...provider]]', {
      params: ['github'],
      query: {
        from: '/some-path',
      },
    });
  }

  // The rest of your component...
}
```

### - \<Link>

```tsx
import { Link } from './navigation';

export function CusotmLink() {
  return (
    <Link
      href={{
        pathname: '/products/[productId]',
        params: { productId: '123' },
        query: { foo: 'bar' },
      }}
    >
      Go to page
    </Link>
  );
}
```

Check out our [Full Documentation](https://next-safe-routes.vercel.app) for a more details and examples.
