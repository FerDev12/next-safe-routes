# Next Safe Routes

**Type Safe Navigation for Next.js**

## Why Next Safe Routes?

In the world of web development, navigation is the backbone of user experience. But as your Next.js application grows, so does the complexity of managing routes. Have you ever:

- Mistyped a URL, turning `/posts` into `/post`?
- Forgotten to set crucial search parameters?
- Wished for autocomplete when working with dynamic routes?

If you've faced these challenges, you're not alone. While Next.js provides powerful navigation utilities like `Link`, `useRouter`, `useSearchParams`, and `useParams`, they lack one crucial feature: type safety.

That's where Next Safe Routes steps in.

## What is Next Safe Routes?

Next Safe Routes is a lightweight, type-safe wrapper around Next.js navigation utilities. It's designed to enhance your development experience by providing:

1. **Automatic Route Type Generation**: Our tool analyzes your `app` directory to create a comprehensive `Routes` type, capturing all your application's routes, including their parameters and search params.

2. **Type-Safe Navigation Utilities**: We provide a set of navigation utilities that leverage the `Routes` type, offering you type safety and autocompletion when navigating between pages.

## Key Features

- **Full App Router Support**: Works seamlessly with Next.js 13+ App Router, including support for parallel routes, grouped routes, and dynamic parameters.
- **Type-Safe Navigation**: Eliminate typos and ensure all required parameters are provided at compile-time.
- **Autocomplete for Routes**: Enjoy IDE suggestions for your application's routes and their parameters.
- **Lightweight**: Minimal runtime overhead.
- **Easy Integration**: Simple setup process that integrates smoothly into your existing Next.js project.

## How It Works

Next Safe Routes operates in two main steps:

1. **Route Analysis**: Our script scans your `app` directory, parsing file structures to generate a comprehensive `Routes` type. This type encapsulates all your application's routes, along with their respective parameters and search params. See [Generate Routes](/docs/beta/generate-routes) for more information.

2. **Navigation Utilities**: We provide type-safe wrappers around Next.js navigation functions. These utilities use the generated `Routes` type to offer type checking and autocompletion as you navigate your app. See [Navigation](/docs/beta/navigation) for more information

## Quick Start

1. Installation

   ```
   npm install next-safe-routes
   ```

2. withNextSaferoutes

   ```js
   // next.config.mjs

   import { withNextSafeRoutes } from 'next-safe-routes/plugin';

   /** @type {import('next').NextConfig} */
   const nextConfig = withNextSafeRoutes({
     // The rest of your next.config
   });

   export default nextConfig;
   ```

3. Build your project to generate your Routes type

   > This will generate a new file at src/types/routes.ts

   ```bash
   npm run build
   # or
   npm run dev
   ```

4. Create your navigation utilities

   _We recommend creating a navigation.ts file at the root of your src directory_

   ```ts
   // navigation.ts

   import { createNextSafeNavigation } from 'next-safe-routes';
   // Import your generated Routes type
   import { Routes } from './types/routes';

   export const { getRoute, Link, useRouter, redirect } =
     createNextSafeNavigation<Routes>();
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

## Documentation

For full documentation, visit our [docs site](https://next-safe-routes.vercel.app).
