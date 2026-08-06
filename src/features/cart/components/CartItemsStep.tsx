import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { BorderButton, FilledButton } from '../../../components/Buttons'
import type { OrderDto } from '../../../services/api'
import { formatMoney } from '../cart.utils'

interface CartItemsStepProps {
  cart: OrderDto | null
  serviceImages: Map<string, string | null>
  saving: boolean
  onBrowseServices: () => void
  onChangeQuantity: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
  onClear: () => void
  onContinue: () => void
}

export default function CartItemsStep({
  cart,
  serviceImages,
  saving,
  onBrowseServices,
  onChangeQuantity,
  onRemove,
  onClear,
  onContinue,
}: CartItemsStepProps) {
  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-empty">
        <ShoppingCart size={38} />
        <h2>Tu carrito está vacío</h2>
        <p>Agrega un servicio para comenzar tu reserva.</p>
        <FilledButton className="cart-action cart-action--primary mt-6" onClick={onBrowseServices}>Ver servicios</FilledButton>
      </div>
    )
  }

  const requiresAdjustment = cart.items.length !== 1

  return (
    <div>
      <div className="cart-stack">
        {cart.items.map((item) => (
          <article key={item.id} className="cart-service">
            <div
              className="cart-service__media"
              style={serviceImages.get(item.serviceId) ? { backgroundImage: `url(${serviceImages.get(item.serviceId)})` } : undefined}
              role="img"
              aria-label={serviceImages.get(item.serviceId) ? item.serviceName : 'Servicio de AutoCare'}
            />
            <div className="cart-service__body">
              <div className="cart-service__copy">
                <h2 className="cart-service__title">{item.serviceName}</h2>
                <p className="cart-service__unit">{formatMoney(item.unitPrice)} por servicio</p>
              </div>
              <div className="cart-service__controls">
                <div className="cart-quantity">
                  <button
                    type="button"
                    onClick={() => onChangeQuantity(item.id, item.quantity - 1)}
                    disabled={saving || item.quantity <= 1}
                    aria-label={`Reducir cantidad de ${item.serviceName}`}
                  >
                    <Minus size={15} />
                  </button>
                  <span className="cart-quantity__value">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => onChangeQuantity(item.id, item.quantity + 1)}
                    disabled={saving}
                    aria-label={`Aumentar cantidad de ${item.serviceName}`}
                  >
                    <Plus size={15} />
                  </button>
                </div>
                <strong className="cart-service__price">{formatMoney(item.subtotal)}</strong>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  disabled={saving}
                  className="cart-icon-button"
                  aria-label={`Eliminar ${item.serviceName}`}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {requiresAdjustment ? (
        <p className="cart-warning" role="status">
          Para reservar, deja un solo servicio en el carrito. Puedes ajustar la cantidad o eliminar los servicios adicionales.
        </p>
      ) : null}
      <div className="cart-actions cart-actions--split">
        <BorderButton className="cart-action cart-action--secondary" onClick={onClear} disabled={saving}>Vaciar carrito</BorderButton>
        <FilledButton className="cart-action cart-action--primary" onClick={onContinue} disabled={saving || requiresAdjustment}>Continuar</FilledButton>
      </div>
    </div>
  )
}
