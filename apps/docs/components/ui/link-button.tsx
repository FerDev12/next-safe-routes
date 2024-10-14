import Link, { LinkProps } from 'next/link';
import { AnchorHTMLAttributes, forwardRef } from 'react';
import { buttonVariants } from './button';
import { VariantProps } from 'class-variance-authority';

export type LinkButtonProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
  VariantProps<typeof buttonVariants>;

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  function LinkButton({ className, size, variant, ...props }, ref) {
    return (
      <Link
        ref={ref}
        className={buttonVariants({ className, size, variant })}
        {...props}
      />
    );
  }
);
