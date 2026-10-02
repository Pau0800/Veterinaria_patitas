"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { AppointmentModal } from "@/components/turnos/AppointmentModal";
import { VETERINARIANS } from "@/lib/mockData";
import { formatDate } from "@/lib/utils";
import {
  CalendarCheck,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Pencil,
  FolderOpen,
  Search,
  RotateCcw,
  CalendarDays,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";

// Configuración de visualización según estado del turno
const STATUS_CONFIG = {
  confirmado: { variant: "success", label: "Confirmado", icon: CheckCircle2 },
  solicitado: { variant: "warning", label: "Solicitado", icon: Clock },
  reprogramado: { variant: "info", label: "Reprogramado", icon: CalendarDays },
  cancelado: { variant: "danger", label: "Cancelado", icon: XCircle },
};

export default function AppointmentsPage() {
  const router = useRouter();
  const {
    appointments = [],
    updateAppointmentStatus,
    updateAppointment,
    addAppointment,
    currentRole,
    activeClientId,
  } = useApp();

  // Estados de Filtros
  const [selectedVet, setSelectedVet] = useState("TODOS");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("TODOS");
  const [searchQuery, setSearchQuery] = useState("");

  // Estados de Interacción y Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(null);

  // Opciones memorizadas para selectores
  const vetOptions = useMemo(
    () => [
      { value: "TODOS", label: "Todos los Veterinarios" },
      ...VETERINARIANS.map((v) => ({ value: v.id, label: v.full_name })),
    ],
    []
  );

  const statusOptions = useMemo(
    () => [
      { value: "TODOS", label: "Todos los Estados" },
      { value: "solicitado", label: "Solicitado" },
      { value: "confirmado", label: "Confirmado" },
      { value: "reprogramado", label: "Reprogramado" },
      { value: "cancelado", label: "Cancelado" },
    ],
    []
  );

  // Filtrado inicial por rol de usuario
  const baseAppointments = useMemo(() => {
    if (currentRole === "Cliente") {
      return appointments.filter((a) => a.client_id === activeClientId);
    }
    return appointments;
  }, [appointments, currentRole, activeClientId]);

  // Búsqueda y filtrado compuesto memorizado para mayor rendimiento
  const filteredAppointments = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return baseAppointments.filter((appt) => {
      const matchesVet = selectedVet === "TODOS" || appt.vet_id === selectedVet;
      const matchesDate = !selectedDate || appt.appointment_date === selectedDate;
      const matchesStatus = selectedStatus === "TODOS" || appt.status === selectedStatus;

      const matchesSearch =
        !query ||
        appt.pet_name?.toLowerCase().includes(query) ||
        appt.client_name?.toLowerCase().includes(query) ||
        appt.reason?.toLowerCase().includes(query) ||
        appt.vet_name?.toLowerCase().includes(query);

      return matchesVet && matchesDate && matchesStatus && matchesSearch;
    });
  }, [baseAppointments, selectedVet, selectedDate, selectedStatus, searchQuery]);

  // Cálculos de métricas en vivo (KPI Dashboard)
  const stats = useMemo(() => {
    const total = baseAppointments.length;
    const confirmed = baseAppointments.filter((a) => a.status === "confirmado").length;
    const pending = baseAppointments.filter((a) => a.status === "solicitado").length;
    const cancelled = baseAppointments.filter((a) => a.status === "cancelado").length;
    return { total, confirmed, pending, cancelled };
  }, [baseAppointments]);

  // Handlers de navegación e interacción
  const handleOpenMedicalRecord = useCallback(
    (appt) => {
      const params = new URLSearchParams({
        turnoId: appt.id,
        mascotaId: appt.pet_id,
        veterinarioId: appt.vet_id,
        fecha: appt.appointment_date,
        motivo: appt.reason,
      });
      router.push(`/historias-clinicas?${params.toString()}`);
    },
    [router]
  );

  const handleResetFilters = useCallback(() => {
    setSelectedVet("TODOS");
    setSelectedDate("");
    setSelectedStatus("TODOS");
    setSearchQuery("");
  }, []);

  const handleStatusUpdate = useCallback(
    async (id, newStatus) => {
      try {
        await updateAppointmentStatus(id, newStatus);
      } catch (error) {
        console.error("Error al actualizar estado del turno:", error);
      } finally {
        setIsConfirmingCancel(null);
      }
    },
    [updateAppointmentStatus]
  );

  const renderBadge = (status) => {
    const config = STATUS_CONFIG[status] || {
      variant: "default",
      label: status,
      icon: AlertCircle,
    };
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="inline-flex items-center gap-1 font-medium text-xs px-2.5 py-0.5 rounded-full">
        <IconComponent className="w-3 h-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  const hasActiveFilters =
    selectedVet !== "TODOS" || selectedDate !== "" || selectedStatus !== "TODOS" || searchQuery !== "";

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Encabezado y Acción Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-autumn-200/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-7 h-7 text-autumn-600" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-autumn-900 tracking-tight">
              Agenda & Gestión de Turnos
            </h1>
          </div>
          <p className="text-sm text-autumn-700/80 mt-1">
            Control integral de citas, reprogramaciones y filtrado por profesional y estado.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingAppt(null);
            setIsModalOpen(true);
          }}
          variant="primary"
          className="shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Solicitar Turno</span>
        </Button>
      </div>

      {/* Panel de Métricas KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-autumn-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-autumn-600 uppercase tracking-wider">Total Turnos</p>
            <p className="text-2xl font-black text-autumn-900 mt-1">{stats.total}</p>
          </div>
          <div className="p-2.5 bg-autumn-50 rounded-lg text-autumn-600">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-autumn-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Confirmados</p>
            <p className="text-2xl font-black text-emerald-900 mt-1">{stats.confirmed}</p>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-autumn-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pendientes</p>
            <p className="text-2xl font-black text-amber-900 mt-1">{stats.pending}</p>
          </div>
          <div className="p-2.5 bg-amber-50 rounded-lg text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-autumn-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Cancelados</p>
            <p className="text-2xl font-black text-rose-900 mt-1">{stats.cancelled}</p>
          </div>
          <div className="p-2.5 bg-rose-50 rounded-lg text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-autumn-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-autumn-800 font-bold text-sm">
            <Filter className="w-4 h-4 text-autumn-600" />
            <span>Filtros de búsqueda</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-medium text-autumn-600 hover:text-autumn-900 flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-autumn-50"
              title="Limpiar todos los filtros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Input
              label="Buscar"
              placeholder="Mascota, cliente, motivo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9"
            />
            <Search className="w-4 h-4 text-autumn-400 absolute left-3 bottom-3" />
          </div>

          <Select
            label="Veterinario"
            options={vetOptions}
            value={selectedVet}
            onChange={(e) => setSelectedVet(e.target.value)}
          />

          <Input
            label="Fecha"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          <Select
            label="Estado"
            options={statusOptions}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          />
        </div>
      </div>

      {/* Vista de Escritorio (Tabla HTML Semántica) */}
      <div className="hidden md:block bg-white rounded-2xl border border-autumn-200 shadow-sm overflow-hidden">
        <Table>
          <Thead className="bg-autumn-50/70 border-b border-autumn-200">
            <Tr>
              <Th className="py-3.5 px-4 text-xs font-bold text-autumn-800 uppercase">Fecha y Hora</Th>
              <Th className="py-3.5 px-4 text-xs font-bold text-autumn-800 uppercase">Mascota</Th>
              <Th className="py-3.5 px-4 text-xs font-bold text-autumn-800 uppercase">Cliente / Dueño</Th>
              <Th className="py-3.5 px-4 text-xs font-bold text-autumn-800 uppercase">Veterinario</Th>
              <Th className="py-3.5 px-4 text-xs font-bold text-autumn-800 uppercase">Motivo y Notas</Th>
              <Th className="py-3.5 px-4 text-xs font-bold text-autumn-800 uppercase">Estado</Th>
              <Th className="py-3.5 px-4 text-xs font-bold text-autumn-800 uppercase text-right">Gestión</Th>
              <Th className="py-3.5 px-4 text-xs font-bold text-autumn-800 uppercase text-right">Historial</Th>
            </Tr>
          </Thead>
          <Tbody className="divide-y divide-autumn-100">
            {filteredAppointments.length === 0 ? (
              <Tr>
                <Td colSpan={8} className="text-center py-12 px-4">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <CalendarDays className="w-12 h-12 text-autumn-300 stroke-1" />
                    <p className="text-base font-semibold text-autumn-900">No se encontraron turnos</p>
                    <p className="text-xs text-autumn-600 max-w-sm">
                      Prueba ajustando los filtros seleccionados o registra un nuevo turno en el sistema.
                    </p>
                    {hasActiveFilters && (
                      <Button onClick={handleResetFilters} variant="secondary" className="mt-2 text-xs">
                        Limpiar filtros
                      </Button>
                    )}
                  </div>
                </Td>
              </Tr>
            ) : (
              filteredAppointments.map((appt) => (
                <Tr key={appt.id} className="hover:bg-autumn-50/40 transition-colors">
                  <Td className="py-4 px-4">
                    <div className="font-bold text-autumn-900 text-sm">
                      {formatDate(appt.appointment_date)}
                    </div>
                    <div className="text-xs font-medium text-autumn-700 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-autumn-500" />
                      <span>{appt.appointment_time} hs</span>
                    </div>
                  </Td>

                  <Td className="py-4 px-4 font-bold text-autumn-900 text-sm">
                    {appt.pet_name}
                  </Td>

                  <Td className="py-4 px-4 text-sm text-autumn-800">
                    {appt.client_name}
                  </Td>

                  <Td className="py-4 px-4 text-sm text-autumn-800">
                    {appt.vet_name}
                  </Td>

                  <Td className="py-4 px-4 max-w-xs">
                    <div className="text-xs font-medium text-autumn-900 line-clamp-2" title={appt.reason}>
                      {appt.reason}
                    </div>
                    {appt.notes && (
                      <div className="text-[11px] text-autumn-600 italic truncate mt-0.5" title={appt.notes}>
                        {appt.notes}
                      </div>
                    )}
                  </Td>

                  <Td className="py-4 px-4">
                    {renderBadge(appt.status)}
                  </Td>

                  <Td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setEditingAppt(appt);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 bg-autumn-100/70 text-autumn-700 hover:bg-autumn-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 focus:ring-2 focus:ring-autumn-400 focus:outline-hidden"
                        title="Editar Turno"
                        aria-label="Editar Turno"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span className="hidden lg:inline">Editar</span>
                      </button>

                      {appt.status !== "confirmado" && currentRole !== "Cliente" && (
                        <button
                          onClick={() => handleStatusUpdate(appt.id, "confirmado")}
                          className="p-1.5 bg-emerald-100/70 text-emerald-800 hover:bg-emerald-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 focus:ring-2 focus:ring-emerald-400 focus:outline-hidden"
                          title="Confirmar Turno"
                          aria-label="Confirmar Turno"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="hidden lg:inline">Confirmar</span>
                        </button>
                      )}

                      {appt.status !== "cancelado" && (
                        <>
                          {isConfirmingCancel === appt.id ? (
                            <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200">
                              <button
                                onClick={() => handleStatusUpdate(appt.id, "cancelado")}
                                className="px-1.5 py-0.5 bg-rose-600 text-white hover:bg-rose-700 rounded text-[10px] font-bold"
                              >
                                Sí
                              </button>
                              <button
                                onClick={() => setIsConfirmingCancel(null)}
                                className="px-1.5 py-0.5 bg-autumn-200 text-autumn-800 hover:bg-autumn-300 rounded text-[10px] font-bold"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setIsConfirmingCancel(appt.id)}
                              className="p-1.5 bg-rose-100/70 text-rose-700 hover:bg-rose-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 focus:ring-2 focus:ring-rose-400 focus:outline-hidden"
                              title="Cancelar Turno"
                              aria-label="Cancelar Turno"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span className="hidden lg:inline">Cancelar</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </Td>

                  <Td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleOpenMedicalRecord(appt)}
                      className="p-1.5 bg-autumn-100 text-autumn-800 hover:bg-autumn-200 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1 focus:ring-2 focus:ring-autumn-400 focus:outline-hidden"
                      title="Abrir Historia Clínica"
                      aria-label="Abrir Historia Clínica"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-autumn-600" />
                      <span className="hidden lg:inline">Historia</span>
                    </button>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </div>

      {/* Vista Móvil (Tarjetas Adaptables) */}
      <div className="block md:hidden space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-autumn-200 text-center space-y-3">
            <CalendarDays className="w-10 h-10 text-autumn-300 mx-auto" />
            <p className="text-sm font-semibold text-autumn-900">No se encontraron turnos</p>
            {hasActiveFilters && (
              <Button onClick={handleResetFilters} variant="secondary" className="text-xs">
                Restablecer Filtros
              </Button>
            )}
          </div>
        ) : (
          filteredAppointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-white p-4 rounded-xl border border-autumn-200 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between border-b border-autumn-100 pb-2.5">
                <div>
                  <h3 className="font-bold text-autumn-900 text-base">{appt.pet_name}</h3>
                  <p className="text-xs text-autumn-700">Dueño: {appt.client_name}</p>
                </div>
                {renderBadge(appt.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-autumn-800">
                <div className="flex items-center gap-1.5 bg-autumn-50/70 p-2 rounded-lg">
                  <CalendarDays className="w-3.5 h-3.5 text-autumn-600" />
                  <span>{formatDate(appt.appointment_date)}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-autumn-50/70 p-2 rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-autumn-600" />
                  <span>{appt.appointment_time} hs</span>
                </div>
              </div>

              <div className="text-xs space-y-1">
                <p className="text-autumn-600 font-medium">Vet: <span className="text-autumn-900">{appt.vet_name}</span></p>
                <p className="text-autumn-900 font-medium bg-autumn-50/50 p-2 rounded-lg">{appt.reason}</p>
                {appt.notes && <p className="text-[11px] text-autumn-600 italic px-1">Obs: {appt.notes}</p>}
              </div>

              <div className="pt-2 border-t border-autumn-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenMedicalRecord(appt)}
                  className="px-2.5 py-1.5 bg-autumn-100 text-autumn-800 rounded-lg text-xs font-medium flex items-center gap-1"
                >
                  <FolderOpen className="w-3 h-3" />
                  <span>Historia</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingAppt(appt);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 bg-autumn-100 text-autumn-700 rounded-lg"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  {appt.status !== "confirmado" && currentRole !== "Cliente" && (
                    <button
                      onClick={() => handleStatusUpdate(appt.id, "confirmado")}
                      className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg"
                      title="Confirmar"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}

                  {appt.status !== "cancelado" && (
                    <button
                      onClick={() => handleStatusUpdate(appt.id, "cancelado")}
                      className="p-1.5 bg-rose-100 text-rose-700 rounded-lg"
                      title="Cancelar"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Reutilizable de Creación/Edición */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAppt(null);
        }}
        onSubmit={async (data) => {
          if (editingAppt) {
            await updateAppointment(data);
          } else {
            await addAppointment(data);
          }
          setIsModalOpen(false);
          setEditingAppt(null);
        }}
        initialData={editingAppt}
      />
    </div>
  );
}