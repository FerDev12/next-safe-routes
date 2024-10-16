import { ModeToggle } from '@/components/theme-toggle';
import {
  GithubIcon,
  TwitterIcon,
  HexagonIcon,
  MoveUpRightIcon,
  SignpostIcon,
  HeartIcon,
} from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from './ui/button';
import Search from './search';
import Anchor from './anchor';
import { SheetLeftbar } from './leftbar';
import { SheetClose } from '@/components/ui/sheet';
import NavGetStarted from './nav-get-started';
import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Sponsor } from './sponsor';

const VersionManager = dynamic(() => import('./version-select'), {
  ssr: false,
});

type NavLink =
  | {
      title: string;
      href: string;
      external?: boolean;
    }
  | { component: ReactNode; href: null };

export const NAVLINKS: NavLink[] = [
  {
    href: null,
    component: <NavGetStarted />,
  },
  // {
  //   title: "Blog",
  //   href: "/blog",
  // },
  // {
  //   title: 'Examples',
  //   href: '#',
  // },
  // {
  //   title: "Guides",
  //   href: "#",
  // },
  // {
  //   title: "Community",
  //   href: "#",
  //   external: true,
  // },
];

export function Navbar() {
  return (
    <nav className='w-full border-b h-16 sticky top-0 z-50 lg:px-4 px-2 backdrop-filter backdrop-blur-xl bg-opacity-5'>
      <div className='sm:p-3 p-1 max-w-[1530px] mx-auto h-full flex items-center justify-between md:gap-2'>
        <div className='flex items-center gap-5'>
          <SheetLeftbar />
          <div className='flex items-center gap-4'>
            <div className='sm:flex hidden gap-3'>
              <Logo />
              <VersionManager />
            </div>
            <div className='lg:flex hidden items-center gap-5 text-sm font-medium text-muted-foreground'>
              <NavMenu />
            </div>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2'>
            <Search />
            <div className='flex ml-2.5 sm:ml-0'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href='https://github.com/ferdev12/next-safe-routes'
                    className={buttonVariants({
                      variant: 'ghost',
                      size: 'icon',
                    })}
                  >
                    <GithubIcon className='w-[1.1rem] h-[1.1rem]' />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Github</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Sponsor variant='ghost' size='icon'>
                    <HeartIcon className='w-[1.1rem] h-[1.1rem] text-red-500 fill-red-500' />
                  </Sponsor>
                </TooltipTrigger>
                <TooltipContent>Sponsor</TooltipContent>
              </Tooltip>
              <ModeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function Logo() {
  return (
    <Link href='/' className='flex items-center gap-2.5'>
      <SignpostIcon className='w-7 h-7 text-teal-500' />
      <h2 className='text-md font-bold'>Next Safe Routes</h2>
    </Link>
  );
}

export function NavMenu({ isSheet = false }) {
  return (
    <>
      {NAVLINKS.map((item) => {
        const Comp =
          item.href == null ? (
            item.component
          ) : (
            <Anchor
              key={item.title + item.href}
              activeClassName='text-primary font-semibold'
              absolute
              className='flex items-center gap-1'
              href={item.href}
            >
              {item.title}{' '}
              {item.external && (
                <MoveUpRightIcon
                  className='w-3 h-3 align-super'
                  strokeWidth={3}
                />
              )}
            </Anchor>
          );
        return isSheet ? (
          <SheetClose key={item.href} asChild>
            {Comp}
          </SheetClose>
        ) : (
          Comp
        );
      })}
    </>
  );
}
