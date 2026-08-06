import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { BorderButton, FilledButton } from '../../../components/Buttons'
import type { OrderDto } from '../../../services/api'
import { formatMoney } from '../cart.utils'

interface CartItemsStepProps {
  cart: OrderDto | null
  saving: boolean
  onBrowseServices: () => void
  onChangeQuantity: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
  onClear: () => void
  onContinue: () => void
}

export default function CartItemsStep({
  cart,
  saving,
  onBrowseServices,
  onChangeQuantity,
  onRemove,
  onClear,
  onContinue,
}: CartItemsStepProps) {
  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center text-center">
        <ShoppingCart className="mb-4 text-gray-600" size={38} />
        <h2 className="text-xl font-bold text-gray-200">Tu carrito está vacío</h2>
        <p className="mt-2 max-w-sm text-sm text-gray-400">Agrega un servicio para comenzar tu reserva.</p>
        <FilledButton className="mt-6" onClick={onBrowseServices}>Ver servicios</FilledButton>
      </div>
    )
  }

  const requiresAdjustment = cart.items.length !== 1

  return (
    <div>
      <div className="space-y-3">
        {cart.items.map((item) => (
          <article key={item.id} className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/50 p-4">
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-bold text-gray-100">{item.serviceName}</h2>
              <p className="mt-1 text-sm text-gray-400">{formatMoney(item.unitPrice)} por servicio</p>
            </div>
            <div className="flex items-center rounded-lg border border-gray-700">
              <button
                type="button"
                onClick={() => onChangeQuantity(item.id, item.quantity - 1)}
                disabled={saving || item.quantity <= 1}
                className="p-2 text-gray-300 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Reducir cantidad de ${item.serviceName}`}
              >
                <Minus size={15} />
              </button>
              <span className="w-9 text-center text-sm font-bold">{item.quantity}</span>
              <button
                type="button"
                onClick={() => onChangeQuantity(item.id, item.quantity + 1)}
                disabled={saving}
                className="p-2 text-gray-300 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Aumentar cantidad de ${item.serviceName}`}
              >
                <Plus size={15} />
              </button>
            </div>
            <strong className="w-28 text-right text-gray-100">{formatMoney(item.subtotal)}</strong>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              disabled={saving}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-800 hover:text-red-300 disabled:opacity-40"
              aria-label={`Eliminar ${item.serviceName}`}
            >
              <Trash2 size={17} />
            </button>
          </article>
        ))}
      </div>
      {requiresAdjustment ? (
        <p className="mt-4 rounded-xl border border-amber-900 bg-amber-950/40 px-4 py-3 text-sm text-amber-100" role="status">
          Para reservar, deja un solo servicio en el carrito. Puedes ajustar la cantidad o eliminar los servicios adicionales.
        </p>
      ) : null}
      <div className="mt-6 flex items-center justify-between">
        <BorderButton onClick={onClear} disabled={saving}>Vaciar carrito</BorderButton>
        <FilledButton onClick={onContinue} disabled={saving || requiresAdjustment}>Continuar</FilledButton>
      </div>
    </div>
  )
}
