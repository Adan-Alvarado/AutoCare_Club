import { CalendarDays, CarFront, Clock3, CreditCard } from 'lucide-react'
import type { OrderDto, ScheduleAvailabilityDto, VehicleDto } from '../../../services/api'
import { formatDate, formatMoney, formatTime } from '../cart.utils'
import type { PaymentMethod } from '../cart.types'

interface OrderSummaryProps {
  cart: OrderDto | null
  vehicle?: VehicleDto
  date: string
  slot: ScheduleAvailabilityDto | null
  totalMinutes: number
  paymentMethod: PaymentMethod
}

export default function OrderSummary({
  cart,
  vehicle,
  date,
  slot,
  totalMinutes,
  paymentMethod,
}: OrderSummaryProps) {
  return (
    <aside className="cart-summary">
      <h2 className="cart-summary__title">Resumen</h2>
      <div className="cart-summary__services">
        {cart?.items.map((item) => (
          <div key={item.id} className="cart-summary__service">
            <span>{item.quantity} × {item.serviceName}</span>
            <span>{formatMoney(item.subtotal)}</span>
          </div>
        )) ?? <p className="cart-summary__pending">Sin servicios</p>}
      </div>
      <dl className="cart-summary__details">
        <div className="cart-summary__detail">
          <CarFront size={18} />
          <div><dt>Vehículo seleccionado</dt><dd className={!vehicle ? 'cart-summary__pending' : undefined}>{vehicle ? `${vehicle.brand} · ${vehicle.year}` : 'Seleccionar en el siguiente paso'}</dd></div>
        </div>
        <div className="cart-summary__detail">
          <CalendarDays size={18} />
          <div><dt>Reserva</dt><dd className={!slot ? 'cart-summary__pending' : undefined}>{slot ? `${formatDate(date)}, ${formatTime(slot.startTime)}` : 'Seleccionar en el siguiente paso'}</dd></div>
        </div>
        <div className="cart-summary__detail">
          <CreditCard size={18} />
          <div><dt>Método de pago</dt><dd>{paymentMethod === 'card' ? 'Tarjeta' : 'En el taller'}</dd></div>
        </div>
        <div className="cart-summary__detail">
          <Clock3 size={18} />
          <div><dt>Tiempo estimado</dt><dd>{totalMinutes ? `${totalMinutes} min` : 'Por calcular'}</dd></div>
        </div>
      </dl>
      <div className="cart-summary__total">
        <span>Total</span>
        <strong>{formatMoney(cart?.total ?? 0)}</strong>
      </div>
    </aside>
  )
}
