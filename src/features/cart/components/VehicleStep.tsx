import { CarFront, Check } from 'lucide-react'
import { FilledButton } from '../../../components/Buttons'
import type { VehicleDto } from '../../../services/api'

interface VehicleStepProps {
  vehicles: VehicleDto[]
  selectedVehicleId: string
  onSelect: (vehicleId: string) => void
  onContinue: () => void
  onAddVehicle: () => void
}

export default function VehicleStep({
  vehicles,
  selectedVehicleId,
  onSelect,
  onContinue,
  onAddVehicle,
}: VehicleStepProps) {
  if (vehicles.length === 0) {
    return (
      <div className="rounded-xl border border-gray-800 p-6 text-center">
        <CarFront className="mx-auto mb-3 text-gray-500" size={32} />
        <h2 className="text-lg font-bold">No tienes vehículos registrados</h2>
        <p className="mt-2 text-sm text-gray-400">Agrega uno antes de continuar con la reserva.</p>
        <FilledButton className="mt-5" onClick={onAddVehicle}>Agregar vehículo</FilledButton>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {vehicles.map((vehicle) => {
        const selected = vehicle.id === selectedVehicleId
        return (
          <button
            type="button"
            key={vehicle.id}
            onClick={() => onSelect(vehicle.id)}
            className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors ${selected ? 'border-amber-300 bg-amber-300/10' : 'border-gray-800 bg-gray-900/40 hover:border-gray-700'}`}
            aria-pressed={selected}
          >
            <span className="rounded-lg bg-gray-800 p-3 text-gray-300"><CarFront size={21} /></span>
            <span className="flex-1">
              <strong className="block text-base text-gray-100">{vehicle.brand} · {vehicle.year}</strong>
              <span className="text-sm text-gray-400">{vehicle.vehicleType} · {vehicle.licensePlate}</span>
            </span>
            {selected ? <Check className="text-amber-300" size={21} /> : null}
          </button>
        )
      })}
      <div className="flex justify-end pt-3">
        <FilledButton onClick={onContinue} disabled={!selectedVehicleId}>Continuar</FilledButton>
      </div>
    </div>
  )
}
