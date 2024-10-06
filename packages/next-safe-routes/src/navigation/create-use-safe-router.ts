import React from 'react';
import { useRouter } from 'next/navigation';
import { BaseRoutes, PathConfig } from '@/types';
import { createGetSafeRoute } from './create-get-safe-route';
import { deepFreeze } from '@/utils/deep-freeze';
import { AppRouterInstance as NextAppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export type AppRouterInstance = NextAppRouterInstance;

export type SafeRouterInstance<Routes extends BaseRoutes> = Omit<
  AppRouterInstance,
  'prefetch' | 'push' | 'replace'
> & {
  prefetch: <Path extends keyof Routes>(
    // eslint-disable-next-line no-unused-vars
    pathname: Path,
    // eslint-disable-next-line no-unused-vars
    ...pathConfig: PathConfig<Routes, Path>
  ) => ReturnType<AppRouterInstance['prefetch']>;
  push: <Path extends keyof Routes>(
    // eslint-disable-next-line no-unused-vars
    pathname: Path,
    // eslint-disable-next-line no-unused-vars
    ...pathConfig: PathConfig<Routes, Path>
  ) => ReturnType<AppRouterInstance['push']>;
  replace: <Path extends keyof Routes>(
    // eslint-disable-next-line no-unused-vars
    pathname: Path,
    // eslint-disable-next-line no-unused-vars
    ...pathConfig: PathConfig<Routes, Path>
  ) => ReturnType<AppRouterInstance['replace']>;
};

function createTypedRouter<Routes extends BaseRoutes>(
  nextRouter: AppRouterInstance
): Readonly<SafeRouterInstance<Routes>> {
  const getRoute = createGetSafeRoute<Routes>();

  const typedRouter: SafeRouterInstance<Routes> = {
    ...nextRouter,
    prefetch: (pathname, ...pathConfig) => {
      const [config] = pathConfig;
      try {
        // @ts-ignore
        return nextRouter.prefetch(getRoute(pathname, config));
      } catch (error: any) {
        console.error(
          error,
          `Failed to prefetch route: ${pathname.toString()}`
        );
        throw error;
      }
    },
    push: (pathname, ...pathConfig) => {
      const [config] = pathConfig;
      try {
        // @ts-ignore
        return nextRouter.push(getRoute(pathname, config));
      } catch (error: any) {
        console.error(error, `Failed to push route: ${pathname.toString()}`);
        throw error;
      }
    },
    replace: (pathname, ...pathConfig) => {
      const [config] = pathConfig;
      try {
        // @ts-ignore
        return nextRouter.replace(getRoute(pathname, config));
      } catch (error: any) {
        console.error(error, `Failed to replace route: ${pathname.toString()}`);
        throw error;
      }
    },
  };
  return deepFreeze(typedRouter) as SafeRouterInstance<Routes>;
}

export function createUseSafeRouter<
  Routes extends BaseRoutes,
>(): () => SafeRouterInstance<Routes> {
  return function useTypedRouter() {
    const nextRouter = useRouter();
    const routerRef = React.useRef<SafeRouterInstance<Routes> | null>(null);

    return React.useMemo(() => {
      if (!routerRef.current) {
        routerRef.current = createTypedRouter<Routes>(nextRouter);
      }
      return routerRef.current as SafeRouterInstance<Routes>;
    }, [nextRouter]);
  };
}
