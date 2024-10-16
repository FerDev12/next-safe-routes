'use client';

import { EachRoute } from '@/lib/routes-config';
import Anchor from './anchor';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { SheetClose } from '@/components/ui/sheet';
import { Button } from './ui/button';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function SubLink({
  title,
  href,
  items,
  noLink,
  level,
  isSheet,
}: EachRoute & { level: number; isSheet: boolean }) {
  const path = usePathname();
  const [isOpen, setIsOpen] = useState(level === 0);

  useEffect(() => {
    if (path != href && path.includes(href)) setIsOpen(true);
  }, [href, path]);

  const Comp = (
    <Anchor
      className='text-sm hover:text-primary'
      activeClassName='text-primary font-medium'
      href={href}
    >
      {title}
    </Anchor>
  );

  const titleOrLink = !noLink ? (
    isSheet ? (
      <SheetClose asChild>{Comp}</SheetClose>
    ) : (
      Comp
    )
  ) : (
    <h4 className='text-sm text-primary font-medium'>{title}</h4>
  );

  if (!items) {
    return <div className='flex flex-col'>{titleOrLink}</div>;
  }

  return (
    <div className='flex flex-col gap-1 w-full transition-all'>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className='flex items-center gap-2'>
          {titleOrLink}
          <CollapsibleTrigger asChild>
            <Button
              className='ml-auto mr-3.5 h-6 w-6'
              variant='link'
              size='icon'
            >
              <ChevronRight
                className={cn(
                  'h-[0.9rem] w-[0.9rem] transition-transform',
                  isOpen && 'rotate-90'
                )}
              />
              <span className='sr-only'>Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className='block data-[state=closed]:opacity-0 data-[state=open]:opacity-100 data-[state=closed]:scale-y-0 data-[state=open]:scale-y-100 origin-top transition-all'>
          <div
            className={cn(
              'flex flex-col items-start sm:text-sm dark:text-neutral-300/85 text-neutral-800 ml-0.5 mt-2.5 gap-3 pl-4 border-l'
              // level > 0 && 'pl-4 border-l ml-1'
            )}
          >
            {items?.map((innerLink) => {
              const modifiedItems = {
                ...innerLink,
                href: `${href + innerLink.href}`,
                level: level + 1,
                isSheet,
              };
              return <SubLink key={modifiedItems.href} {...modifiedItems} />;
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
