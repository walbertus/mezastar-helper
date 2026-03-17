/**
 * Card primitives — shadcn/ui style.
 * Exports Card, CardHeader, CardTitle, CardContent, CardFooter.
 */

import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

/** Container card with surface background and border. */
export const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] shadow-sm overflow-hidden',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

/** Card header section with bottom border. */
export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col space-y-1.5 px-4 py-3 border-b border-[var(--md-sys-color-outline-variant)]',
        className
      )}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

/** Card title text. */
export const CardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-[15px] font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

/** Card scrollable/padded content area. */
export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('p-4', className)} {...props} />
);
CardContent.displayName = 'CardContent';

/** Card footer section. */
export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center px-4 py-3', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';
