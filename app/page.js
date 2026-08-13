"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const {
    currentRole,
    clients,
    pets,
    appointments,
    vaccines,
    hospitalizations,
    pharmacy,
    activeClientId,
    updateAppointmentStatus,
    addAppointment,
  } = useApp();

  const [isApptModalOpen, setIsApptModalOpen] = useState(false);

  // Role Filtering logic
  const filteredPets =
    currentRole === "Cliente"
      ? pets.filter((p) => p.owner_id === activeClientId)
      : pets.filter((p) => p.status === "activo");

  const filteredClients = clients.filter((c) => c.status === "activo");

  const filteredAppointments =
    currentRole === "Cliente"
      ? appointments.filter((a) => a.client_id === activeClientId)
      : appointments;

  const pendingVaccines = vaccines.filter((v) => v.status === "pendiente");
  const activeHospitalizations = hospitalizations.filter((h) => h.status === "activa");
  const lowStockItems = pharmacy.filter((p) => p.stock <= p.min_stock);

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmado":
        return <Badge variant="success">Confirmado</Badge>;
      case "solicitado":
        return <Badge variant="warning">Solicitado</Badge>;
      case "reprogramado":
        return <Badge variant="default">Reprogramado</Badge>;
      case "cancelado":
        return <Badge variant="danger">Cancelado</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner de Bienvenida */}
      <div className="bg-gradient-to-r from-autumn-600 via-autumn-500 to-amberGold-600 rounded-2xl p-6 lg:p-8 text-white shadow-autumn-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Vista {currentRole}
          </span>
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            ¡Bienvenido a VetOtoño!
          </h2>
          <p className="text-white/90 text-sm max-w-xl">
            {currentRole === "Cliente"
              ? "Consulta el estado de salud, próximas vacunas y turnos de tus mascotas en un solo lugar."
              : "Gestión unificada de pacientes, agenda médica, historias clínicas e inventario de farmacia."}
          </p>
        </div>

        <Button
          onClick={() => setIsApptModalOpen(true)}
          variant="secondary"
          className="bg-white text-autumn-900 hover:bg-autumn-50 shadow-md font-bold"
        >
          <PlusCircle className="w-5 h-5 text-autumn-500" />
          <span>Solicitar Cita</span>
        </Button>
      </div>

      {/* Tarjetas KPI de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Alertas Críticas (Bajo Stock y Vacunas) */}
      {(lowStockItems.length > 0 || pendingVaccines.length > 0) && currentRole !== "Cliente" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockItems.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 text-red-900">
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <strong className="font-bold text-sm block">Alerta de Insumos Críticos:</strong>
                <p>
                  Hay {lowStockItems.length} medicamento(s) que han alcanzado el umbral mínimo (ej:{" "}
                  {lowStockItems[0].name}).
                </p>
                <Link href="/farmacia" className="text-red-700 font-bold underline mt-1 inline-block">
                  Revisar Farmacia &rarr;
                </Link>
              </div>
            </div>
          )}

          {pendingVaccines.length > 0 && (
            <div className="bg-amberGold-50 border border-amberGold-200 rounded-xl p-4 flex items-start space-x-3 text-amberGold-900">
              <Clock className="w-6 h-6 text-amberGold-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <strong className="font-bold text-sm block">Recordatorios de Vacunación:</strong>
                <p>
                  Existe(n) {pendingVaccines.length} vacuna(s) de mascotas con fecha límite cercana.
                </p>
                <Link href="/vacunas" className="text-amberGold-700 font-bold underline mt-1 inline-block">
                  Ver Vacunas &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gráficos de Estadísticas */}
      {currentRole !== "Cliente" && (
        <DashboardCharts
          appointments={appointments}
          vaccines={vaccines}
          pharmacy={pharmacy}
        />
      )}

      {/* Tabla de Turnos Recientes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>Agenda de Turnos Próximos</CardTitle>
            <Link href="/turnos">
              <Button size="sm" variant="outline">
                Ver Todos los Turnos
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <Thead>
              <Tr>
                <Th>Mascota</Th>
                <Th>Dueño</Th>
                <Th>Veterinario</Th>
                <Th>Fecha y Hora</Th>
                <Th>Motivo</Th>
                <Th>Estado</Th>
                {currentRole !== "Cliente" && <Th className="text-right">Acciones</Th>}
              </Tr>
            </Thead>
            <Tbody>
              {filteredAppointments.length === 0 ? (
                <Tr>
                  <Td colSpan={7} className="text-center py-6 text-autumn-800/60">
                    No hay turnos agendados por el momento.
                  </Td>
                </Tr>
              ) : (
                filteredAppointments.slice(0, 5).map((appt) => (
                  <Tr key={appt.id}>
                    <Td className="font-bold text-autumn-900">{appt.pet_name}</Td>
                    <Td>{appt.client_name}</Td>
                    <Td>{appt.vet_name}</Td>
                    <Td>
                      <div className="text-xs">
                        <span className="font-semibold block">{formatDate(appt.appointment_date)}</span>
                        <span className="text-autumn-800/60">{appt.appointment_time} hs</span>
                      </div>
                    </Td>
                    <Td className="max-w-xs truncate">{appt.reason}</Td>
                    <Td>{getStatusBadge(appt.status)}</Td>
                    {currentRole !== "Cliente" && (
                      <Td className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {appt.status !== "confirmado" && (
                            <button
                              onClick={() => updateAppointmentStatus(appt.id, "confirmado")}
                              className="p-1.5 text-sage-600 hover:bg-sage-50 rounded-md transition-colors"
                              title="Confirmar Turno"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {appt.status !== "cancelado" && (
                            <button
                              onClick={() => updateAppointmentStatus(appt.id, "cancelado")}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Cancelar Turno"
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

      {/* Modal para solicitar turno */}
      <AppointmentModal
        isOpen={isApptModalOpen}
        onClose={() => setIsApptModalOpen(false)}
        onSubmit={(newAppt) => addAppointment(newAppt)}
      />
    </div>
  );
}
