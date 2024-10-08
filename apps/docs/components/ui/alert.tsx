import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-rose-500/50 text-rose-900 bg-rose-50/80 dark:border-rose-500 dark:text-rose-100 dark:bg-rose-950/80 [&>svg]:text-rose-500',
        warning:
          'border-amber-500/50 text-amber-900 bg-amber-50/80 dark:border-amber-500 dark:text-amber-100 dark:bg-amber-950/80 [&>svg]:text-amber-500',
        info: 'border-sky-500/50 text-sky-900 bg-sky-50/80 dark:border-sky-500 dark:text-sky-100 dark:bg-sky-950/80 [&>svg]:text-sky-500',
        success:
          'border-emerald-500/50 text-emerald-900 bg-emerald-50/80 dark:border-emerald-500 dark:text-emerald-100 dark:bg-emerald-950/80 [&>svg]:text-emerald-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role='alert'
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
