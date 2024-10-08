import { cn } from '@/lib/utils';
import clsx from 'clsx';
import { PropsWithChildren } from 'react';

type NoteProps = PropsWithChildren & {
  title?: string;
  type?: 'note' | 'danger' | 'warning' | 'success' | 'info';
};

export default function Note({
  children,
  title = 'Note',
  type = 'note',
}: NoteProps) {
  const noteClassNames = clsx({
    'dark:bg-neutral-900 bg-neutral-100': type == 'note',
    'dark:bg-rose-950/80 bg-rose-100/80 border-rose-200 dark:border-rose-900':
      type === 'danger',
    'dark:bg-amber-950/80 bg-amber-100/80 border-amber-200 dark:border-amber-900':
      type === 'warning',
    'dark:bg-green-950/80 bg-green-100/80 border-green-200 dark:border-green-900':
      type === 'success',
    'dark:bg-sky-950/80 bg-sky-950/80 border-sky-200 dark:border-sky-900':
      type === 'info',
  });

  return (
    <div
      className={cn(
        'border-2 rounded-md py-0.5 px-3.5 text-sm tracking-wide',
        noteClassNames
      )}
    >
      <p className='font-semibold -mb-3'>{title}:</p> {children}
    </div>
  );
}
