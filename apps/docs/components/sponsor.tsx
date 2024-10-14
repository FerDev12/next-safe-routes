import { forwardRef } from 'react';
import { LinkButton, LinkButtonProps } from './ui/link-button';

export const Sponsor = forwardRef<
  HTMLAnchorElement,
  Omit<LinkButtonProps, 'href' | 'target' | 'rel'>
>(function Sponsor(props, ref) {
  return (
    <LinkButton
      ref={ref}
      href='https://patreon.com/Bloom_491'
      target='_blank'
      rel='noreferrer noopener'
      {...props}
    />
  );
});
