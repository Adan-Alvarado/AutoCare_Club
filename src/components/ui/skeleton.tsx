import type { HTMLAttributes } from 'react'
import { cn } from './utils'

/** Reserva el espacio del contenido mientras una consulta remota está pendiente. */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn('ac-skeleton', className)} {...props} />
}
