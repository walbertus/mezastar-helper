/**
 * Tailwind class merging utility.
 * Combines clsx and tailwind-merge so conditional class lists are deduplicated.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind CSS classes without conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
