import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Car, Clock, Wrench } from "lucide-react";
import { BorderButton, FilledButton } from "../../components/Buttons";
import EmptyState from "../../components/EmptyState";
import Loading from "../../components/Loading";
import { ThemedPanel } from "../../components/Panel";
import {
  cancelAppointment,
  getMyAppointments,
  getServices,
  getVehicles,
  type AppointmentStatus,
} from "../../services/api";
import { queryKeys } from "../../services/queryKeys";

const statusLabels: Record<AppointmentStatus, string> = {
  Pending: "Pendiente",
  Confirmed: "Confirmada",
  InProgress: "En proceso",
  Completed: "Completada",
  Cancelled: "Cancelada",
};

const statusClasses: Record<AppointmentStatus, string> = {
  Pending: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  Confirmed: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  InProgress: "border-violet-400/30 bg-violet-400/10 text-violet-200",
  Completed: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  Cancelled: "border-gray-600 bg-gray-800 text-gray-400",
};

function formatDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return new Intl.DateTimeFormat("es-HN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export default function CustomerAppointmentsPage() {
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const queryClient = useQueryClient();
  const appointmentsQuery = useQuery({
    queryKey: queryKeys.customerAppointments,
    queryFn: getMyAppointments,
  });
  const servicesQuery = useQuery({
    queryKey: queryKeys.services,
    queryFn: getServices,
  });
  const vehiclesQuery = useQuery({
    queryKey: queryKeys.vehicles,
    queryFn: getVehicles,
  });
  const cancelMutation = useMutation({ mutationFn: cancelAppointment });

  const appointments = appointmentsQuery.data ?? [];
  const loading =
    appointmentsQuery.isLoading ||
    servicesQuery.isLoading ||
    vehiclesQuery.isLoading;
  const cancellingId = cancelMutation.isPending
    ? cancelMutation.variables
    : null;
  const serviceNames = useMemo(
    () =>
      new Map(
        (servicesQuery.data ?? []).map((service) => [service.id, service.name]),
      ),
    [servicesQuery.data],
  );
  const vehicleNames = useMemo(
    () =>
      new Map(
        (vehiclesQuery.data ?? []).map((vehicle) => [
          vehicle.id,
          `${vehicle.brand} ${vehicle.year} · ${vehicle.licensePlate}`,
        ]),
      ),
    [vehiclesQuery.data],
  );

  async function refreshData() {
    setError("");
    setFeedback("");
    await Promise.all([
      appointmentsQuery.refetch(),
      servicesQuery.refetch(),
      vehiclesQuery.refetch(),
    ]);
  }

  async function handleCancel(id: string) {
    if (!window.confirm("¿Deseas cancelar esta cita?")) return;

    setError("");
    setFeedback("");

    try {
      await cancelMutation.mutateAsync(id);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.customerAppointments,
      });
      setFeedback("La cita fue cancelada correctamente.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo cancelar la cita",
      );
    }
  }

  const queryError =
    appointmentsQuery.error || servicesQuery.error || vehiclesQuery.error;

  return (
    <main className="content-page m-8">
      <div className="page-header flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-amber-300">Citas</p>
          <h1 className="mb-2 text-4xl font-bold text-gray-200">Mis citas</h1>
          <p className="text-gray-400">
            Consulta los servicios que has programado y su estado actual.
          </p>
        </div>
        <FilledButton
          type="button"
          onClick={() => void refreshData()}
          disabled={
            appointmentsQuery.isFetching ||
            servicesQuery.isFetching ||
            vehiclesQuery.isFetching
          }
        >
          Actualizar
        </FilledButton>
      </div>

      {feedback ? (
        <p className="mt-4 text-sm text-emerald-300" role="status">
          {feedback}
        </p>
      ) : null}
      {error || queryError ? (
        <p className="error mt-4" role="alert">
          {error ||
            (queryError instanceof Error
              ? queryError.message
              : "No se pudieron cargar tus citas")}
        </p>
      ) : null}
      {loading ? <Loading /> : null}
      {!loading && !queryError && appointments.length === 0 ? (
        <EmptyState message="Todavía no has creado ninguna cita." />
      ) : null}

      {!loading && appointments.length > 0 ? (
        <section
          className="mt-6 grid gap-4 lg:grid-cols-2"
          aria-label="Citas creadas"
        >
          {appointments.map((appointment) => {
            const canCancel =
              appointment.status !== "Completed" &&
              appointment.status !== "Cancelled";

            return (
              <ThemedPanel
                key={appointment.id}
                className="flex h-full flex-col justify-between gap-5 rounded-2xl"
              >
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="flex items-center gap-2 text-sm text-gray-400">
                        <CalendarDays size={17} aria-hidden="true" />
                        <span className="capitalize">
                          {formatDate(appointment.appointmentDate)}
                        </span>
                      </p>
                      <h2 className="mt-2 text-xl font-bold text-gray-100">
                        {serviceNames.get(appointment.serviceId) ?? "Servicio"}
                      </h2>
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses[appointment.status]}`}
                    >
                      {statusLabels[appointment.status]}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm text-gray-300 sm:grid-cols-2">
                    <p className="flex items-center gap-2">
                      <Clock
                        size={16}
                        className="text-gray-500"
                        aria-hidden="true"
                      />
                      {appointment.startTime.slice(0, 5)} –{" "}
                      {appointment.endTime.slice(0, 5)}
                    </p>
                    <p className="flex items-center gap-2">
                      <Car
                        size={16}
                        className="text-gray-500"
                        aria-hidden="true"
                      />
                      {vehicleNames.get(appointment.vehicleId) ??
                        "Vehículo registrado"}
                    </p>
                    <p className="flex items-center gap-2 sm:col-span-2">
                      <Wrench
                        size={16}
                        className="text-gray-500"
                        aria-hidden="true"
                      />
                      {appointment.technicianId
                        ? "Técnico asignado"
                        : "Técnico pendiente de asignación"}
                    </p>
                  </div>

                  {appointment.notes ? (
                    <div className="mt-4 rounded-xl border border-gray-800 bg-gray-950 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Notas
                      </p>
                      <p className="mt-1 text-sm font-normal text-gray-300">
                        {appointment.notes}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-gray-800 pt-4">
                  <span className="text-xs font-normal text-gray-500">
                    Cita #{appointment.id.slice(0, 8)}
                  </span>
                  {canCancel ? (
                    <BorderButton
                      type="button"
                      onClick={() => void handleCancel(appointment.id)}
                      disabled={cancellingId === appointment.id}
                    >
                      {cancellingId === appointment.id
                        ? "Cancelando..."
                        : "Cancelar cita"}
                    </BorderButton>
                  ) : null}
                </div>
              </ThemedPanel>
            );
          })}
        </section>
      ) : null}
    </main>
  );
}
