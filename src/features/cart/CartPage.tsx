import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
} from '../../services/api'
import { queryKeys } from '../../services/queryKeys'
import { stepTitles, type CheckoutStep, type PaymentMethod } from './cart.types'
import { localDate } from './cart.utils'
import CartItemsStep from './components/CartItemsStep'
import CartModal from './components/CartModal'
import ConfirmationStep from './components/ConfirmationStep'
import OrderSummary from './components/OrderSummary'
import PaymentStep from './components/PaymentStep'
import ScheduleStep from './components/ScheduleStep'
import VehicleStep from './components/VehicleStep'

interface ReservationData {
  cart: OrderDto
  vehicleId: string
  slot: ScheduleAvailabilityDto
  date: string
}

export default function CartPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [step, setStep] = useState<CheckoutStep>('cart')
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [selectedDate, setSelectedDate] = useState(localDate(1))
  const [selectedSlot, setSelectedSlot] = useState<ScheduleAvailabilityDto | null>(null)
  const [error, setError] = useState('')
  const [completedOrder, setCompletedOrder] = useState<OrderDto | null>(null)
  const [pendingOrder, setPendingOrder] = useState<OrderDto | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('workshop')
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntentDto | null>(null)

  const cartQuery = useQuery({ queryKey: queryKeys.cart, queryFn: getCart })
  const servicesQuery = useQuery({ queryKey: queryKeys.services, queryFn: getServices })
  const vehiclesQuery = useQuery({
    queryKey: queryKeys.vehicles,
    queryFn: getVehicles,
    enabled: step !== 'cart',
  })
  const cart = cartQuery.data ?? null
  const serviceId = cart?.items[0]?.serviceId ?? ''
  const schedulesQuery = useQuery({
    queryKey: queryKeys.schedules(serviceId, selectedDate),
    queryFn: () => getAvailableSchedules(serviceId, selectedDate),
    enabled: step === 'schedule' && Boolean(serviceId && selectedDate),
  })

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => updateCartItem(itemId, quantity),
    onSuccess: (updatedCart) => queryClient.setQueryData(queryKeys.cart, updatedCart),
  })
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await deleteCartItem(itemId)
      return getCart()
    },
    onSuccess: (updatedCart) => queryClient.setQueryData(queryKeys.cart, updatedCart),
  })
  const clearCartMutation = useMutation({
    mutationFn: async (order: OrderDto) => {
      for (const item of order.items) await deleteCartItem(item.id)
      return null
    },
    onSuccess: () => queryClient.setQueryData(queryKeys.cart, null),
  })
  const reservationMutation = useMutation({
    mutationFn: async ({ cart: currentCart, vehicleId, slot, date }: ReservationData) => {
      const appointment = await createAppointment({
        vehicleId,
        serviceId: currentCart.items[0].serviceId,
        appointmentDate: date,
        startTime: slot.startTime,
        notes: currentCart.items.length > 1
          ? `Orden con ${currentCart.items.length} servicios. Horario calculado a partir del servicio principal.`
          : undefined,
      })
      return checkoutCart(vehicleId, appointment.id)
    },
  })
  const paymentIntentMutation = useMutation({ mutationFn: (orderId: string) => createPaymentIntent(orderId) })

  const vehicles = (vehiclesQuery.data ?? []).filter((vehicle) => vehicle.isActive)
  const slots = schedulesQuery.data ?? []
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleId)
  const displayCart = completedOrder ?? pendingOrder ?? cart
  const saving = updateItemMutation.isPending
    || removeItemMutation.isPending
    || clearCartMutation.isPending
    || reservationMutation.isPending
    || paymentIntentMutation.isPending
  const loading = cartQuery.isLoading || servicesQuery.isLoading || (step === 'vehicle' && vehiclesQuery.isLoading)
  const queryError = [cartQuery.error, servicesQuery.error, vehiclesQuery.error, schedulesQuery.error]
    .find((value) => value instanceof Error)

  const totalMinutes = useMemo(() => {
    const currentCart = cartQuery.data
    const catalog = servicesQuery.data ?? []
    if (!currentCart) return 0
    return currentCart.items.reduce((total, item) => {
      const service = catalog.find((entry) => entry.id === item.serviceId)
      return total + (service?.durationMinutes ?? 0) * item.quantity
    }, 0)
  }, [cartQuery.data, servicesQuery.data])

  async function changeQuantity(itemId: string, quantity: number) {
    if (quantity < 1 || quantity > 10) return
    setError('')
    try {
      await updateItemMutation.mutateAsync({ itemId, quantity })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el carrito')
    }
  }

  async function removeItem(itemId: string) {
    setError('')
    try {
      await removeItemMutation.mutateAsync(itemId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el servicio')
    }
  }

  async function clearCart() {
    if (!cart) return
    setError('')
    try {
      await clearCartMutation.mutateAsync(cart)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo vaciar el carrito')
    }
  }

  function continueFromCart() {
    setError('')
    setStep('vehicle')
  }

  function continueToSchedule() {
    setSelectedSlot(null)
    setStep('schedule')
  }

  function changeDate(date: string) {
    setSelectedDate(date)
    setSelectedSlot(null)
    setError('')
  }

  async function prepareOrder() {
    if (pendingOrder) return pendingOrder
    if (!cart || !selectedVehicleId || !selectedSlot) return null
    const order = await reservationMutation.mutateAsync({
      cart,
      vehicleId: selectedVehicleId,
      slot: selectedSlot,
      date: selectedDate,
    })
    setPendingOrder(order)
    queryClient.setQueryData(queryKeys.cart, null)
    return order
  }

  async function confirmReservation() {
    setError('')
    try {
      const order = await prepareOrder()
      if (!order) return
      if (paymentMethod === 'card') {
        setPaymentIntent(await paymentIntentMutation.mutateAsync(order.id))
      } else {
        setCompletedOrder(order)
        setStep('confirmation')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo confirmar la reserva')
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

  return (
    <CartModal
      title={stepTitles[step]}
      showBack={step !== 'cart' && step !== 'confirmation' && !pendingOrder}
      error={error || (queryError instanceof Error ? queryError.message : '')}
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
          onContinue={continueFromCart}
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
          loading={schedulesQuery.isLoading || schedulesQuery.isFetching}
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
