import { createNextSafeNavigation } from 'next-safe-routes';
import { Routes } from './types/routes';

export const { getRoute, useRouter, redirect, Link } =
  createNextSafeNavigation<Routes>();
