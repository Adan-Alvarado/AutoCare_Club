import type { HTMLAttributes } from 'react'
import { cn } from './utils'

type AlertVariant = 'default' | 'success' | 'destructive' | 'warning'

export type AlertProps = HTMLAttributes<HTMLDivElement> & { variant?: AlertVariant }

export function Alert({ className, variant = 'default', ...props }: AlertProps) {
  return <div className={cn('ac-alert', `ac-alert--${variant}`, className)} {...props} />
}
