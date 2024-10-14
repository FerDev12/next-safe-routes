import { BaseRoutes, SpreadablePathConfig } from '@/types';
import {
  createUseSafeRouter,
  SafeRouterInstance,
} from './create-use-safe-router';
import { createGetSafeRoute } from './create-get-safe-route';
import { createSafeRedirect, SafeRedirect } from './create-safe-redirect';
import { createSafeLink, SafeLink } from './create-safe-link';

type CreateSafeNavigationReturnType<Routes extends BaseRoutes> = {
  getRoute: <Path extends keyof Routes>(
    // eslint-disable-next-line no-unused-vars
    pathname: Path,
    // eslint-disable-next-line no-unused-vars
    ...pathConfig: SpreadablePathConfig<Routes, Path>
  ) => string;
  useRouter: () => SafeRouterInstance<Routes>;
  redirect: SafeRedirect<Routes>;
  Link: SafeLink<Routes>;
};

export function createNextSafeNavigation<
  Routes extends BaseRoutes,
  Locale extends string = string,
>(opts?: {
  defaultLocale?: Locale;
  locales?: Locale[];
  withI18N?: boolean;
}): CreateSafeNavigationReturnType<Routes> {
  const getRoute = createGetSafeRoute<Routes>(opts);
  const useRouter = createUseSafeRouter<Routes>();
  const redirect = createSafeRedirect<Routes>();
  const Link = createSafeLink<Routes>();

  return {
    getRoute,
    useRouter,
    redirect,
    Link,
  };
}
