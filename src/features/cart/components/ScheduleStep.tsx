import { Clock3 } from 'lucide-react'
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
  onDateChange: (date: string) => void
  onSelectSlot: (slot: ScheduleAvailabilityDto) => void
  onContinue: () => void
}

export default function ScheduleStep({
  date,
  minimumDate,
  slots,
  selectedSlot,
  loading,
  onDateChange,
  onSelectSlot,
  onContinue,
}: ScheduleStepProps) {
  return (
    <div>
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
      {loading ? <Loading /> : slots.length === 0 ? (
        <p className="cart-warning">No hay horarios disponibles para esta fecha. Prueba con otro día.</p>
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
              >
                {formatTime(slot.startTime)}
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
