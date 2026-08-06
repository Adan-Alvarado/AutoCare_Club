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
  const stripeAccent = getComputedStyle(document.documentElement).getPropertyValue('--ac-brass-stripe').trim()
  const stripePromise = useMemo(
    () => (paymentIntent && hasStripeConfig ? loadStripe(paymentIntent.publishableKey) : null),
    [hasStripeConfig, paymentIntent],
  )

  if (paymentIntent && hasStripeConfig && stripePromise) {
    return (
      <div>
        <h2 className="cart-payment-title">Completa el pago con tarjeta</h2>
        <p className="cart-payment-copy">El formulario es procesado de forma segura por Stripe.</p>
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret: paymentIntent.clientSecret,
            appearance: {
              theme: 'night',
              variables: { colorPrimary: stripeAccent, borderRadius: '10px' },
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
        <h2 className="cart-payment-title">Stripe no está disponible</h2>
        <p className="cart-payment-copy">
          El entorno de pago no tiene Stripe configurado. Puedes continuar con la reserva para pagar en el taller.
        </p>
        <div className="cart-actions">
          <FilledButton className="cart-action cart-action--primary" onClick={onConfirm} disabled={saving}>
            {saving ? 'Confirmando...' : 'Confirmar reserva'}
          </FilledButton>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-choice-list">
      <button type="button" onClick={() => onMethodChange('workshop')} className="cart-choice" aria-pressed={method === 'workshop'}>
        <span className="cart-choice__icon"><Banknote size={21} /></span>
        <span className="cart-choice__content">
          <strong className="cart-choice__title">Pagar en el taller</strong>
          <span className="cart-choice__meta">Realiza el pago cuando lleves tu vehículo.</span>
        </span>
        {method === 'workshop' ? <Check size={21} /> : null}
      </button>
      <button type="button" onClick={() => onMethodChange('card')} className="cart-choice" aria-pressed={method === 'card'}>
        <span className="cart-choice__icon"><CreditCard size={21} /></span>
        <span className="cart-choice__content">
          <strong className="cart-choice__title">Tarjeta</strong>
          <span className="cart-choice__meta">Paga ahora de forma segura con Stripe.</span>
        </span>
        {method === 'card' ? <Check size={21} /> : null}
      </button>
      <div className="cart-actions">
        <FilledButton className="cart-action cart-action--primary" onClick={onConfirm} disabled={saving}>
          {saving ? 'Preparando...' : method === 'card' ? 'Continuar al pago' : 'Confirmar reserva'}
        </FilledButton>
      </div>
    </div>
  )
}
