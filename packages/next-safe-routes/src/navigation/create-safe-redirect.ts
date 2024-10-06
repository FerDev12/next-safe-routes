import {
  redirect as nextRedirect,
  RedirectType as NextRedirectType,
} from 'next/navigation';
import { BaseRoutes, RequiresPathConfig } from '@/types';
import { createGetSafeRoute } from './create-get-safe-route';

export type RedirectType = NextRedirectType;

export type PathConfig<Routes extends BaseRoutes, Path extends keyof Routes> =
  RequiresPathConfig<Routes[Path]> extends true
    ? [config: Routes[Path] & { type?: NextRedirectType }]
    : [config?: Partial<Routes[Path]> & { type?: NextRedirectType }];

export type SafeRedirect<Routes extends BaseRoutes> = <
  Path extends keyof Routes,
>(
  // eslint-disable-next-line no-unused-vars
  pathname: Path,
  // eslint-disable-next-line no-unused-vars
  ...pathConfig: PathConfig<Routes, Path>
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
  >(pathname: Path, ...pathConfig: PathConfig<Routes, Path>): never {
    const [config] = pathConfig;
    // @ts-ignore
    const route = getRoute(pathname, config);
    return nextRedirect(route);
  } as SafeRedirect<Routes>;

  return safeRedirect;
}
