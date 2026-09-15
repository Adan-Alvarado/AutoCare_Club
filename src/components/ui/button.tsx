import type { ButtonHTMLAttributes } from 'react'
import { cn } from './utils'

type ButtonVariant = 'default' | 'secondary' | 'ghost' | 'destructive'
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variants: Record<ButtonVariant, string> = {
  default: 'ac-button--primary',
  secondary: 'ac-button--secondary',
  ghost: 'ac-button--ghost',
  destructive: 'ac-button--destructive',
}

const sizes: Record<ButtonSize, string> = {
  default: 'ac-button--default',
  sm: 'ac-button--sm',
  lg: 'ac-button--lg',
  icon: 'ac-button--icon',
}

/** Primitiva base para acciones; la API sigue el patrón de variantes de shadcn/ui. */
export function Button({ className, variant = 'default', size = 'default', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn('ac-button', variants[variant], sizes[size], className)} {...props} />
}
