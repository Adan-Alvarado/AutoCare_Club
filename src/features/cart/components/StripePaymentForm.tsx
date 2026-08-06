import { useState, type FormEvent } from 'react'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { FilledButton } from '../../../components/Buttons'

interface StripePaymentFormProps {
  onSuccess: () => void
}

export default function StripePaymentForm({ onSuccess }: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)
    setError('')

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/cart/confirmation` },
      redirect: 'if_required',
    })

    if (result.error) {
      setError(result.error.message ?? 'No se pudo procesar el pago. Revisa los datos de la tarjeta.')
      setSubmitting(false)
      return
    }

    if (result.paymentIntent?.status === 'succeeded' || result.paymentIntent?.status === 'processing') {
      onSuccess()
      return
    }

    setError('El pago necesita una acción adicional. Intenta nuevamente.')
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5">
      <PaymentElement />
      {error ? <p className="mt-4 rounded-xl border border-red-900 bg-red-950/60 px-4 py-3 text-sm text-red-200" role="alert">{error}</p> : null}
      <div className="mt-6 flex justify-end">
        <FilledButton type="submit" disabled={!stripe || submitting}>{submitting ? 'Procesando pago...' : 'Pagar y confirmar'}</FilledButton>
      </div>
    </form>
  )
}
