import { useEffect, useRef, type ReactNode } from 'react'
import { Button } from './button'

type SheetProps = { open: boolean; title: string; children: ReactNode; onClose: () => void }

/** Panel lateral para tareas secundarias en móvil, con foco aislado mientras está abierto. */
export function Sheet({ open, title, children, onClose }: SheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog ref={dialogRef} className="ac-sheet" aria-labelledby="sheet-title" onCancel={onClose}>
      <section className="ac-sheet__content">
        <header className="ac-sheet__header">
          <h2 id="sheet-title">{title}</h2>
          <Button variant="ghost" size="icon" aria-label="Cerrar panel" onClick={onClose}>×</Button>
        </header>
        <div className="ac-sheet__body">{children}</div>
      </section>
    </dialog>
  )
}
