import { buttonVariants } from '@/components/ui/button';
import { MoveUpRightIcon, SignpostIcon, TerminalIcon } from 'lucide-react';
import Link from 'next/link';
import GetStarted from '../components/get-started';

export default function Home() {
  return (
    <div className='flex h-[calc(100svh-64px)] flex-col items-center justify-center text-center px-2 py-8'>
      <Link
        href='https://github.com/ferdev12/next-safe-routes'
        target='_blank'
        className='mb-6 sm:text-lg flex items-center gap-2 underline underline-offset-4'
      >
        Follow along on GitHub{' '}
        <MoveUpRightIcon className='w-4 h-4 font-extrabold' />
      </Link>
      <h1 className='flex flex-col justify-center items-center text-3xl font-bold mb-4 sm:text-7xl'>
        <SignpostIcon className='w-14 h-14 text-teal-500  mr-2' />
        Type-Safe routing for your Next.js app.{' '}
      </h1>
      <p className='mb-8 sm:text-xl max-w-[800px] text-muted-foreground'>
        Navigate with confidence across pages within your app.
      </p>
      <div className='flex flex-row items-center gap-5'>
        <GetStarted />
        {/* <Link
          href='#'
          className={buttonVariants({
            variant: 'outline',
            className: 'px-6',
            size: 'lg',
          })}
        >
          Customize
        </Link> */}
      </div>
      <span className='flex flex-row items-center gap-2 text-zinc-400 text-md mt-7 -mb-12 max-[800px]:mb-12'>
        <TerminalIcon className='w-4 h-4 mr-1' /> ~ npm install
        next-safe-routes@latest
      </span>
    </div>
  );
}
