import type { ReactNode } from 'react'

interface AdminSectionHeaderProps {
  id?: string
  title: string
  description: string
  action?: ReactNode
}

export default function AdminSectionHeader({ id, title, description, action }: AdminSectionHeaderProps) {
  return (
    <header className="admin-section__header">
      <div>
        <h2 id={id}>{title}</h2>
        <p>{description}</p>
      </div>
      {action ? <div className="admin-section__action">{action}</div> : null}
    </header>
  )
}
