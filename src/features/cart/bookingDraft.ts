import type { ScheduleAvailabilityDto } from '../../services/api'
import type { CheckoutStep } from './cart.types'

// El borrador solo conserva decisiones de la reserva; nunca guarda datos de pago.
const storageKey = 'autocare.booking-draft.v1'
const draftLifetimeMs = 24 * 60 * 60 * 1000

export interface BookingDraft {
  cartSignature: string
  vehicleId: string
  date: string
  slot: ScheduleAvailabilityDto | null
  reservationKey: string
  step: Exclude<CheckoutStep, 'confirmation'>
  expiresAt: number
}

export function createCartSignature(items: Array<{ serviceId: string; quantity: number }>) {
  return items
    .map((item) => `${item.serviceId}:${item.quantity}`)
    .sort()
    .join('|')
}

export function loadBookingDraft(cartSignature: string): BookingDraft | null {
  try {
    const storedValue = window.localStorage.getItem(storageKey)
    if (!storedValue) return null

    const draft = JSON.parse(storedValue) as BookingDraft
    const validSteps: BookingDraft['step'][] = ['cart', 'vehicle', 'schedule', 'payment']
    const isValid = draft
      && typeof draft.vehicleId === 'string'
      && typeof draft.date === 'string'
      && typeof draft.reservationKey === 'string'
      && typeof draft.expiresAt === 'number'
      && typeof draft.cartSignature === 'string'
      && validSteps.includes(draft.step)

    if (!isValid || draft.expiresAt <= Date.now() || draft.cartSignature !== cartSignature) {
      window.localStorage.removeItem(storageKey)
      return null
    }

    return draft
  } catch {
    // localStorage puede no estar disponible por la configuración de privacidad del navegador.
    return null
  }
}

export function saveBookingDraft(draft: Omit<BookingDraft, 'expiresAt'>) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify({
      ...draft,
      expiresAt: Date.now() + draftLifetimeMs,
    }))
  } catch {
    // La reserva continúa funcionando aunque el navegador no permita persistir el borrador.
  }
}

export function clearBookingDraft() {
  try {
    window.localStorage.removeItem(storageKey)
  } catch {
    // No hay una acción adicional si el almacenamiento no está disponible.
  }
}
