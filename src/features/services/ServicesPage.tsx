import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addCartItem, getServices } from '../../services/api'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'
import type { ServiceItem } from '../../services/api'
import { FilledButton } from '../../components/Buttons'
import { Plus, Sparkles, ShieldCheck, Clock3, Wrench } from 'lucide-react'
import { queryKeys } from '../../services/queryKeys'
import { formatMoney } from '../cart/cart.utils'

const heroHighlights = [
  { label: 'Diagnóstico claro', icon: ShieldCheck },
  { label: 'Tiempo estimado real', icon: Clock3 },
  { label: 'Atención premium', icon: Sparkles },
]

export default function ServicesPage() {
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const queryClient = useQueryClient()
  const servicesQuery = useQuery({ queryKey: queryKeys.services, queryFn: getServices })
  const addCartMutation = useMutation({
    mutationFn: async (service: ServiceItem) => addCartItem(service.id, 1),
  })
  const services = servicesQuery.data ?? []
  const loading = servicesQuery.isLoading
  const addingServiceId = addCartMutation.isPending ? addCartMutation.variables?.id ?? null : null

  async function addServiceToCart(service: ServiceItem) {
    setError('')
    setFeedback('')

    try {
      await addCartMutation.mutateAsync(service)
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart })
      setFeedback(`${service.name} agregado al carrito.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo agregar el servicio')
    }
  }

  return (
    <main className="pb-24">
      <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#0b0d0f] shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(179,151,82,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(114,141,136,0.16),transparent_34%)]" />
        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div className="flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200">
                <Sparkles size={14} />
                Atelier de mantenimiento
              </div>

              <div className="space-y-3">
                <h1 className="max-w-2xl text-4xl font-semibold leading-[0.95] text-white sm:text-5xl lg:text-6xl">
                  Reserva cada servicio con la misma precisión que trabajamos.
                </h1>
                <p className="max-w-xl text-sm leading-7 text-gray-300 sm:text-base">
                  Una experiencia más clara para descubrir opciones, entender tiempos y dejar tu vehículo en manos de un equipo que prioriza el detalle.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void servicesQuery.refetch()}
                disabled={servicesQuery.isFetching}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-gray-200 transition hover:bg-white/10"
              >
                {servicesQuery.isFetching ? 'Actualizando...' : 'Actualizar catálogo'}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {heroHighlights.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-gray-300">
                    <Icon size={15} className="text-amber-300" />
                    {item.label}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/30 p-5 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-gray-400">Próxima disponibilidad</p>
                <p className="mt-2 text-2xl font-semibold text-white">Atención en horario corto</p>
              </div>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-300">
                Hoy
              </span>
            </div>

            <div className="mt-5 rounded-[20px] border border-white/10 bg-[#0d1113] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-300">
                  <Wrench size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Mantenimiento preventivo</p>
                  <p className="text-sm text-gray-400">Ideal para revisar filtros, frenos y fluidos.</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">Duración</p>
                  <p className="mt-1 text-lg font-semibold text-white">90 min</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">Incluye</p>
                  <p className="mt-1 text-lg font-semibold text-white">Informe visual</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">Catálogo</p>
            <h2 className="text-2xl font-semibold text-white">Servicios destacados</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-gray-400">
            Elige un servicio y avanza a la siguiente etapa sin perder contexto ni claridad.
          </p>
        </div>

        {feedback ? (
          <p className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300" role="status">
            {feedback}
          </p>
        ) : null}

        {loading ? (
          <Loading />
        ) : error || servicesQuery.error ? (
          <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error || (servicesQuery.error instanceof Error ? servicesQuery.error.message : 'No se pudieron cargar los servicios')}
          </div>
        ) : services.length === 0 ? (
          <EmptyState message="No hay servicios disponibles." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <article key={service.id} className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0b0d0f] shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
                <div
                  className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
                  style={{ backgroundImage: service.imageUrl ? `url(${service.imageUrl})` : 'linear-gradient(135deg, rgba(179,151,82,0.26), rgba(3,4,5,0.9))' }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,4,5,0.40)_0%,rgba(3,4,5,0.7)_70%,rgba(3,4,5,0.95)_100%)]" />

                <div className="relative flex h-full min-h-[320px] flex-col justify-between p-5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-gray-300">
                      {service.durationMinutes} min
                    </span>
                    <span className="text-sm font-semibold text-amber-300">{formatMoney(service.price)}</span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold text-white">{service.name}</h3>
                    <p className="mt-3 text-sm leading-7 text-gray-300">{service.description}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Clock3 size={15} className="text-amber-300" />
                      <span>Reserva rápida</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FilledButton
                        onClick={() => void addServiceToCart(service)}
                        disabled={addingServiceId === service.id}
                        className="rounded-full px-3 py-2"
                      >
                        <span className="flex items-center gap-2">
                          <Plus size={16} />
                          {addingServiceId === service.id ? 'Agregando...' : 'Reservar'}
                        </span>
                      </FilledButton>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
