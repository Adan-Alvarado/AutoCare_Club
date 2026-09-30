import { CarFront, Check, Circle } from 'lucide-react'
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
    <div>
      {/* Explica el estado de cada opción para que la selección no dependa solo del color. */}
      <div className="cart-step-intro">
        <h2>Elige el vehículo para esta reserva</h2>
        <p>Todos los vehículos mostrados están activos y disponibles para atenderse.</p>
      </div>
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
              data-selected={selected}
            >
              <span className="cart-choice__icon"><CarFront size={21} /></span>
              <span className="cart-choice__content">
                <strong className="cart-choice__title">{vehicle.brand} · {vehicle.year}</strong>
                <span className="cart-choice__meta">{vehicle.vehicleType} · {vehicle.licensePlate}</span>
              </span>
              <span className="cart-choice__state">
                {selected ? <Check size={17} aria-hidden="true" /> : <Circle size={15} aria-hidden="true" />}
                {selected ? 'Seleccionado' : 'Disponible'}
              </span>
            </button>
          )
        })}
      </div>
      <div className="cart-actions">
        <FilledButton className="cart-action cart-action--primary" onClick={onContinue} disabled={!selectedVehicleId}>Continuar</FilledButton>
      </div>
    </div>
  )
}
