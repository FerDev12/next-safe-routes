'use client';

import { buttonVariants } from '@/components/ui/button';
import { getRoutesFlatten } from '@/lib/routes-config';
import Link from 'next/link';
import { useVersion } from './context/version';
import { ChevronRightIcon } from 'lucide-react';

export default function GetStarted() {
  const { currentVersion } = useVersion();
  const routes = getRoutesFlatten(currentVersion);
  return (
    <Link
      href={`/docs/${currentVersion}${routes[0].href}`}
      className={buttonVariants({ className: 'px-6 group', size: 'lg' })}
    >
      Get Stared{' '}
      <ChevronRightIcon className='h-5 w-5 ml-2 transition-transform group-hover:translate-x-0.5' />
    </Link>
  );
}
