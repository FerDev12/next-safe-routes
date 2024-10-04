import { BaseRoutes } from '@/types';
import { createUseSafeRouter } from './create-use-safe-router';
import { createGetSafeRoute } from './create-get-safe-route';
import { createSafeRedirect } from './create-safe-redirect';
import { createSafeLink } from './create-safe-link';

export function creatNextSafeNavigation<Routes extends BaseRoutes>() {
  const getRoute = createGetSafeRoute<Routes>();
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
