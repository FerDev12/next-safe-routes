export type Params = Record<string, string | string[] | undefined>;
export type Query = Record<string, string>;

export type BaseRoutes = {
  [K: string]: {
    params?: Params;
    query?: Query;
  };
};

export type RequiresPathConfig<T> = T extends
  | { params: Params }
  | { query: Query }
  ? true
  : false;

export type PathConfig<Routes extends BaseRoutes, Path extends keyof Routes> =
  RequiresPathConfig<Routes[Path]> extends true
    ? [config: Routes[Path]]
    : [config?: Partial<Routes[Path]>];

export type RouteConfig = {
  params: Params;
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
