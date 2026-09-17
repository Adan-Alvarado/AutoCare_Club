import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDownUp, Clock3, ImageOff, Plus, Search } from 'lucide-react'
import { addCartItem, getServices, type ServiceItem } from '../../services/api'
import EmptyState from '../../components/EmptyState'
import { FilledButton } from '../../components/Buttons'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'
import { Skeleton } from '../../components/ui/skeleton'
import { queryKeys } from '../../services/queryKeys'
import { formatMoney } from '../cart/cart.utils'

type ServiceSort = 'name' | 'price-asc' | 'price-desc' | 'duration-asc' | 'duration-desc'

function orderServices(services: ServiceItem[], sort: ServiceSort) {
  // La copia evita alterar la respuesta guardada por React Query al ordenar localmente.
  return [...services].sort((first, second) => {
    if (sort === 'price-asc') return first.price - second.price
    if (sort === 'price-desc') return second.price - first.price
    if (sort === 'duration-asc') return first.durationMinutes - second.durationMinutes
    if (sort === 'duration-desc') return second.durationMinutes - first.durationMinutes
    return first.name.localeCompare(second.name, 'es')
  })
}

export default function ServicesPage() {
  // Estado local del catálogo: búsqueda, orden y errores de imágenes que no deben romper la tarjeta.
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<ServiceSort>('name')
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [failedImageUrls, setFailedImageUrls] = useState<Set<string>>(() => new Set())
  const queryClient = useQueryClient()
  const servicesQuery = useQuery({ queryKey: queryKeys.services, queryFn: getServices })
  const addCartMutation = useMutation({
    mutationFn: async (service: ServiceItem) => addCartItem(service.id, 1),
  })
  const services = servicesQuery.data ?? []
  const normalizedSearch = search.trim().toLocaleLowerCase('es')
  const visibleServices = orderServices(
    services.filter((service) => service.name.toLocaleLowerCase('es').includes(normalizedSearch)),
    sort,
  )
  const addingServiceId = addCartMutation.isPending ? addCartMutation.variables?.id ?? null : null

  async function addServiceToCart(service: ServiceItem) {
    // Al cambiar el carrito se invalida su caché para sincronizar el contador y checkout.
    setError('')
    setFeedback('')

    try {
      await addCartMutation.mutateAsync(service)
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart })
      setFeedback(`${service.name} agregado al carrito.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo agregar el servicio.')
    }
  }

  function markImageAsUnavailable(imageUrl: string) {
    // Una URL que falló deja de solicitarse durante esta visita y muestra un fallback estable.
    setFailedImageUrls((current) => new Set(current).add(imageUrl))
  }

  return (
    <main className="pb-24">
      {/* Cabecera compacta: sitúa búsqueda, orden y la acción de reserva antes del listado. */}
      <section className="rounded-2xl border border-white/10 bg-[#0b0d0f] p-5 shadow-[0_14px_42px_rgba(0,0,0,0.22)] sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-[-0.025em] text-white sm:text-4xl">Servicios para tu vehículo</h1>
            <p className="mt-3 text-sm leading-6 text-gray-300 sm:text-base">
              Busca por nombre, compara precio y duración, y agrega el servicio que deseas reservar.
            </p>
          </div>

          {/* Controles nativos: conservan navegación por teclado y no dependen de datos no disponibles. */}
          <div className="grid gap-3 sm:grid-cols-[minmax(17rem,1fr)_13rem] lg:w-[34rem]">
            <label className="relative block">
              <span className="sr-only">Buscar servicio por nombre</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} aria-hidden="true" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar servicio" className="pl-10" type="search" />
            </label>
            <label className="relative block">
              <span className="sr-only">Ordenar servicios</span>
              <ArrowDownUp className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400" size={16} aria-hidden="true" />
              <Select value={sort} onChange={(event) => setSort(event.target.value as ServiceSort)} className="pl-9">
                <option value="name">Nombre</option>
                <option value="price-asc">Menor precio</option>
                <option value="price-desc">Mayor precio</option>
                <option value="duration-asc">Menor duración</option>
                <option value="duration-desc">Mayor duración</option>
              </Select>
            </label>
          </div>
        </div>
      </section>

      <section className="mt-7" aria-labelledby="catalog-title">
        {/* Contexto del resultado: confirma el efecto de búsqueda y orden sin ocupar la cabecera. */}
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="catalog-title" className="text-2xl font-semibold tracking-[-0.02em] text-white">Catálogo de servicios</h2>
            <p className="mt-1 text-sm text-gray-400" aria-live="polite">
              {servicesQuery.isLoading ? 'Cargando servicios…' : `${visibleServices.length} ${visibleServices.length === 1 ? 'servicio disponible' : 'servicios disponibles'}`}
            </p>
          </div>
          {search ? <button type="button" onClick={() => setSearch('')} className="text-sm font-semibold text-amber-300 underline decoration-amber-300/40 underline-offset-4 hover:text-amber-200">Limpiar búsqueda</button> : null}
        </div>

        {/* Feedback de reserva: el estado se anuncia sin desplazar el catálogo. */}
        {feedback ? <p className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200" role="status">{feedback}</p> : null}

        {servicesQuery.isLoading ? <CatalogSkeleton /> : error || servicesQuery.error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            {error || (servicesQuery.error instanceof Error ? servicesQuery.error.message : 'No se pudieron cargar los servicios.')}
          </div>
        ) : services.length === 0 ? <EmptyState message="No hay servicios disponibles." /> : visibleServices.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
            <p className="text-base font-semibold text-white">No encontramos ese servicio.</p>
            <p className="mt-2 text-sm text-gray-400">Prueba con otra palabra o restaura la búsqueda.</p>
            <FilledButton onClick={() => setSearch('')} className="mt-4">Ver todos los servicios</FilledButton>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleServices.map((service, index) => {
              const hasImage = Boolean(service.imageUrl) && !failedImageUrls.has(service.imageUrl ?? '')

              return (
                <article key={service.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d0f] shadow-[0_12px_34px_rgba(0,0,0,0.22)]">
                  {/* Medio con proporción fija: la imagen no modifica el alto de la tarjeta al cargar. */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#15191b]">
                    {hasImage ? <img src={service.imageUrl ?? undefined} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" loading={index < 3 ? 'eager' : 'lazy'} onError={() => markImageAsUnavailable(service.imageUrl ?? '')} /> : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 bg-[linear-gradient(135deg,rgba(179,151,82,0.16),rgba(11,13,15,0.98))] text-gray-400">
                        <ImageOff size={28} aria-hidden="true" />
                        <span className="text-sm">Imagen no disponible</span>
                      </div>
                    )}
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
                      <Clock3 size={15} className="text-amber-300" aria-hidden="true" />
                      {service.durationMinutes} min
                    </span>
                  </div>

                  {/* Información y siguiente acción: precio, detalle y reserva se leen en ese orden. */}
                  <div className="flex min-h-[12.5rem] flex-col p-5">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xl font-semibold tracking-[-0.015em] text-white">{service.name}</h3>
                      <strong className="shrink-0 text-base text-amber-300">{formatMoney(service.price)}</strong>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-gray-300">{service.description}</p>
                    <FilledButton onClick={() => void addServiceToCart(service)} disabled={addingServiceId === service.id} className="mt-auto w-full">
                      <Plus size={17} aria-hidden="true" />
                      {addingServiceId === service.id ? 'Agregando…' : 'Agregar y reservar'}
                    </FilledButton>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

function CatalogSkeleton() {
  // Placeholder con la misma estructura final para evitar saltos de layout durante la consulta.
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Cargando catálogo">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d0f] p-4">
          <Skeleton className="aspect-[4/3]" />
          <Skeleton className="mt-5 h-6 w-3/4" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <Skeleton className="mt-5 h-11 w-full" />
        </div>
      ))}
    </div>
  )
}
