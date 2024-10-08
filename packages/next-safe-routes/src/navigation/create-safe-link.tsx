'use client';

import React, { forwardRef, Ref, useMemo } from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { BaseRoutes, PathConfig } from '@/types';
import { createGetSafeRoute } from './create-get-safe-route';

export type LinkRequiresParamsConfig<T> = T extends {
  params: Record<string, string | string[]>;
}
  ? true
  : false;

export type LinkParamsConfig<
  Routes extends BaseRoutes,
  Path extends keyof Routes,
> =
  LinkRequiresParamsConfig<Routes[Path]> extends true
    ? {
        params: Routes[Path]['params'];
      }
    : { params?: Routes[Path]['params'] };

export type LinkQueryContextConfig<
  Routes extends BaseRoutes,
  Path extends keyof Routes,
> = Omit<Routes[Path], 'params'>;

export type Href<Routes extends BaseRoutes, Path extends keyof Routes> = {
  href: ({ pathname: Path } & PathConfig<Routes, Path>) | string;
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

        const config: Partial<PathConfig<Routes, Path>> = {
          params: href.params as Routes[Path]['params'],
          context: href.context as Routes[Path]['context'],
          query: href.query as Routes[Path]['query'],
        } as PathConfig<Routes, Path>;

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
