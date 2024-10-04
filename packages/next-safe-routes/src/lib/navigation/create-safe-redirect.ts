import { redirect, RedirectType } from 'next/navigation';
import { BaseRoutes, RequiresPathConfig } from '@/types';
import { createGetSafeRoute } from './create-get-safe-route';

export function createSafeRedirect<Routes extends BaseRoutes>() {
  const getRoute = createGetSafeRoute<Routes>();

  return function typedRedirect(
    pathname: keyof Routes,
    ...pathConfig: RequiresPathConfig<Routes[keyof Routes]> extends true
      ? [config: Routes[keyof Routes] & { type?: RedirectType }]
      : [config?: Partial<Routes[keyof Routes]> & { type?: RedirectType }]
  ) {
    const [config] = pathConfig;
    // @ts-ignore
    const route = getRoute(pathname, config);
    return redirect(route);
  };
}
