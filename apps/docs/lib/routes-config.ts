// for page navigation & to sort on leftbar

export type EachRoute = {
  title: string;
  href: string;
  noLink?: true;
  items?: EachRoute[];
};

const vBETA: EachRoute[] = [
  {
    title: 'Getting Started',
    href: '/getting-started',
    noLink: true,
    items: [
      {
        title: 'Changelog',
        href: '/changelog',
      },
      {
        title: 'Introduction',
        href: '/introduction',
      },
      {
        title: 'Installation',
        href: '/installation',
      },
      {
        title: 'Quick Start',
        href: '/quick-start',
      },
    ],
  },
  {
    title: 'Navigation',
    href: '/navigation',
    noLink: true,
    items: [
      {
        title: 'createNextSafeNavigation',
        href: '/create-next-safe-navigation',
      },
      {
        title: 'getRoute',
        href: '/get-route',
      },
      {
        title: 'useRouter',
        href: '/use-router',
      },
      {
        title: 'redirect',
        href: '/redirect',
      },
    ],
  },
];

const allRoutes: EachRoute[][] = [vBETA];

type Page = { title: string; href: string };

function getRecurrsiveAllLinks(node: EachRoute) {
  const ans: Page[] = [];
  if (!node.noLink) {
    ans.push({ title: node.title, href: node.href });
  }
  node.items?.forEach((subNode) => {
    const temp = { ...subNode, href: `${node.href}${subNode.href}` };
    ans.push(...getRecurrsiveAllLinks(temp));
  });
  return ans;
}

export function getRoutesFlatten(v: Version) {
  const routes = getRoutesForVersion(v);
  return routes.map((it) => getRecurrsiveAllLinks(it)).flat();
}

export function getRoutesForVersion(v: Version) {
  // Add accordingly
  switch (v) {
    case 'beta':
      return vBETA;
    default:
      return allRoutes[allRoutes.length - 1];
  }
}

export function getPreviousNext(path: string, v: Version) {
  path = path.split('/').slice(1).join('/');
  const routes = getRoutesFlatten(v);
  const index = routes.findIndex(({ href }) => href == `/${path}`);
  return {
    prev: routes[index - 1],
    next: routes[index + 1],
  };
}

export const availableVersions = ['beta'] as const;
export type Version = (typeof availableVersions)[number];
