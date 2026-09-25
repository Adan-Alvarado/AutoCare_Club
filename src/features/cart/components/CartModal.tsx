import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react'
import { ChevronLeft, X } from 'lucide-react'
import type { CheckoutStep } from '../cart.types'
import BookingStepper from './BookingStepper'

interface CartModalProps {
  title: string
  activeStep: CheckoutStep
  showBack: boolean
  error: string
  notice: string
  summary: ReactNode
  children: ReactNode
  onBack: () => void
  onClose: () => void
}

export default function CartModal({
  title,
  activeStep,
  showBack,
  error,
  notice,
  summary,
  children,
  onBack,
  onClose,
}: CartModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
    return () => {
      if (dialog?.open) dialog.close()
    }
  }, [])

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className="cart-dialog"
      aria-labelledby="cart-title"
      onCancel={(event) => { event.preventDefault(); onClose() }}
      onClick={handleBackdropClick}
    >
      <div className="cart-dialog__shell">
        <header className="cart-dialog__header">
          <div>
            <h1 id="cart-title" className="cart-dialog__title">{title}</h1>
            <p className="cart-dialog__subtitle">Tu vehículo, atendido con el cuidado que merece.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cart-dialog__close"
            aria-label="Cerrar carrito"
          >
            <X size={22} />
          </button>
        </header>

        {/* El progreso queda fuera del área desplazable para orientar durante todo el checkout. */}
        <BookingStepper activeStep={activeStep} />

        <div className="cart-dialog__body">
          <section className="cart-dialog__content">
            {showBack ? (
              <button
                type="button"
                onClick={onBack}
                className="cart-back"
              >
                <ChevronLeft size={17} />
                Volver
              </button>
            ) : null}

            {error ? (
              <p className="cart-alert" role="alert">
                {error}
              </p>
            ) : null}

            {notice ? <p className="cart-alert" role="status">{notice}</p> : null}

            {children}
          </section>

          {summary}
        </div>
      </div>
    </dialog>
  )
}
