import { Check, CreditCard } from 'lucide-react'
import { FilledButton } from '../../../components/Buttons'

interface PaymentStepProps {
  saving: boolean
  onConfirm: () => void
}

export default function PaymentStep({ saving, onConfirm }: PaymentStepProps) {
  return (
    <div>
      <button type="button" className="flex w-full items-center gap-4 rounded-xl border border-amber-300 bg-amber-300/10 p-4 text-left" aria-pressed="true">
        <span className="rounded-lg bg-gray-800 p-3 text-amber-300"><CreditCard size={21} /></span>
        <span className="flex-1">
          <strong className="block text-base text-gray-100">Pagar en el taller</strong>
          <span className="text-sm text-gray-400">Realiza el pago cuando lleves tu vehículo.</span>
        </span>
        <Check className="text-amber-300" size={21} />
      </button>
      <div className="mt-3 flex w-full items-center gap-4 rounded-xl border border-gray-900 p-4 opacity-45" aria-disabled="true">
        <span className="rounded-lg bg-gray-900 p-3 text-gray-500"><CreditCard size={21} /></span>
        <span>
          <strong className="block text-base text-gray-400">Tarjeta</strong>
          <span className="text-sm text-gray-500">Disponible próximamente.</span>
        </span>
      </div>
      <div className="mt-6 flex justify-end">
        <FilledButton onClick={onConfirm} disabled={saving}>
          {saving ? 'Confirmando...' : 'Confirmar reserva'}
        </FilledButton>
      </div>
    </div>
  )
}
