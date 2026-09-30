import { CalendarX2, Check, Circle, Clock3 } from 'lucide-react'
import { FilledButton } from '../../../components/Buttons'
import Loading from '../../../components/Loading'
import type { ScheduleAvailabilityDto } from '../../../services/api'
import { formatTime } from '../cart.utils'

interface ScheduleStepProps {
  date: string
  minimumDate: string
  slots: ScheduleAvailabilityDto[]
  selectedSlot: ScheduleAvailabilityDto | null
  loading: boolean
  hasError: boolean
  onDateChange: (date: string) => void
  onSelectSlot: (slot: ScheduleAvailabilityDto) => void
  onContinue: () => void
  onRetry: () => void
}

export default function ScheduleStep({
  date,
  minimumDate,
  slots,
  selectedSlot,
  loading,
  hasError,
  onDateChange,
  onSelectSlot,
  onContinue,
  onRetry,
}: ScheduleStepProps) {
  return (
    <div>
      {/* La fecha actualiza las franjas; solo la API decide cuáles se pueden reservar. */}
      <label className="cart-field max-w-xs">
        Fecha de la reserva
        <input
          type="date"
          min={minimumDate}
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
          className="[color-scheme:dark]"
        />
      </label>
      <h2 className="cart-step-heading">
        <Clock3 size={19} /> Horarios disponibles
      </h2>
      <p className="cart-step-copy">Elige una hora marcada como disponible para continuar.</p>
      {loading ? <Loading /> : hasError ? (
        <div className="cart-availability-empty" role="status">
          <CalendarX2 size={25} aria-hidden="true" />
          <div>
            <h3>No pudimos consultar los horarios</h3>
            <p>Revisa tu conexión e inténtalo nuevamente.</p>
          </div>
          <FilledButton className="cart-action cart-action--secondary" onClick={onRetry}>Reintentar</FilledButton>
        </div>
      ) : slots.length === 0 ? (
        <div className="cart-availability-empty" role="status">
          <CalendarX2 size={25} aria-hidden="true" />
          <div>
            <h3>Sin horarios disponibles</h3>
            <p>Prueba con otra fecha para ver nuevas opciones.</p>
          </div>
        </div>
      ) : (
        <div className="cart-slots">
          {slots.map((slot) => {
            const selected = selectedSlot?.startTime === slot.startTime
            return (
              <button
                type="button"
                key={`${slot.date}-${slot.startTime}`}
              onClick={() => onSelectSlot(slot)}
              className="cart-slot"
              aria-pressed={selected}
              data-selected={selected}
            >
              <span className="cart-slot__time">{formatTime(slot.startTime)}</span>
              <span className="cart-slot__state">
                {selected ? <Check size={14} aria-hidden="true" /> : <Circle size={13} aria-hidden="true" />}
                {selected ? 'Seleccionado' : 'Disponible'}
              </span>
            </button>
            )
          })}
        </div>
      )}
      <div className="cart-actions">
        <FilledButton className="cart-action cart-action--primary" onClick={onContinue} disabled={!selectedSlot}>Continuar</FilledButton>
      </div>
    </div>
  )
}
