import { createNextSafeNavigation } from 'next-safe-routes';
import { Routes } from './types/routes';

const locales = ['en', 'es'];

export const { getRoute } = createNextSafeNavigation<Routes>({
  withI18N: true,
  locales,
});
