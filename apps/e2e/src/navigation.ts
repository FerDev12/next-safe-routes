import { createNextSafeNavigation } from 'next-safe-routes';
import { Routes } from './types/routes';

export const { getRoute, Link, useRouter, redirect } =
  createNextSafeNavigation<Routes>();
