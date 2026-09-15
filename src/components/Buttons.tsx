import { Button, type ButtonProps } from './ui/button'

/** Adaptadores temporales para migrar las pantallas sin romper su API actual. */
export function BorderButton({ className, ...props }: ButtonProps) {
  return <Button variant="secondary" className={className} {...props} />
}

export function FilledButton({ className, ...props }: ButtonProps) {
  return <Button variant="default" className={className} {...props} />
}
