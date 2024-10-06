'use client';

import React, { forwardRef, Ref, useMemo } from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { BaseRoutes, Params, PathConfig, Query } from '@/types';
import { createGetSafeRoute } from './create-get-safe-route';

export type RequiresParamsConfig<T> = T extends {
  params: Params;
}
  ? true
  : false;

export type RequiresQueryConfig<T> = T extends {
  query: Query;
}
  ? true
  : false;

export type ParamsConfig<
  Routes extends BaseRoutes,
  Path extends keyof Routes,
  Params extends Routes[Path]['params'],
> =
  RequiresParamsConfig<Routes[Path]> extends true
    ? { params: Params }
    : { params?: Params };

export type QueryConfig<
  Routes extends BaseRoutes,
  Path extends keyof Routes,
  Query extends Routes[Path]['query'],
> =
  RequiresQueryConfig<Routes[Path]> extends true
    ? { query: Query }
    : { query?: Query };

export type Href<Routes extends BaseRoutes, Path extends keyof Routes> = {
  href: {
    pathname: Path;
  } & ParamsConfig<Routes, Path, Routes[Path]['params']> &
    QueryConfig<Routes, Path, Routes[Path]['query']>;
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
        const config: PathConfig<Routes, Path>[0] = {};

        if (href.params) {
          config.params = href.params;
        }

        if (href.query) {
          config.query = href.query;
        }

        try {
          // @ts-ignore
          return getRouteSingleton(href.pathname as Path, config);
        } catch (err: unknown) {
          console.error('Error, failed to generate route:', err);
          // Prevent runtime errors
          return '#';
        }
      }, [href]);

      return <NextLink ref={ref} href={parsedHref} {...props} />;
    }
  );

  SafeLink.displayName = 'SafeLink';
  return SafeLink as SafeLink<Routes>;
}
