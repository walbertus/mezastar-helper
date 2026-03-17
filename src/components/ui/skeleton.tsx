/**
 * Skeleton primitive — shows a pulsing placeholder during loading.
 */

import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/** Animated loading placeholder block. */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-[var(--md-sys-color-surface-variant)]', className)}
      {...props}
    />
  );
}
