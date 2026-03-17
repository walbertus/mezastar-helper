/**
 * Badge primitive — shadcn/ui style.
 * Displays a small inline label with optional variant styling.
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]',
        secondary: 'bg-[var(--md-sys-color-secondary)] text-[var(--md-sys-color-on-secondary)]',
        destructive: 'bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)]',
        outline:
          'border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)]',
        success: 'bg-[var(--md-sys-color-tertiary)] text-[var(--md-sys-color-on-tertiary)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

/** Inline badge label with variant support. */
export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
