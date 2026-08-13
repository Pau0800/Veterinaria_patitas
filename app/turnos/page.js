"use client";

import React, { useState } from "react";
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
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Calendar as CalendarIcon,
} from "lucide-react";

export default function AppointmentsPage() {
  const { appointments, updateAppointmentStatus, addAppointment, currentRole, activeClientId } =
    useApp();

  const [selectedVet, setSelectedVet] = useState("TODOS");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("TODOS");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);

  // Role Filtering
  const baseAppointments =
    currentRole === "Cliente"
      ? appointments.filter((a) => a.client_id === activeClientId)
      : appointments;

  const filteredAppointments = baseAppointments.filter((appt) => {
    const matchesVet = selectedVet === "TODOS" || appt.vet_id === selectedVet;
    const matchesDate = !selectedDate || appt.appointment_date === selectedDate;
    const matchesStatus = selectedStatus === "TODOS" || appt.status === selectedStatus;
    return matchesVet && matchesDate && matchesStatus;
  });

  const vetOptions = [
    { value: "TODOS", label: "Todos los Veterinarios" },
    ...VETERINARIANS.map((v) => ({ value: v.id, label: v.full_name })),
  ];

  const statusOptions = [
    { value: "TODOS", label: "Todos los Estados" },
    { value: "solicitado", label: "Solicitado" },
    { value: "confirmado", label: "Confirmado" },
    { value: "reprogramado", label: "Reprogramado" },
    { value: "cancelado", label: "Cancelado" },
  ];

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
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-autumn-900">Agenda & Gestión de Turnos</h1>
          <p className="text-xs text-autumn-800/70">
            Citas agendadas, reprogramación, filtros por profesional veterinario y estado de confirmación.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingAppt(null);
            setIsModalOpen(true);
          }}
          variant="primary"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Solicitar Turno</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-autumn-200 shadow-autumn-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select
          label="Filtrar por Veterinario"
          options={vetOptions}
          value={selectedVet}
          onChange={(e) => setSelectedVet(e.target.value)}
        />

        <Input
          label="Filtrar por Fecha"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        <Select
          label="Filtrar por Estado"
          options={statusOptions}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        />
      </div>

      {/* Agenda Table */}
      <Table>
        <Thead>
          <Tr>
            <Th>Fecha y Hora</Th>
            <Th>Mascota</Th>
            <Th>Cliente / Dueño</Th>
            <Th>Veterinario</Th>
            <Th>Motivo / Observaciones</Th>
            <Th>Estado</Th>
            <Th className="text-right">Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredAppointments.length === 0 ? (
            <Tr>
              <Td colSpan={7} className="text-center py-8 text-autumn-800/60">
                No hay turnos registrados que coincidan con los filtros.
              </Td>
            </Tr>
          ) : (
            filteredAppointments.map((appt) => (
              <Tr key={appt.id}>
                <Td>
                  <div className="font-bold text-autumn-900">{formatDate(appt.appointment_date)}</div>
                  <div className="text-xs text-autumn-800/70 font-semibold flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-autumn-500 inline" />
                    <span>{appt.appointment_time} hs</span>
                  </div>
                </Td>
                <Td className="font-bold text-autumn-900">{appt.pet_name}</Td>
                <Td>{appt.client_name}</Td>
                <Td>{appt.vet_name}</Td>
                <Td className="max-w-xs">
                  <div className="text-xs text-autumn-900 font-medium">{appt.reason}</div>
                  {appt.notes && (
                    <div className="text-[11px] text-autumn-800/60 italic truncate">{appt.notes}</div>
                  )}
                </Td>
                <Td>{getStatusBadge(appt.status)}</Td>
                <Td className="text-right">
                  <div className="flex items-center justify-end space-x-1">
                    {appt.status !== "confirmado" && currentRole !== "Cliente" && (
                      <button
                        onClick={() => updateAppointmentStatus(appt.id, "confirmado")}
                        className="px-2 py-1 bg-sage-100 text-sage-700 hover:bg-sage-200 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1"
                        title="Confirmar"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span className="hidden lg:inline">Confirmar</span>
                      </button>
                    )}

                    {appt.status !== "cancelado" && (
                      <button
                        onClick={() => updateAppointmentStatus(appt.id, "cancelado")}
                        className="px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1"
                        title="Cancelar"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span className="hidden lg:inline">Cancelar</span>
                      </button>
                    )}
                  </div>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>

      {/* Modal Agendar Turno */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAppt(null);
        }}
        onSubmit={(data) => addAppointment(data)}
        initialData={editingAppt}
      />
    </div>
  );
}
