"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { VaccineFormModal } from "@/components/vacunas/VaccineFormModal";
import { formatDate, getDaysRemaining } from "@/lib/utils";
import {
  Syringe,
  PlusCircle,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Search,
  Filter,
  RotateCcw,
  CheckCircle2,
  XCircle,
  CalendarDays,
  FileSpreadsheet,
} from "lucide-react";

// Configuración de visualización y estados para vacunación
const VACCINE_STATUS_CONFIG = {
  vencida: {
    variant: "danger",
    label: "Vencida",
    icon: XCircle,
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
  },
  proxima: {
    variant: "warning",
    label: "Próxima a vencer",
    icon: Clock,
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
  },
  al_dia: {
    variant: "success",
    label: "Al día",
    icon: ShieldCheck,
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

export default function VaccinesPage() {
  const {
    vaccines = [],
    pets = [],
    addVaccine,
    currentRole,
    activeClientId,
  } = useApp();

  // Estados Locales de UI y Filtros
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");

  // 1. Filtrado de mascotas accesibles según el rol del usuario
  const availablePetIds = useMemo(() => {
    if (currentRole === "Cliente") {
      return new Set(
        pets.filter((p) => p.owner_id === activeClientId).map((p) => p.id)
      );
    }
    return new Set(pets.map((p) => p.id));
  }, [pets, currentRole, activeClientId]);

  // 2. Filtrado base de vacunas
  const baseVaccines = useMemo(() => {
    return vaccines.filter((v) => availablePetIds.has(v.pet_id));
  }, [vaccines, availablePetIds]);

  // 3. Vacunas con alerta urgente (días restantes <= 15)
  const alertVaccines = useMemo(() => {
    return baseVaccines.filter((v) => {
      const days = getDaysRemaining(v.next_due_date);
      return days <= 15;
    });
  }, [baseVaccines]);

  // 4. Métricas KPI dinámicas
  const stats = useMemo(() => {
    let total = baseVaccines.length;
    let upToDate = 0;
    let upcoming = 0;
    let expired = 0;

    baseVaccines.forEach((v) => {
      const days = getDaysRemaining(v.next_due_date);
      if (days < 0) {
        expired++;
      } else if (days <= 15) {
        upcoming++;
      } else {
        upToDate++;
      }
    });

    return { total, upToDate, upcoming, expired };
  }, [baseVaccines]);

  // 5. Búsqueda y filtrado compuesto para la vista principal
  const filteredVaccines = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return baseVaccines.filter((v) => {
      const days = getDaysRemaining(v.next_due_date);

      // Evaluación del estado según el filtro
      let matchesStatus = true;
      if (statusFilter === "AL_DIA") matchesStatus = days > 15;
      else if (statusFilter === "PROXIMA") matchesStatus = days >= 0 && days <= 15;
      else if (statusFilter === "VENCIDA") matchesStatus = days < 0;

      // Búsqueda textual
      const matchesQuery =
        !query ||
        v.pet_name?.toLowerCase().includes(query) ||
        v.owner_name?.toLowerCase().includes(query) ||
        v.vaccine_name?.toLowerCase().includes(query) ||
        v.vet_name?.toLowerCase().includes(query);

      return matchesStatus && matchesQuery;
    });
  }, [baseVaccines, searchQuery, statusFilter]);

  // Handlers memorizados
  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("TODOS");
  }, []);

  const handleAddVaccine = useCallback(
    async (data) => {
      try {
        await addVaccine(data);
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error al registrar vacuna:", error);
      }
    },
    [addVaccine]
  );

  // Helper para renderizar Badges de Estado con semántica clara
  const renderStatusBadge = (nextDueDate) => {
    const days = getDaysRemaining(nextDueDate);

    let statusKey = "al_dia";
    let label = "Al día";

    if (days < 0) {
      statusKey = "vencida";
      label = `Vencida (${Math.abs(days)}d)`;
    } else if (days <= 15) {
      statusKey = "proxima";
      label = `Vence en ${days}d`;
    }

    const config = VACCINE_STATUS_CONFIG[statusKey];
    const IconComponent = config.icon;

    return (
      <Badge
        variant={config.variant}
        className="inline-flex items-center gap-1.5 font-medium text-xs px-2.5 py-0.5 rounded-full"
      >
        <IconComponent className="w-3.5 h-3.5" />
        <span>{label}</span>
      </Badge>
    );
  };

  const statusOptions = [
    { value: "TODOS", label: "Todos los Estados" },
    { value: "AL_DIA", label: "Al Día" },
    { value: "PROXIMA", label: "Próxima a Vencer (<=15d)" },
    { value: "VENCIDA", label: "Vencida" },
  ];

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "TODOS";

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Encabezado Principal y Acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-autumn-200/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <Syringe className="w-7 h-7 text-autumn-600" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-autumn-900 tracking-tight">
              Control de Vacunación
            </h1>
          </div>
          <p className="text-sm text-autumn-700/80 mt-1">
            Registro histórico de dosis aplicadas, profesional a cargo y alertas preventivas de inmunización.
          </p>
        </div>

        {currentRole !== "Cliente" && (
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="sage"
            className="shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold self-start sm:self-auto"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Registrar Vacuna</span>
          </Button>
        )}
      </div>

      {/* Métricas e Indicadores KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-autumn-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-autumn-600 uppercase tracking-wider">Total Dosis</p>
            <p className="text-2xl font-black text-autumn-900 mt-1">{stats.total}</p>
          </div>
          <div className="p-2.5 bg-autumn-50 rounded-lg text-autumn-600">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-autumn-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Al Día</p>
            <p className="text-2xl font-black text-emerald-900 mt-1">{stats.upToDate}</p>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-autumn-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Por Vencer</p>
            <p className="text-2xl font-black text-amber-900 mt-1">{stats.upcoming}</p>
          </div>
          <div className="p-2.5 bg-amber-50 rounded-lg text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-autumn-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Vencidas</p>
            <p className="text-2xl font-black text-rose-900 mt-1">{stats.expired}</p>
          </div>
          <div className="p-2.5 bg-rose-50 rounded-lg text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Banner de Alertas Críticas (Próximas Dosis o Vencidas) */}
      {alertVaccines.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h2 className="text-base font-bold text-amber-950">
                ¡Alertas de Revacunación Pendiente! ({alertVaccines.length})
              </h2>
              <p className="text-xs text-amber-800 mt-0.5">
                Las siguientes mascotas requieren la aplicación de su dosis de refuerzo dentro de los próximos 15 días o ya tienen el esquema vencido:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            {alertVaccines.map((vcc) => {
              const days = getDaysRemaining(vcc.next_due_date);
              const isExpired = days < 0;

              return (
                <div
                  key={vcc.id}
                  className="bg-white p-3.5 rounded-xl border border-amber-200 flex items-center justify-between shadow-xs hover:border-amber-300 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-autumn-900 text-sm flex items-center gap-2">
                      <span>{vcc.pet_name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-amber-100/70 text-amber-800 font-semibold">
                        {vcc.vaccine_name}
                      </span>
                    </div>
                    <p className="text-xs text-autumn-600">Propietario: {vcc.owner_name}</p>
                  </div>

                  <div>
                    <Badge variant={isExpired ? "danger" : "warning"} className="text-xs font-semibold">
                      {isExpired
                        ? `Vencida (${Math.abs(days)}d)`
                        : `Vence en ${days} ${days === 1 ? "día" : "días"}`}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Panel de Filtros y Búsqueda */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-autumn-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-autumn-800 font-bold text-sm">
            <Filter className="w-4 h-4 text-autumn-600" />
            <span>Filtros y Búsqueda</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-medium text-autumn-600 hover:text-autumn-900 flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-autumn-50"
              title="Limpiar filtros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative sm:col-span-2">
            <Input
              label="Buscar Registro"
              placeholder="Nombre de mascota, vacuna, cliente o profesional..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9"
            />
            <Search className="w-4 h-4 text-autumn-400 absolute left-3 bottom-3" />
          </div>

          <Select
            label="Filtrar por Estado"
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Vista Escritorio (Tabla HTML Semántica) */}
      <div className="hidden md:block bg-white rounded-2xl border border-autumn-200 shadow-xs overflow-hidden">
        <Table>
          <Thead className="bg-autumn-50/70 border-b border-autumn-200">
            <Tr>
              <Th className="py-3.5 px-4 text-xs font-bold text-autumn-800 uppercase">Mascota & Dueño</Th>
              <Th className="py-3.5 px-4 text-xs font-bold text-autumn-800 uppercase">Vacuna Aplicada</Th>
              <Th className="py-3.5 px-4 text-xs font-bold text-autumn-800 uppercase">Fecha Aplicación</Th>
              <Th className="py-3.5 px-4 text-xs font-bold text-autumn-800 uppercase">Próxima Dosis / Refuerzo</Th>
              <Th className="py-3.5 px-4 text-xs font-bold text-autumn-800 uppercase">Veterinario a Cargo</Th>
              <Th className="py-3.5 px-4 text-xs font-bold text-autumn-800 uppercase text-right">Estado</Th>
            </Tr>
          </Thead>
          <Tbody className="divide-y divide-autumn-100">
            {filteredVaccines.length === 0 ? (
              <Tr>
                <Td colSpan={6} className="text-center py-12 px-4">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <CalendarDays className="w-12 h-12 text-autumn-300 stroke-1" />
                    <p className="text-base font-semibold text-autumn-900">
                      No se encontraron registros de vacunación
                    </p>
                    <p className="text-xs text-autumn-600 max-w-sm">
                      {hasActiveFilters
                        ? "Prueba cambiando los términos de búsqueda o limpiando los filtros seleccionados."
                        : "Aún no se han registrado vacunas aplicadas en el historial del sistema."}
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
              filteredVaccines.map((vcc) => {
                const days = getDaysRemaining(vcc.next_due_date);

                return (
                  <Tr key={vcc.id} className="hover:bg-autumn-50/40 transition-colors">
                    <Td className="py-4 px-4">
                      <div className="font-bold text-autumn-900 text-sm">{vcc.pet_name}</div>
                      <div className="text-xs font-medium text-autumn-600">{vcc.owner_name}</div>
                    </Td>

                    <Td className="py-4 px-4">
                      <div className="font-bold text-autumn-900 text-sm flex items-center space-x-2">
                        <Syringe className="w-4 h-4 text-autumn-500 shrink-0" />
                        <span>{vcc.vaccine_name}</span>
                      </div>
                    </Td>

                    <Td className="py-4 px-4 text-xs font-medium text-autumn-800">
                      {formatDate(vcc.application_date)}
                    </Td>

                    <Td className="py-4 px-4">
                      <div className="text-xs space-y-0.5">
                        <span className="font-bold block text-autumn-900">
                          {formatDate(vcc.next_due_date)}
                        </span>
                        <span
                          className={`text-[11px] font-medium ${
                            days < 0
                              ? "text-rose-600 font-bold"
                              : days <= 15
                              ? "text-amber-600 font-bold"
                              : "text-autumn-600"
                          }`}
                        >
                          {days < 0
                            ? `¡Vencida hace ${Math.abs(days)}d!`
                            : days <= 15
                            ? `Restan ${days} días`
                            : "Vigente"}
                        </span>
                      </div>
                    </Td>

                    <Td className="py-4 px-4 text-xs font-medium text-autumn-800">
                      {vcc.vet_name || "No especificado"}
                    </Td>

                    <Td className="py-4 px-4 text-right">
                      {renderStatusBadge(vcc.next_due_date)}
                    </Td>
                  </Tr>
                );
              })
            )}
          </Tbody>
        </Table>
      </div>

      {/* Vista Móvil Adaptable (Tarjetas) */}
      <div className="block md:hidden space-y-3">
        {filteredVaccines.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-autumn-200 text-center space-y-3">
            <CalendarDays className="w-10 h-10 text-autumn-300 mx-auto" />
            <p className="text-sm font-semibold text-autumn-900">No hay registros coincidentes</p>
            {hasActiveFilters && (
              <Button onClick={handleResetFilters} variant="secondary" className="text-xs">
                Restablecer Filtros
              </Button>
            )}
          </div>
        ) : (
          filteredVaccines.map((vcc) => (
            <div
              key={vcc.id}
              className="bg-white p-4 rounded-xl border border-autumn-200 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between border-b border-autumn-100 pb-2.5">
                <div>
                  <h3 className="font-bold text-autumn-900 text-base">{vcc.pet_name}</h3>
                  <p className="text-xs text-autumn-600">Dueño: {vcc.owner_name}</p>
                </div>
                {renderStatusBadge(vcc.next_due_date)}
              </div>

              <div className="flex items-center gap-2 text-autumn-900 font-bold text-sm bg-autumn-50/60 p-2.5 rounded-lg">
                <Syringe className="w-4 h-4 text-autumn-600 shrink-0" />
                <span>{vcc.vaccine_name}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-autumn-800">
                <div className="p-2 bg-autumn-50/40 rounded-lg space-y-0.5">
                  <span className="text-[10px] text-autumn-500 uppercase tracking-wider block font-semibold">
                    Aplicación
                  </span>
                  <span className="font-semibold text-autumn-900">{formatDate(vcc.application_date)}</span>
                </div>

                <div className="p-2 bg-autumn-50/40 rounded-lg space-y-0.5">
                  <span className="text-[10px] text-autumn-500 uppercase tracking-wider block font-semibold">
                    Próximo Refuerzo
                  </span>
                  <span className="font-semibold text-autumn-900">{formatDate(vcc.next_due_date)}</span>
                </div>
              </div>

              <div className="text-xs text-autumn-700 pt-1 flex items-center justify-between border-t border-autumn-100/60">
                <span>Atendido por:</span>
                <span className="font-bold text-autumn-900">{vcc.vet_name || "No especificado"}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Formulario de Creación/Registro de Vacuna */}
      <VaccineFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddVaccine}
      />
    </div>
  );
}