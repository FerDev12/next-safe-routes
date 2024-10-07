import {
  redirect as nextRedirect,
  RedirectType as NextRedirectType,
} from 'next/navigation';
import { BaseRoutes, PathConfig, RequiresPathConfig } from '@/types';
import { createGetSafeRoute } from './create-get-safe-route';

export type RedirectType = NextRedirectType;

export type RedirectSpreadablePathConfig<
  Routes extends BaseRoutes,
  Path extends keyof Routes,
> =
  RequiresPathConfig<Routes[Path]> extends true
    ? [config: Routes[Path] & { type?: NextRedirectType }]
    : [config?: Partial<Routes[Path]> & { type?: NextRedirectType }];

export type SafeRedirect<Routes extends BaseRoutes> = <
  Path extends keyof Routes,
>(
  // eslint-disable-next-line no-unused-vars
  pathname: Path,
  // eslint-disable-next-line no-unused-vars
  ...pathConfig: RedirectSpreadablePathConfig<Routes, Path>
) => never;

export function createSafeRedirect<
  Routes extends BaseRoutes,
>(): SafeRedirect<Routes> {
  const getRoute = createGetSafeRoute<Routes>();

  /**
   * Enhanced Next.js native redirect with type-safety.
   * @param pathname
   * @param pathConfig
   * @returns
   */
  const safeRedirect: SafeRedirect<Routes> = function SafeRedirect<
    Path extends keyof Routes,
  >(
    pathname: Path,
    ...pathConfig: RedirectSpreadablePathConfig<Routes, Path>
  ): never {
    const [config] = pathConfig;

    const route = getRoute(
      pathname as Path,
      config as PathConfig<Routes, Path>
    );
    return nextRedirect(route, config?.type);
  } as SafeRedirect<Routes>;

  return safeRedirect;
}
