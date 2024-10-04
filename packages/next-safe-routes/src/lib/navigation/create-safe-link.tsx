import Link, { LinkProps } from 'next/link';
import { BaseRoutes, PathConfig, RequiresPathConfig } from '@/types';
import { createGetSafeRoute } from './create-get-safe-route';
import React from 'react';

// export type RequiresParams<T> = T extends {
//   params: Record<string, string | string[]>;
// }
//   ? true
//   : false;

// export type RequiresQuery<T> = T extends { query: { [K: string]: string } }
//   ? true
//   : false;

// export type ParamsConfig<
//   Routes extends BaseRoutes,
//   Path extends keyof Routes
// > = RequiresParams<Routes[Path]> extends true
//   ? { params: Routes[Path]['params'] }
//   : { params?: Routes[Path]['params'] };

// export type QueryConfig<
//   Routes extends BaseRoutes,
//   Path extends keyof Routes
// > = RequiresQuery<Routes[Path]> extends true
//   ? { query: Routes[Path]['query'] }
//   : { query?: Routes[Path]['query'] };

// type ConfigProp<
//   Routes extends BaseRoutes,
//   Path extends keyof Routes
// > = ParamsConfig<Routes, Path> & QueryConfig<Routes, Path>;

// Helper type to make config required if needed, optional otherwise
type ConfigProp<Routes extends BaseRoutes, Path extends keyof Routes> =
  RequiresPathConfig<Path> extends true
    ? { config: PathConfig<Routes, Path>[0] }
    : { config?: PathConfig<Routes, Path>[0] };

export type SafeLinkProps<
  Routes extends BaseRoutes,
  Path extends keyof Routes,
> = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement> & LinkProps, 'href'> & {
  href:
    | ({ pathname: Path } & ConfigProp<Routes, Path>)
    | (Path & ConfigProp<Routes, Path>);
};

export function createSafeLink<Routes extends BaseRoutes>() {
  const getRouteSingleton = createGetSafeRoute<Routes>();
  /**
* An extension to native Next.js Link component adding type safety to routes.
* @example
*  <TypedLink
  href={{
    path: '/app/conversation/[conversationHash]',
    config: {
      params: {
        conversationHash: '123',
      },
    },
  }}
>
  Go to Page
</TypedLink>
*/
  return React.forwardRef<
    HTMLAnchorElement,
    SafeLinkProps<Routes, keyof Routes>
  >(function SafeLink({ children, href, ...props }, ref) {
    const getHref = () => {
      let pathname: keyof Routes;

      if ('pathname' in href) {
        pathname = href.pathname;
      } else {
        pathname = href;
      }

      let config: PathConfig<Routes, keyof Routes>[0] | undefined = undefined;

      if ('config' in href) {
        config = href.config;
      }

      try {
        // @ts-ignore
        return getRouteSingleton(pathname, config);
      } catch (error: any) {
        console.error(
          `Error generating route for path ${pathname.toString()}:`,
          error
        );
        return '#'; // Fallback to prevent runtime errors
      }
    };

    return (
      <Link ref={ref} {...props} href={getHref()}>
        {children}
      </Link>
    );
  });
}
