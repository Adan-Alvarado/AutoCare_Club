import { CalendarDays, CarFront, Clock3, CreditCard } from 'lucide-react'
import type { OrderDto, ScheduleAvailabilityDto, VehicleDto } from '../../../services/api'
import { formatDate, formatMoney, formatTime } from '../cart.utils'

interface OrderSummaryProps {
  cart: OrderDto | null
  vehicle?: VehicleDto
  date: string
  slot: ScheduleAvailabilityDto | null
  totalMinutes: number
}

export default function OrderSummary({
  cart,
  vehicle,
  date,
  slot,
  totalMinutes,
}: OrderSummaryProps) {
  return (
    <aside className="sticky top-0 self-start border-l border-gray-800 bg-gray-900/35 p-6">
      <h2 className="mb-5 text-lg font-bold text-gray-100">Resumen</h2>
      <div className="space-y-3 border-b border-gray-800 pb-5">
        {cart?.items.map((item) => (
          <div key={item.id} className="flex justify-between gap-4 text-sm">
            <span className="text-gray-300">{item.quantity} × {item.serviceName}</span>
            <span className="shrink-0 text-gray-100">{formatMoney(item.subtotal)}</span>
          </div>
        )) ?? <p className="text-sm text-gray-500">Sin servicios</p>}
      </div>
      <dl className="space-y-4 py-5 text-sm">
        <div className="flex gap-3">
          <CarFront className="mt-0.5 shrink-0 text-gray-500" size={18} />
          <div><dt className="text-gray-500">Vehículo</dt><dd className="font-medium text-gray-200">{vehicle ? `${vehicle.brand} · ${vehicle.year}` : 'Por seleccionar'}</dd></div>
        </div>
        <div className="flex gap-3">
          <CalendarDays className="mt-0.5 shrink-0 text-gray-500" size={18} />
          <div><dt className="text-gray-500">Reserva</dt><dd className="font-medium text-gray-200">{slot ? `${formatDate(date)}, ${formatTime(slot.startTime)}` : 'Por seleccionar'}</dd></div>
        </div>
        <div className="flex gap-3">
          <CreditCard className="mt-0.5 shrink-0 text-gray-500" size={18} />
          <div><dt className="text-gray-500">Pago</dt><dd className="font-medium text-gray-200">En el taller</dd></div>
        </div>
        <div className="flex gap-3">
          <Clock3 className="mt-0.5 shrink-0 text-gray-500" size={18} />
          <div><dt className="text-gray-500">Tiempo estimado</dt><dd className="font-medium text-gray-200">{totalMinutes ? `${totalMinutes} min` : 'Por calcular'}</dd></div>
        </div>
      </dl>
      <div className="flex items-end justify-between border-t border-gray-800 pt-5">
        <span className="text-sm text-gray-400">Total</span>
        <strong className="text-xl text-gray-100">{formatMoney(cart?.total ?? 0)}</strong>
      </div>
    </aside>
  )
}
