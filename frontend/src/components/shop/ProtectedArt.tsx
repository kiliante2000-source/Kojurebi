import type { ImgHTMLAttributes, ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

export const artworkImgProps = {
  draggable: false,
  'data-pin-nopin': 'true',
  nopin: 'nopin',
} as const;

export function ProtectedArt({
  className,
  children,
  ...rest
}: HTMLMotionProps<'span'> & { children: ReactNode }) {
  return (
    <motion.span className={cn('protected-art relative', className)} {...rest}>
      {children}
      <span className="protected-art-shield" aria-hidden="true" />
    </motion.span>
  );
}

export function ProtectedImg({
  className,
  wrapClassName,
  alt = '',
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { wrapClassName?: string }) {
  return (
    <ProtectedArt className={wrapClassName}>
      <img alt={alt} className={className} {...artworkImgProps} {...props} />
    </ProtectedArt>
  );
}
