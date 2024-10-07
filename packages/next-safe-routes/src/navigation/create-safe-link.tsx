'use client';

import React, { forwardRef, Ref, useMemo } from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { BaseRoutes, ParamsConfig, PathConfig, Query } from '@/types';
import { createGetSafeRoute } from './create-get-safe-route';

export type RequiresContextQueryConfig<T> = T extends
  | {
      context: string;
      query?: Query;
    }
  | {
      context: string;
      query: Query;
    }
  ? true
  : false;

export type ContextQueryConfig<
  Routes extends BaseRoutes,
  Path extends keyof Routes,
  Config extends Routes[Path],
> = Omit<Config, 'params'>;

export type Href<Routes extends BaseRoutes, Path extends keyof Routes> = {
  href:
    | ({
        pathname: Path;
      } & ParamsConfig<Routes, Path, Routes[Path]['params']> &
        ContextQueryConfig<Routes, Path, Routes[Path]>)
    | string;
};

export type SafeLinkProps<
  Routes extends BaseRoutes,
  Path extends keyof Routes,
> = Omit<NextLinkProps, 'href'> &
  Href<Routes, Path> &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps>;

export type SafeLink<Routes extends BaseRoutes> = <Path extends keyof Routes>(
  // eslint-disable-next-line no-unused-vars
  props: SafeLinkProps<Routes, Path>
) => React.ReactElement;

export function createSafeLink<Routes extends BaseRoutes>() {
  const getRouteSingleton = createGetSafeRoute<Routes>();

  const SafeLink = forwardRef(
    <Path extends keyof Routes>(
      { href, ...props }: SafeLinkProps<Routes, Path>,
      ref: Ref<HTMLAnchorElement>
    ) => {
      const parsedHref = useMemo(() => {
        if (typeof href === 'string') return href;

        const config: Partial<PathConfig<Routes, Path>> = {};

        if (href.params) {
          config.params = href.params;
        }

        if (href.query) {
          config.query = href.query;
        }

        if ('context' in href && href.context) {
          config.context = href.context as Routes[Path]['context'];
        }

        try {
          return getRouteSingleton(
            href.pathname as Path,
            config as PathConfig<Routes, Path>
          );
        } catch (err: unknown) {
          console.error('Error, failed to generate route:', err);
          // Prevent runtime errors
          return '#';
        }
      }, [href]);

      return (
        <NextLink
          ref={ref}
          href={typeof href === 'string' ? href : parsedHref}
          {...props}
        />
      );
    }
  );

  SafeLink.displayName = 'SafeLink';
  return SafeLink as SafeLink<Routes>;
}
