import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from './utils'

/** Select nativo: conserva teclado y lector de pantalla sin añadir una capa innecesaria. */
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn('ac-select', className)} {...props}>{children}</select>
  ),
)

Select.displayName = 'Select'
