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
    <div className="flex min-h-80 flex-col items-center justify-center text-center">
      <CheckCircle2 className="mb-4 text-emerald-400" size={48} />
      <h2 className="text-2xl font-bold text-gray-100">Tu reserva quedó registrada</h2>
      <p className="mt-2 max-w-md text-sm text-gray-400">Te esperamos el {formatDate(date)} a las {formatTime(startTime)}.</p>
      <p className="mt-4 text-xs text-gray-500">Orden: {orderId}</p>
      <FilledButton className="mt-6" onClick={onFinish}>Finalizar</FilledButton>
    </div>
  )
}
