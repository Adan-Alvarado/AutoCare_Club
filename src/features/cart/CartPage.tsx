import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import Loading from '../../components/Loading'
import {
  checkoutCart,
  createAppointment,
  createPaymentIntent,
  deleteCartItem,
  getAvailableSchedules,
  getCart,
  getServices,
  getVehicles,
  updateCartItem,
  type OrderDto,
  type PaymentIntentDto,
  type ScheduleAvailabilityDto,
  type ServiceItem,
  type VehicleDto,
} from '../../services/api'
import { stepTitles, type CheckoutStep, type PaymentMethod } from './cart.types'
import { localDate } from './cart.utils'
import CartItemsStep from './components/CartItemsStep'
import CartModal from './components/CartModal'
import ConfirmationStep from './components/ConfirmationStep'
import OrderSummary from './components/OrderSummary'
import PaymentStep from './components/PaymentStep'
import ScheduleStep from './components/ScheduleStep'
import VehicleStep from './components/VehicleStep'

export default function CartPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<CheckoutStep>('cart')
  const [cart, setCart] = useState<OrderDto | null>(null)
  const [catalog, setCatalog] = useState<ServiceItem[]>([])
  const [vehicles, setVehicles] = useState<VehicleDto[]>([])
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [selectedDate, setSelectedDate] = useState(localDate(1))
  const [selectedSlot, setSelectedSlot] = useState<ScheduleAvailabilityDto | null>(null)
  const [slots, setSlots] = useState<ScheduleAvailabilityDto[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [completedOrder, setCompletedOrder] = useState<OrderDto | null>(null)
  const [pendingOrder, setPendingOrder] = useState<OrderDto | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('workshop')
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntentDto | null>(null)

  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleId)
  const displayCart = completedOrder ?? pendingOrder ?? cart

  const totalMinutes = useMemo(() => {
    if (!cart) return 0
    return cart.items.reduce((total, item) => {
      const service = catalog.find((entry) => entry.id === item.serviceId)
      return total + (service?.durationMinutes ?? 0) * item.quantity
    }, 0)
  }, [cart, catalog])

  async function changeQuantity(itemId: string, quantity: number) {
    if (quantity < 1 || quantity > 10) return
    setSaving(true)
    setError('')

    try {
      setCart(await updateCartItem(itemId, quantity))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el carrito')
    } finally {
      setSaving(false)
    }
  }

  async function removeItem(itemId: string) {
    setSaving(true)
    setError('')

    try {
      await deleteCartItem(itemId)
      setCart(await getCart())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el servicio')
    } finally {
      setSaving(false)
    }
  }

  async function clearCart() {
    if (!cart) return
    setSaving(true)
    setError('')

    try {
      for (const item of cart.items) {
        await deleteCartItem(item.id)
      }
      setCart(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo vaciar el carrito')
    } finally {
      setSaving(false)
    }
  }

  async function continueFromCart() {
    setLoading(true)
    setError('')

    try {
      const data = await getVehicles()
      setVehicles(data.filter((vehicle) => vehicle.isActive))
      setStep('vehicle')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar tus vehículos')
    } finally {
      setLoading(false)
    }
  }

  async function loadSchedules(date: string) {
    const serviceId = cart?.items[0]?.serviceId
    if (!serviceId || !date) return

    setLoadingSlots(true)
    setSelectedSlot(null)
    setError('')

    try {
      setSlots(await getAvailableSchedules(serviceId, date))
    } catch (err) {
      setSlots([])
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los horarios')
    } finally {
      setLoadingSlots(false)
    }
  }

  function continueToSchedule() {
    setStep('schedule')
    void loadSchedules(selectedDate)
  }

  function changeDate(date: string) {
    setSelectedDate(date)
    void loadSchedules(date)
  }

  async function prepareOrder() {
    if (pendingOrder) return pendingOrder
    const serviceId = cart?.items[0]?.serviceId
    if (!cart || !serviceId || !selectedVehicleId || !selectedSlot) return null

    const appointment = await createAppointment({
      vehicleId: selectedVehicleId,
      serviceId,
      appointmentDate: selectedDate,
      startTime: selectedSlot.startTime,
      notes: cart.items.length > 1
        ? `Orden con ${cart.items.length} servicios. Horario calculado a partir del servicio principal.`
        : undefined,
    })
    const order = await checkoutCart(selectedVehicleId, appointment.id)
    setPendingOrder(order)
    return order
  }

  async function confirmReservation() {

    setSaving(true)
    setError('')

    try {
      const order = await prepareOrder()
      if (!order) return

      if (paymentMethod === 'card') {
        setPaymentIntent(await createPaymentIntent(order.id))
      } else {
        setCompletedOrder(order)
        setStep('confirmation')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo confirmar la reserva')
    } finally {
      setSaving(false)
    }
  }

  function finishCardPayment() {
    if (pendingOrder) setCompletedOrder(pendingOrder)
    setStep('confirmation')
  }

  function goBack() {
    const previousStep: Partial<Record<CheckoutStep, CheckoutStep>> = {
      vehicle: 'cart',
      schedule: 'vehicle',
      payment: 'schedule',
    }
    const previous = previousStep[step]
    if (previous) setStep(previous)
  }

  useEffect(() => {
    let active = true

    void Promise.all([getCart(), getServices()])
      .then(([cartData, servicesData]) => {
        if (!active) return
        setCart(cartData)
        setCatalog(servicesData)
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'No se pudo cargar el carrito')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <CartModal
      title={stepTitles[step]}
      showBack={step !== 'cart' && step !== 'confirmation' && !pendingOrder}
      error={error}
      onBack={goBack}
      onClose={() => navigate('/services')}
      summary={(
        <OrderSummary
          cart={displayCart}
          vehicle={selectedVehicle}
          date={selectedDate}
          slot={selectedSlot}
          totalMinutes={totalMinutes}
        />
      )}
    >
      {loading ? <Loading /> : null}

      {!loading && step === 'cart' ? (
        <CartItemsStep
          cart={cart}
          saving={saving}
          onBrowseServices={() => navigate('/services')}
          onChangeQuantity={(itemId, quantity) => void changeQuantity(itemId, quantity)}
          onRemove={(itemId) => void removeItem(itemId)}
          onClear={() => void clearCart()}
          onContinue={() => void continueFromCart()}
        />
      ) : null}

      {!loading && step === 'vehicle' ? (
        <VehicleStep
          vehicles={vehicles}
          selectedVehicleId={selectedVehicleId}
          onSelect={setSelectedVehicleId}
          onContinue={continueToSchedule}
          onAddVehicle={() => navigate('/vehicles')}
        />
      ) : null}

      {step === 'schedule' ? (
        <ScheduleStep
          date={selectedDate}
          minimumDate={localDate()}
          slots={slots}
          selectedSlot={selectedSlot}
          loading={loadingSlots}
          onDateChange={changeDate}
          onSelectSlot={setSelectedSlot}
          onContinue={() => setStep('payment')}
        />
      ) : null}

      {step === 'payment' ? (
        <PaymentStep
          saving={saving}
          method={paymentMethod}
          paymentIntent={paymentIntent}
          onMethodChange={setPaymentMethod}
          onConfirm={() => void confirmReservation()}
          onPaymentSuccess={finishCardPayment}
        />
      ) : null}

      {step === 'confirmation' && selectedSlot ? (
        <ConfirmationStep
          date={selectedDate}
          startTime={selectedSlot.startTime}
          orderId={completedOrder?.id}
          onFinish={() => navigate('/services')}
        />
      ) : null}
    </CartModal>
  )
}
