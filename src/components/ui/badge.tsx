import type { HTMLAttributes } from 'react'
import { cn } from './utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'neutral'

/** Etiqueta breve para comunicar estado junto con texto, nunca solo por color. */
export function Badge({ className, variant = 'default', ...props }: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return <span className={cn('ac-badge', `ac-badge--${variant}`, className)} {...props} />
}
