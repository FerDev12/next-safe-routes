export type Params = Record<string, string | string[] | undefined>;
export type Query = Record<string, string>;

export type BaseRoutes = {
  [K: string]: {
    params?: Params;
    query?: Query;
    context?: string;
  };
};

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

export type RequiresContextConfig<T> = T extends {
  context: string;
}
  ? true
  : false;

export type RequiresPathConfig<T> = T extends
  | { params: Params }
  | { query: Query }
  | { context: string }
  ? true
  : false;

export type PathConfig<Routes extends BaseRoutes, Path extends keyof Routes> =
  RequiresPathConfig<Routes[Path]> extends true
    ? Routes[Path]
    : Partial<Routes[Path]>;

export type SpreadablePathConfig<
  Routes extends BaseRoutes,
  Path extends keyof Routes,
> =
  RequiresPathConfig<Routes[Path]> extends true
    ? [config: PathConfig<Routes, Path>]
    : [config?: PathConfig<Routes, Path>];

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
