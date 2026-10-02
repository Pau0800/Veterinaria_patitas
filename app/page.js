"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AppointmentModal } from "@/components/turnos/AppointmentModal";
import {
  Users,
  Dog,
  CalendarCheck,
  Syringe,
  BedDouble,
  Pill,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  PlusCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

/**
 * Mapa de configuración de estados de turnos para optimizar el renderizado del Badge.
 */
const STATUS_BADGE_CONFIG = {
  confirmado: { variant: "success", label: "Confirmado" },
  solicitado: { variant: "warning", label: "Solicitado" },
  reprogramado: { variant: "default", label: "Reprogramado" },
  cancelado: { variant: "danger", label: "Cancelado" },
};

export default function DashboardPage() {
  const {
    currentRole = "Administrador",
    clients = [],
    pets = [],
    appointments = [],
    vaccines = [],
    hospitalizations = [],
    pharmacy = [],
    activeClientId = null,
    updateAppointmentStatus,
    addAppointment,
  } = useApp();

  const [isApptModalOpen, setIsApptModalOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // MEMOIZACIÓN DE FILTROS Y CÁLCULOS
  // Evita re-ejecutar filtros costosos en cada renderizado si los datos no cambiaron.
  // ---------------------------------------------------------------------------
  const isClientRole = currentRole === "Cliente";

  const filteredPets = useMemo(() => {
    return isClientRole
      ? pets.filter((p) => p.owner_id === activeClientId)
      : pets.filter((p) => p.status === "activo");
  }, [pets, isClientRole, activeClientId]);

  const filteredClients = useMemo(() => {
    return clients.filter((c) => c.status === "activo");
  }, [clients]);

  const filteredAppointments = useMemo(() => {
    return isClientRole
      ? appointments.filter((a) => a.client_id === activeClientId)
      : appointments;
  }, [appointments, isClientRole, activeClientId]);

  const pendingVaccines = useMemo(() => {
    return vaccines.filter((v) => v.status === "pendiente");
  }, [vaccines]);

  const activeHospitalizations = useMemo(() => {
    return hospitalizations.filter((h) => h.status === "activa");
  }, [hospitalizations]);

  const lowStockItems = useMemo(() => {
    return pharmacy.filter((p) => Number(p.stock) <= Number(p.min_stock));
  }, [pharmacy]);

  const upcomingAppointments = useMemo(() => {
    return filteredAppointments.slice(0, 5);
  }, [filteredAppointments]);

  // Renderizado optimizado para los Badges de Estado
  const renderStatusBadge = useCallback((status) => {
    const config = STATUS_BADGE_CONFIG[status] || {
      variant: "default",
      label: status || "Sin Estado",
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }, []);

  // Manejo seguro del envío del modal
  const handleAppointmentSubmit = useCallback(
    async (newAppt) => {
      if (typeof addAppointment === "function") {
        await addAppointment(newAppt);
      }
      setIsApptModalOpen(false);
    },
    [addAppointment]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* BANNER DE BIENVENIDA */}
      <section
        aria-label="Encabezado de Bienvenida"
        className="relative overflow-hidden bg-gradient-to-r from-autumn-700 via-autumn-600 to-amberGold-600 rounded-2xl p-6 lg:p-8 text-white shadow-xl shadow-autumn-900/10 transition-all duration-300"
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase text-autumn-50">
              <Sparkles className="w-3.5 h-3.5 text-amberGold-300" />
              <span>Vista {currentRole}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              ¡Bienvenido a VetOtoño!
            </h1>
            <p className="text-autumn-100/90 text-sm sm:text-base leading-relaxed">
              {isClientRole
                ? "Consulta el estado de salud, próximas vacunas y turnos de tus mascotas en un solo lugar de manera rápida y transparente."
                : "Plataforma de gestión unificada para el control de pacientes, agenda médica, historias clínicas e inventario de farmacia."}
            </p>
          </div>

          <Button
            onClick={() => setIsApptModalOpen(true)}
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto bg-white text-autumn-900 hover:bg-autumn-50 hover:text-autumn-950 shadow-lg hover:shadow-xl transition-all duration-200 font-bold shrink-0 border border-white/20 focus:ring-4 focus:ring-white/30"
          >
            <PlusCircle className="w-5 h-5 text-autumn-600 transition-transform group-hover:scale-110" />
            <span>Solicitar Cita</span>
          </Button>
        </div>
      </section>

      {/* TARJETAS KPI DE ESTADÍSTICAS */}
      <section aria-label="Métricas Principales">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <StatsCard
            title="Total Clientes"
            value={filteredClients.length}
            icon={Users}
            description="Dueños activos registrados"
            variant="primary"
          />
          <StatsCard
            title="Total Mascotas"
            value={filteredPets.length}
            icon={Dog}
            description="Fichas clínicas activas"
            variant="amber"
          />
          <StatsCard
            title="Turnos Agendados"
            value={filteredAppointments.length}
            icon={CalendarCheck}
            description="Citas registradas"
            variant="sage"
          />
          <StatsCard
            title="Vacunas Pendientes"
            value={pendingVaccines.length}
            icon={Syringe}
            description="Próximas a vencer o vencidas"
            variant="amber"
          />
          <StatsCard
            title="Internaciones Activas"
            value={activeHospitalizations.length}
            icon={BedDouble}
            description="Pacientes en observación"
            variant="danger"
          />
          <StatsCard
            title="Stock Bajo Farmacia"
            value={lowStockItems.length}
            icon={Pill}
            description="Medicamentos con stock crítico"
            variant="danger"
          />
        </div>
      </section>

      {/* ALERTAS CRÍTICAS (BAJO STOCK Y VACUNAS) */}
      {(lowStockItems.length > 0 || pendingVaccines.length > 0) && !isClientRole && (
        <section aria-label="Alertas del Sistema" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockItems.length > 0 && (
            <div className="bg-red-50/80 border border-red-200/80 rounded-xl p-4.5 flex items-start space-x-3.5 text-red-950 shadow-sm transition-all hover:shadow-md">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5 animate-pulse" />
              <div className="flex-1 text-xs space-y-1">
                <strong className="font-bold text-sm text-red-900 block">
                  Alerta de Insumos Críticos
                </strong>
                <p className="text-red-800/90 leading-relaxed">
                  Hay <span className="font-semibold">{lowStockItems.length}</span> medicamento(s) que han alcanzado el umbral mínimo
                  {lowStockItems[0]?.name ? ` (ej: ${lowStockItems[0].name})` : ""}.
                </p>
                <Link
                  href="/farmacia"
                  className="inline-flex items-center gap-1 text-red-700 hover:text-red-900 font-bold underline underline-offset-2 mt-1 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
                >
                  <span>Revisar Farmacia</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {pendingVaccines.length > 0 && (
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4.5 flex items-start space-x-3.5 text-amber-950 shadow-sm transition-all hover:shadow-md">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs space-y-1">
                <strong className="font-bold text-sm text-amber-900 block">
                  Recordatorios de Vacunación
                </strong>
                <p className="text-amber-800/90 leading-relaxed">
                  Existe(n) <span className="font-semibold">{pendingVaccines.length}</span> vacuna(s) de mascotas con fecha límite cercana.
                </p>
                <Link
                  href="/vacunas"
                  className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-950 font-bold underline underline-offset-2 mt-1 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 rounded"
                >
                  <span>Ver Vacunas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </section>
      )}

      {/* GRÁFICOS DE ESTADÍSTICAS */}
      {!isClientRole && (
        <section aria-label="Visualización de Datos">
          <DashboardCharts
            appointments={appointments}
            vaccines={vaccines}
            pharmacy={pharmacy}
          />
        </section>
      )}

      {/* TABLA DE TURNOS RECIENTES */}
      <section aria-label="Agenda Próxima">
        <Card className="border border-autumn-200/60 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-autumn-50/50 border-b border-autumn-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
              <CardTitle className="text-lg font-bold text-autumn-950">
                Agenda de Turnos Próximos
              </CardTitle>
              <Link href="/turnos" passHref>
                <Button size="sm" variant="outline" className="border-autumn-300 text-autumn-800 hover:bg-autumn-100/50">
                  <span>Ver Todos los Turnos</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <Thead className="bg-autumn-100/40">
                <Tr>
                  <Th className="text-left font-semibold text-autumn-900">Mascota</Th>
                  <Th className="text-left font-semibold text-autumn-900">Dueño</Th>
                  <Th className="text-left font-semibold text-autumn-900">Veterinario</Th>
                  <Th className="text-left font-semibold text-autumn-900">Fecha y Hora</Th>
                  <Th className="text-left font-semibold text-autumn-900">Motivo</Th>
                  <Th className="text-left font-semibold text-autumn-900">Estado</Th>
                  {!isClientRole && <Th className="text-right font-semibold text-autumn-900">Acciones</Th>}
                </Tr>
              </Thead>
              <Tbody className="divide-y divide-autumn-100/60">
                {upcomingAppointments.length === 0 ? (
                  <Tr>
                    <Td colSpan={!isClientRole ? 7 : 6} className="text-center py-10 text-autumn-800/70">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <CalendarCheck className="w-8 h-8 text-autumn-400 stroke-1" />
                        <p className="text-sm font-medium">No hay turnos agendados por el momento.</p>
                      </div>
                    </Td>
                  </Tr>
                ) : (
                  upcomingAppointments.map((appt) => (
                    <Tr key={appt.id} className="hover:bg-autumn-50/60 transition-colors">
                      <Td className="font-bold text-autumn-950">{appt.pet_name || "—"}</Td>
                      <Td className="text-autumn-800">{appt.client_name || "—"}</Td>
                      <Td className="text-autumn-800">{appt.vet_name || "—"}</Td>
                      <Td>
                        <div className="text-xs space-y-0.5">
                          <span className="font-semibold text-autumn-900 block">
                            {appt.appointment_date ? formatDate(appt.appointment_date) : "Sin fecha"}
                          </span>
                          <span className="text-autumn-600 font-mono">
                            {appt.appointment_time ? `${appt.appointment_time} hs` : "—"}
                          </span>
                        </div>
                      </Td>
                      <Td className="max-w-xs truncate text-autumn-700" title={appt.reason}>
                        {appt.reason || "Consulta general"}
                      </Td>
                      <Td>{renderStatusBadge(appt.status)}</Td>
                      {!isClientRole && (
                        <Td className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            {appt.status !== "confirmado" && (
                              <button
                                type="button"
                                onClick={() => updateAppointmentStatus?.(appt.id, "confirmado")}
                                className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/70 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                title="Confirmar Turno"
                                aria-label={`Confirmar turno de ${appt.pet_name}`}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {appt.status !== "cancelado" && (
                              <button
                                type="button"
                                onClick={() => updateAppointmentStatus?.(appt.id, "cancelado")}
                                className="p-1.5 text-rose-700 hover:text-rose-900 hover:bg-rose-100/70 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                                title="Cancelar Turno"
                                aria-label={`Cancelar turno de ${appt.pet_name}`}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </Td>
                      )}
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* MODAL PARA SOLICITAR TURNO */}
      <AppointmentModal
        isOpen={isApptModalOpen}
        onClose={() => setIsApptModalOpen(false)}
        onSubmit={handleAppointmentSubmit}
      />
    </div>
  );
}