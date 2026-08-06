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
      <div className="cart-empty">
        <CarFront size={32} />
        <h2>No tienes vehículos registrados</h2>
        <p>Agrega uno antes de continuar con la reserva.</p>
        <FilledButton className="cart-action cart-action--primary mt-5" onClick={onAddVehicle}>Agregar vehículo</FilledButton>
      </div>
    )
  }

  return (
    <div className="cart-choice-list">
      {vehicles.map((vehicle) => {
        const selected = vehicle.id === selectedVehicleId
        return (
          <button
            type="button"
            key={vehicle.id}
            onClick={() => onSelect(vehicle.id)}
            className="cart-choice"
            aria-pressed={selected}
          >
            <span className="cart-choice__icon"><CarFront size={21} /></span>
            <span className="cart-choice__content">
              <strong className="cart-choice__title">{vehicle.brand} · {vehicle.year}</strong>
              <span className="cart-choice__meta">{vehicle.vehicleType} · {vehicle.licensePlate}</span>
            </span>
            {selected ? <Check size={21} /> : null}
          </button>
        )
      })}
      <div className="cart-actions">
        <FilledButton className="cart-action cart-action--primary" onClick={onContinue} disabled={!selectedVehicleId}>Continuar</FilledButton>
      </div>
    </div>
  )
}
