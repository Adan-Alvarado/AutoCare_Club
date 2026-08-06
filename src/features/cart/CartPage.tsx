import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router'
import Loading from '../../components/Loading'
import {
  checkoutCart,
  createAppointment,
  createCheckoutSession,
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
import './cart.css'

interface ReservationData {
  cart: OrderDto
  vehicleId: string
  slot: ScheduleAvailabilityDto
  date: string
}

const checkoutSteps: CheckoutStep[] = ['cart', 'vehicle', 'schedule', 'payment', 'confirmation']

function cartPath(step: CheckoutStep) {
  return step === 'cart' ? '/cart' : `/cart/${step}`
}

export default function CartPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { '*': stepPath = '' } = useParams()
  const queryClient = useQueryClient()
  const routedStep = stepPath || 'cart'
  const step = checkoutSteps.includes(routedStep as CheckoutStep)
    ? routedStep as CheckoutStep
    : null
  const activeStep = step ?? 'cart'
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [selectedDate, setSelectedDate] = useState(localDate(1))
  const [selectedSlot, setSelectedSlot] = useState<ScheduleAvailabilityDto | null>(null)
  const [error, setError] = useState('')
  const [completedOrder, setCompletedOrder] = useState<OrderDto | null>(null)
  const [pendingOrder, setPendingOrder] = useState<OrderDto | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('workshop')
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntentDto | null>(null)
  const returnedFromStripe = Boolean(searchParams.get('session_id') || searchParams.get('order_id'))

  const cartQuery = useQuery({ queryKey: queryKeys.cart, queryFn: getCart })
  const servicesQuery = useQuery({ queryKey: queryKeys.services, queryFn: getServices })
  const vehiclesQuery = useQuery({
    queryKey: queryKeys.vehicles,
    queryFn: getVehicles,
    enabled: activeStep !== 'cart',
  })
  const cart = cartQuery.data ?? null
  const serviceId = cart?.items[0]?.serviceId ?? ''
  const schedulesQuery = useQuery({
    queryKey: queryKeys.schedules(serviceId, selectedDate),
    queryFn: () => getAvailableSchedules(serviceId, selectedDate),
    enabled: activeStep === 'schedule' && Boolean(serviceId && selectedDate),
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
          ? `Orden con ${currentCart.items.length} servicios. Horario calculated a partir del servicio principal.`
          : undefined,
      })
      return checkoutCart(vehicleId, appointment.id)
    },
  })
  const paymentIntentMutation = useMutation({ mutationFn: (orderId: string) => createPaymentIntent(orderId) })
  const checkoutSessionMutation = useMutation({ mutationFn: (orderId: string) => createCheckoutSession(orderId) })

  const vehicles = (vehiclesQuery.data ?? []).filter((vehicle) => vehicle.isActive)
  const slots = schedulesQuery.data ?? []
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleId)
  const displayCart = completedOrder ?? pendingOrder ?? cart
  const saving = updateItemMutation.isPending
    || removeItemMutation.isPending
    || clearCartMutation.isPending
    || reservationMutation.isPending
    || paymentIntentMutation.isPending
    || checkoutSessionMutation.isPending
  const loading = cartQuery.isLoading || servicesQuery.isLoading || (activeStep === 'vehicle' && vehiclesQuery.isLoading)
  const queryError = [cartQuery.error, servicesQuery.error, vehiclesQuery.error, schedulesQuery.error]
    .find((value) => value instanceof Error)

  useEffect(() => {
    if (!step || loading) return

    if (returnedFromStripe) {
      if (activeStep !== 'confirmation') {
        navigate(cartPath('confirmation'), { replace: true })
      }
      return
    }

    const hasValidCart = Boolean(cart && cart.items.length === 1 && cart.items[0].quantity >= 1)
    let requiredStep: CheckoutStep | null = null

    if (activeStep !== 'cart' && !hasValidCart) {
      requiredStep = 'cart'
    } else if (['schedule', 'payment', 'confirmation'].includes(activeStep) && !selectedVehicleId) {
      requiredStep = 'vehicle'
    } else if (['payment', 'confirmation'].includes(activeStep) && !selectedSlot) {
      requiredStep = 'schedule'
    } else if (activeStep === 'confirmation' && !completedOrder) {
      requiredStep = 'payment'
    }

    if (requiredStep) navigate(cartPath(requiredStep), { replace: true })
  }, [activeStep, cart, completedOrder, loading, navigate, returnedFromStripe, selectedSlot, selectedVehicleId, step])

  const totalMinutes = useMemo(() => {
    const currentCart = cartQuery.data
    const catalog = servicesQuery.data ?? []
    if (!currentCart) return 0
    return currentCart.items.reduce((total, item) => {
      const service = catalog.find((entry) => entry.id === item.serviceId)
      return total + (service?.durationMinutes ?? 0) * item.quantity
    }, 0)
  }, [cartQuery.data, servicesQuery.data])

  const serviceImages = useMemo(
    () => new Map((servicesQuery.data ?? []).map((service) => [service.id, service.imageUrl ?? null])),
    [servicesQuery.data],
  )

  async function changeQuantity(itemId: string, quantity: number) {
    if (quantity < 1) return
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
    if (!cart || cart.items.length !== 1 || cart.items[0].quantity < 1) {
      setError('Para continuar, deja un solo servicio en el carrito y ajusta su cantidad si lo necesitas.')
      return
    }
    navigate(cartPath('vehicle'))
  }

  function continueToSchedule() {
    setSelectedSlot(null)
    navigate(cartPath('schedule'))
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
        try {
          const session = await checkoutSessionMutation.mutateAsync(order.id)
          if (session.url) {
            window.location.href = session.url
            return
          }
        } catch (e) {
          setPaymentIntent(null)
          setPaymentMethod('workshop')
          setCompletedOrder(order)
          navigate(cartPath('confirmation'))
          setError('Stripe no está disponible en este momento. La reserva se confirmó para pago en el taller.' + (e instanceof Error ? ` (${e.message})` : ''))
          return
        }
      }

      setCompletedOrder(order)
      navigate(cartPath('confirmation'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo confirmar la reserva')
    }
  }

  function finishCardPayment() {
    if (pendingOrder) setCompletedOrder(pendingOrder)
    navigate(cartPath('confirmation'))
  }

  function goBack() {
    const previousStep: Partial<Record<CheckoutStep, CheckoutStep>> = {
      vehicle: 'cart',
      schedule: 'vehicle',
      payment: 'schedule',
    }
    const previous = previousStep[activeStep]
    if (previous) navigate(cartPath(previous), { replace: true })
  }

  if (!step) {
    return <Navigate to="/cart" replace />
  }

  return (
    <CartModal
      title={stepTitles[activeStep]}
      showBack={activeStep !== 'cart' && activeStep !== 'confirmation' && !pendingOrder}
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
          paymentMethod={paymentMethod}
        />
      )}
    >
      {loading ? <Loading /> : null}

      {!loading && activeStep === 'cart' ? (
        <CartItemsStep
          cart={cart}
          serviceImages={serviceImages}
          saving={saving}
          onBrowseServices={() => navigate('/services')}
          onChangeQuantity={(itemId, quantity) => void changeQuantity(itemId, quantity)}
          onRemove={(itemId) => void removeItem(itemId)}
          onClear={() => void clearCart()}
          onContinue={continueFromCart}
        />
      ) : null}

      {!loading && activeStep === 'vehicle' ? (
        <VehicleStep
          vehicles={vehicles}
          selectedVehicleId={selectedVehicleId}
          onSelect={setSelectedVehicleId}
          onContinue={continueToSchedule}
          onAddVehicle={() => navigate('/vehicles')}
        />
      ) : null}

      {activeStep === 'schedule' ? (
        <ScheduleStep
          date={selectedDate}
          minimumDate={localDate()}
          slots={slots}
          selectedSlot={selectedSlot}
          loading={schedulesQuery.isLoading || schedulesQuery.isFetching}
          onDateChange={changeDate}
          onSelectSlot={setSelectedSlot}
          onContinue={() => navigate(cartPath('payment'))}
        />
      ) : null}

      {activeStep === 'payment' ? (
        <PaymentStep
          saving={saving}
          method={paymentMethod}
          paymentIntent={paymentIntent}
          onMethodChange={setPaymentMethod}
          onConfirm={() => void confirmReservation()}
          onPaymentSuccess={finishCardPayment}
        />
      ) : null}

      {activeStep === 'confirmation' && selectedSlot ? (
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
