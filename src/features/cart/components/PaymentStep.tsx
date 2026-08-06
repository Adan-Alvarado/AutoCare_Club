import { useMemo } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Banknote, Check, CreditCard } from 'lucide-react'
import { FilledButton } from '../../../components/Buttons'
import type { PaymentIntentDto } from '../../../services/api'
import type { PaymentMethod } from '../cart.types'
import StripePaymentForm from './StripePaymentForm'

interface PaymentStepProps {
  saving: boolean
  method: PaymentMethod
  paymentIntent: PaymentIntentDto | null
  onMethodChange: (method: PaymentMethod) => void
  onConfirm: () => void
  onPaymentSuccess: () => void
}

export default function PaymentStep({ saving, method, paymentIntent, onMethodChange, onConfirm, onPaymentSuccess }: PaymentStepProps) {
  const hasStripeConfig = Boolean(paymentIntent?.publishableKey?.trim())
  const stripePromise = useMemo(
    () => (paymentIntent && hasStripeConfig ? loadStripe(paymentIntent.publishableKey) : null),
    [hasStripeConfig, paymentIntent],
  )

  if (paymentIntent && hasStripeConfig && stripePromise) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gray-100">Completa el pago con tarjeta</h2>
        <p className="mt-1 text-sm text-gray-400">El formulario es procesado de forma segura por Stripe.</p>
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret: paymentIntent.clientSecret,
            appearance: {
              theme: 'night',
              variables: { colorPrimary: '#fcd34d', borderRadius: '10px' },
            },
          }}
        >
          <StripePaymentForm onSuccess={onPaymentSuccess} />
        </Elements>
      </div>
    )
  }

  if (paymentIntent && !hasStripeConfig) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gray-100">Stripe no está disponible</h2>
        <p className="mt-2 text-sm leading-6 text-gray-400">
          El entorno de pago no tiene Stripe configurado. Puedes continuar con la reserva para pagar en el taller.
        </p>
        <div className="mt-6 flex justify-end">
          <FilledButton onClick={onConfirm} disabled={saving}>
            {saving ? 'Confirmando...' : 'Confirmar reserva'}
          </FilledButton>
        </div>
      </div>
    )
  }

  return (
    <div>
      <button type="button" onClick={() => onMethodChange('workshop')} className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left ${method === 'workshop' ? 'border-amber-300 bg-amber-300/10' : 'border-gray-800'}`} aria-pressed={method === 'workshop'}>
        <span className="rounded-lg bg-gray-800 p-3 text-amber-300"><Banknote size={21} /></span>
        <span className="flex-1">
          <strong className="block text-base text-gray-100">Pagar en el taller</strong>
          <span className="text-sm text-gray-400">Realiza el pago cuando lleves tu vehículo.</span>
        </span>
        {method === 'workshop' ? <Check className="text-amber-300" size={21} /> : null}
      </button>
      <button type="button" onClick={() => onMethodChange('card')} className={`mt-3 flex w-full items-center gap-4 rounded-xl border p-4 text-left ${method === 'card' ? 'border-amber-300 bg-amber-300/10' : 'border-gray-800'}`} aria-pressed={method === 'card'}>
        <span className="rounded-lg bg-gray-800 p-3 text-amber-300"><CreditCard size={21} /></span>
        <span className="flex-1">
          <strong className="block text-base text-gray-100">Tarjeta</strong>
          <span className="text-sm text-gray-400">Paga ahora de forma segura con Stripe.</span>
        </span>
        {method === 'card' ? <Check className="text-amber-300" size={21} /> : null}
      </button>
      <div className="mt-6 flex justify-end">
        <FilledButton onClick={onConfirm} disabled={saving}>
          {saving ? 'Preparando...' : method === 'card' ? 'Continuar al pago' : 'Confirmar reserva'}
        </FilledButton>
      </div>
    </div>
  )
}
