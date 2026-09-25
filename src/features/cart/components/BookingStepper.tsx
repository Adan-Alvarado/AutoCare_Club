import { Check } from 'lucide-react'
import type { CheckoutStep } from '../cart.types'

interface BookingStepperProps {
  activeStep: CheckoutStep
}

const steps: Array<{ key: CheckoutStep; label: string }> = [
  { key: 'cart', label: 'Servicios' },
  { key: 'vehicle', label: 'Vehículo' },
  { key: 'schedule', label: 'Horario' },
  { key: 'payment', label: 'Pago' },
  { key: 'confirmation', label: 'Listo' },
]

// Expone el avance sin convertir los pasos futuros en enlaces que puedan saltar validaciones.
export default function BookingStepper({ activeStep }: BookingStepperProps) {
  const activeIndex = steps.findIndex((step) => step.key === activeStep)

  return (
    <nav className="booking-stepper" aria-label="Progreso de la reserva">
      <ol className="booking-stepper__list">
        {steps.map((step, index) => {
          const status = index < activeIndex ? 'complete' : index === activeIndex ? 'current' : 'upcoming'
          return (
            <li key={step.key} className="booking-stepper__item" data-status={status}>
              <span className="booking-stepper__indicator" aria-hidden="true">
                {status === 'complete' ? <Check size={14} strokeWidth={3} /> : index + 1}
              </span>
              <span className="booking-stepper__label" aria-current={status === 'current' ? 'step' : undefined}>
                {step.label}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
