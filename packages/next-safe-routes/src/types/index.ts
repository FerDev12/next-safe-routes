export type BaseRoutes = {
  [K: string]: {
    params?: Record<string, string | string[] | undefined>;
    query?: { [K: string]: string | undefined };
  };
};

export type RequiresPathConfig<T> = T extends
  | { params: Record<string, string | string[]> }
  | { query: { [K: string]: string } }
  ? true
  : false;

export type PathConfig<Routes extends BaseRoutes, Path extends keyof Routes> =
  RequiresPathConfig<Routes[Path]> extends true
    ? [config: Routes[Path]]
    : [config?: Partial<Routes[Path]>];

export type RouteConfig = {
  params: Record<string, string | string[] | undefined>;
  query?: {
    required?: string[];
    optional?: string[];
  };
  omitFromRoutes?: boolean;
};

export type PageConfig = {
  searchParams?: {
    required?: string[];
    optional?: string[];
  };
  omitFromRoutes?: boolean;
};
