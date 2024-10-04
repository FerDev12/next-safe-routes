import { useRouter } from 'next/navigation';
import { useMemo, useRef } from 'react';
import { BaseRoutes, PathConfig } from '@/types';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { createGetSafeRoute } from './create-get-safe-route';
import { deepFreeze } from '@/utils/deep-freeze';

type TypedRouterInstance<Routes extends BaseRoutes> = Omit<
  AppRouterInstance,
  'prefetch' | 'push' | 'replace'
> & {
  prefetch: <Path extends keyof Routes>(
    pathname: Path,
    ...pathConfig: PathConfig<Routes, Path>
  ) => ReturnType<AppRouterInstance['prefetch']>;
  push: <Path extends keyof Routes>(
    pathname: Path,
    ...pathConfig: PathConfig<Routes, Path>
  ) => ReturnType<AppRouterInstance['push']>;
  replace: <Path extends keyof Routes>(
    pathname: Path,
    ...pathConfig: PathConfig<Routes, Path>
  ) => ReturnType<AppRouterInstance['replace']>;
};

function createTypedRouter<Routes extends BaseRoutes>(
  nextRouter: AppRouterInstance
): Readonly<TypedRouterInstance<Routes>> {
  const getRoute = createGetSafeRoute<Routes>();

  const typedRouter: TypedRouterInstance<Routes> = {
    ...nextRouter,
    prefetch: (pathname, ...pathConfig) => {
      const [config] = pathConfig;
      try {
        // @ts-ignore
        return nextRouter.prefetch(getRoute(path, config));
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
        return nextRouter.push(getRoute(path, config));
      } catch (error: any) {
        console.error(error, `Failed to push route: ${pathname.toString()}`);
        throw error;
      }
    },
    replace: (pathname, ...pathConfig) => {
      const [config] = pathConfig;
      try {
        // @ts-ignore
        return nextRouter.replace(getRoute(path, config));
      } catch (error: any) {
        console.error(error, `Failed to replace route: ${pathname.toString()}`);
        throw error;
      }
    },
  };
  return deepFreeze(typedRouter);
}

export function createUseSafeRouter<Routes extends BaseRoutes>() {
  return function useTypedRouter() {
    const nextRouter = useRouter();
    const routerRef = useRef<TypedRouterInstance<Routes> | null>(null);

    return useMemo(() => {
      if (!routerRef.current) {
        routerRef.current = createTypedRouter<Routes>(nextRouter);
      }
      return routerRef.current;
    }, [nextRouter]);
  };
}
