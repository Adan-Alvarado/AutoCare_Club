export type CheckoutStep = 'cart' | 'vehicle' | 'schedule' | 'payment' | 'confirmation'

export const stepTitles: Record<CheckoutStep, string> = {
  cart: 'Tu carrito',
  vehicle: '¿Qué vehículo atenderemos?',
  schedule: 'Selecciona fecha y horario',
  payment: 'Método de pago',
  confirmation: 'Reserva confirmada',
}
