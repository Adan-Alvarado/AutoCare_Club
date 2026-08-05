import { Clock3 } from 'lucide-react'
import { FilledButton } from '../../../components/Buttons'
import Loading from '../../../components/Loading'
import type { ScheduleAvailabilityDto } from '../../../services/api'
import { formatTime } from '../cart.utils'

const selectedSlotClass = 'border-amber-300 bg-amber-300 text-amber-950'
const availableSlotClass = 'border-gray-800 text-gray-200 hover:border-gray-600'

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
      <label className="mb-6 max-w-xs text-sm font-medium text-gray-300">
        Fecha de la reserva
        <input
          type="date"
          min={minimumDate}
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
          className="mt-2 bg-gray-900 text-gray-100 [color-scheme:dark]"
        />
      </label>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-100">
        <Clock3 size={19} className="text-amber-300" /> Horarios disponibles
      </h2>
      {loading ? <Loading /> : slots.length === 0 ? (
        <p className="rounded-xl border border-gray-800 p-5 text-sm text-gray-400">No hay horarios disponibles para esta fecha. Prueba con otro día.</p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {slots.map((slot) => {
            const selected = selectedSlot?.startTime === slot.startTime
            return (
              <button
                type="button"
                key={`${slot.date}-${slot.startTime}`}
                onClick={() => onSelectSlot(slot)}
                className={`rounded-xl border px-4 py-3 text-sm font-bold ${selected ? selectedSlotClass : availableSlotClass}`}
                aria-pressed={selected}
              >
                {formatTime(slot.startTime)}
              </button>
            )
          })}
        </div>
      )}
      <div className="mt-6 flex justify-end">
        <FilledButton onClick={onContinue} disabled={!selectedSlot}>Continuar</FilledButton>
      </div>
    </div>
  )
}
