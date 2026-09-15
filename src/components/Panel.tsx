import type { HTMLAttributes } from 'react'
import { Card } from './ui/card'

export function ThemedPanel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <Card className={className} {...props} />
}
