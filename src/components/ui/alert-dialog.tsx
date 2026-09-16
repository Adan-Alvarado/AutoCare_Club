import { useEffect, useRef, type ReactNode } from 'react'
import { Button } from './button'

type AlertDialogProps = {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
  pending?: boolean
}

/** Confirma operaciones irreversibles y devuelve el foco al control que la abrió. */
export function AlertDialog({ open, title, description, confirmLabel, onCancel, onConfirm, pending = false }: AlertDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog ref={dialogRef} className="ac-dialog" aria-labelledby="confirm-dialog-title" onCancel={onCancel}>
      <section className="ac-dialog__content">
        {/* Contexto de la acción para que la decisión sea informada. */}
        <header className="ac-dialog__header">
          <h2 id="confirm-dialog-title">{title}</h2>
          <p>{description}</p>
        </header>
        {/* Acciones explícitas: cancelar conserva el estado; confirmar ejecuta el cambio. */}
        <footer className="ac-dialog__actions">
          <Button variant="secondary" onClick={onCancel} disabled={pending}>Cancelar</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={pending}>{pending ? 'Procesando…' : confirmLabel}</Button>
        </footer>
      </section>
    </dialog>
  )
}
