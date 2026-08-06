import { CheckCircle2 } from 'lucide-react'
import { FilledButton } from '../../../components/Buttons'
import { formatDate, formatTime } from '../cart.utils'

interface ConfirmationStepProps {
  date: string
  startTime: string
  orderId?: string
  onFinish: () => void
}

export default function ConfirmationStep({
  date,
  startTime,
  orderId,
  onFinish,
}: ConfirmationStepProps) {
  return (
    <div className="cart-confirmation">
      <CheckCircle2 size={48} />
      <h2>Tu reserva quedó registrada</h2>
      <p>Te esperamos el {formatDate(date)} a las {formatTime(startTime)}.</p>
      <p>Orden: {orderId}</p>
      <FilledButton className="cart-action cart-action--primary mt-6" onClick={onFinish}>Finalizar</FilledButton>
    </div>
  )
}
