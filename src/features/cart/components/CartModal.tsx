import type { ReactNode } from 'react'
import { ChevronLeft, X } from 'lucide-react'

interface CartModalProps {
  title: string
  showBack: boolean
  error: string
  summary: ReactNode
  children: ReactNode
  onBack: () => void
  onClose: () => void
}

export default function CartModal({
  title,
  showBack,
  error,
  summary,
  children,
  onBack,
  onClose,
}: CartModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-800 px-7 py-5">
          <div>
            <h1 id="cart-title" className="text-2xl font-bold text-gray-100">{title}</h1>
            <p className="mt-1 text-sm text-gray-400">Tu auto en buenas manos, de principio a fin.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white focus-visible:outline-2 focus-visible:outline-amber-300"
            aria-label="Cerrar carrito"
          >
            <X size={22} />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_320px] overflow-y-auto">
          <section className="min-w-0 p-7">
            {showBack ? (
              <button
                type="button"
                onClick={onBack}
                className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white focus-visible:outline-2 focus-visible:outline-amber-300"
              >
                <ChevronLeft size={17} />
                Volver
              </button>
            ) : null}

            {error ? (
              <p className="mb-5 rounded-xl border border-red-900 bg-red-950/60 px-4 py-3 text-sm text-red-200" role="alert">
                {error}
              </p>
            ) : null}

            {children}
          </section>

          {summary}
        </div>
      </div>
    </div>
  )
}
