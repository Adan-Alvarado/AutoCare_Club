import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createVehicle, deleteVehicle, getVehicles, updateVehicle } from '../../services/api'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'
import type { VehicleDto } from '../../services/api'
import { BorderButton, FilledButton } from '../../components/Buttons'
import { Car, PencilLine, Trash2, CalendarRange } from 'lucide-react'
import { queryKeys } from '../../services/queryKeys'

const initialForm = {
  brand: '',
  year: new Date().getFullYear(),
  licensePlate: '',
  vehicleType: '',
}

export default function VehiclesPage() {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleDto | null>(null)
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const queryClient = useQueryClient()
  const vehiclesQuery = useQuery({ queryKey: queryKeys.vehicles, queryFn: getVehicles })
  const saveVehicleMutation = useMutation({
    mutationFn: ({ id, data }: { id?: string; data: typeof form }) => (
      id ? updateVehicle(id, data) : createVehicle(data)
    ),
  })
  const deleteVehicleMutation = useMutation({ mutationFn: (id: string) => deleteVehicle(id) })
  const vehicles = vehiclesQuery.data ?? []
  const loading = vehiclesQuery.isLoading
  const saving = saveVehicleMutation.isPending || deleteVehicleMutation.isPending

  function startEdit(vehicle: VehicleDto) {
    setSelectedVehicle(vehicle)
    setForm({
      brand: vehicle.brand,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate,
      vehicleType: vehicle.vehicleType,
    })
  }

  function resetForm() {
    setSelectedVehicle(null)
    setForm(initialForm)
    setError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    try {
      await saveVehicleMutation.mutateAsync({ id: selectedVehicle?.id, data: form })
      await queryClient.invalidateQueries({ queryKey: queryKeys.vehicles })
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el vehículo')
    }
  }

  async function handleDelete(id: string) {
    setError('')

    try {
      await deleteVehicleMutation.mutateAsync(id)
      await queryClient.invalidateQueries({ queryKey: queryKeys.vehicles })
      if (selectedVehicle?.id === id) {
        resetForm()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el vehículo')
    }
  }

  return (
    <main className="pb-24">
      <section className="rounded-[30px] border border-white/10 bg-[#0b0d0f] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset] sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">Vehículos</p>
            <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Gestiona tus vehículos</h1>
          </div>
          <p className="max-w-xl text-sm leading-6 text-gray-400">
            Guarda los datos principales de cada auto para agilizar futuras reservas y servicios.
          </p>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-[24px] border border-white/10 bg-black/30 p-5 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-300">
                <Car size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{selectedVehicle ? 'Editar vehículo' : 'Agregar vehículo'}</h2>
                <p className="text-sm text-gray-400">Completa los datos para tenerlos listos al reservar.</p>
              </div>
            </div>

            <form className="mt-5 flex flex-col gap-3" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-1 text-sm text-gray-300">
                Marca
                <input
                  className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2.5 text-gray-100 outline-none transition focus:border-amber-300/40"
                  type="text"
                  value={form.brand}
                  onChange={(event) => setForm({ ...form, brand: event.target.value })}
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-300">
                Año
                <input
                  className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2.5 text-gray-100 outline-none transition focus:border-amber-300/40"
                  type="number"
                  min={1900}
                  max={2100}
                  value={form.year}
                  onChange={(event) => setForm({ ...form, year: Number(event.target.value) })}
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-300">
                Matrícula
                <input
                  className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2.5 text-gray-100 outline-none transition focus:border-amber-300/40"
                  type="text"
                  value={form.licensePlate}
                  onChange={(event) => setForm({ ...form, licensePlate: event.target.value })}
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-300">
                Tipo
                <input
                  className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2.5 text-gray-100 outline-none transition focus:border-amber-300/40"
                  type="text"
                  value={form.vehicleType}
                  onChange={(event) => setForm({ ...form, vehicleType: event.target.value })}
                  required
                />
              </label>

              <div className="mt-2 flex flex-wrap justify-end gap-2">
                <FilledButton type="submit" disabled={saving} className="rounded-full px-4 py-2.5">
                  {saving ? 'Guardando...' : selectedVehicle ? 'Guardar cambios' : 'Crear vehículo'}
                </FilledButton>
                {selectedVehicle ? (
                  <BorderButton type="button" onClick={resetForm} disabled={saving} className="rounded-full px-4 py-2.5">
                    Cancelar
                  </BorderButton>
                ) : null}
              </div>
            </form>

            {error ? <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}
          </article>

          <article className="rounded-[24px] border border-white/10 bg-black/30 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Mis vehículos</h2>
                <p className="text-sm text-gray-400">Tu colección de autos registrada.</p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-gray-300">
                {vehicles.length} {vehicles.length === 1 ? 'vehículo' : 'vehículos'}
              </div>
            </div>

            {loading ? (
              <div className="mt-5 rounded-[20px] border border-white/10 bg-[#0d1113] p-4">
                <Loading />
              </div>
            ) : vehiclesQuery.error ? (
              <p className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {vehiclesQuery.error instanceof Error ? vehiclesQuery.error.message : 'No se pudieron cargar los vehículos'}
              </p>
            ) : vehicles.length === 0 ? (
              <div className="mt-5 rounded-[20px] border border-dashed border-white/10 bg-[#0d1113] p-6">
                <EmptyState message="No hay vehículos registrados." />
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {vehicles.map((vehicle) => (
                  <div className="rounded-[20px] border border-white/10 bg-[#0d1113] p-4" key={vehicle.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-semibold text-white">{vehicle.brand}</p>
                          <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-0.5 text-[11px] uppercase tracking-[0.2em] text-amber-200">
                            {vehicle.vehicleType}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-400">
                          <span className="flex items-center gap-1.5">
                            <CalendarRange size={14} className="text-amber-300" />
                            {vehicle.year}
                          </span>
                          <span className="font-medium text-gray-300">{vehicle.licensePlate}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(vehicle)}
                          className="rounded-full border border-white/10 bg-white/5 p-2 text-gray-200 transition hover:bg-white/10"
                          aria-label={`Editar ${vehicle.brand}`}
                        >
                          <PencilLine size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(vehicle.id)}
                          className="rounded-full border border-red-500/20 bg-red-500/10 p-2 text-red-300 transition hover:bg-red-500/20"
                          aria-label={`Eliminar ${vehicle.brand}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>
      </section>
    </main>
  )
}
