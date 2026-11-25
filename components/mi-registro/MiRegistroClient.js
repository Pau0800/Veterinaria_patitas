"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useApp } from "@/context/AppContext";
import { ROLES } from "@/lib/permissions";
import { PetAvatar } from "@/components/mascotas/PetAvatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";
import {
  ClipboardList,
  CalendarCheck,
  FileSpreadsheet,
  Syringe,
  ArrowRightLeft,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserCheck,
} from "lucide-react";

const TABS = [
  { id: "todos", label: "Todos", icon: ClipboardList },
  { id: "turnos", label: "Turnos", icon: CalendarCheck },
  { id: "revisiones", label: "Revisiones", icon: FileSpreadsheet },
  { id: "vacunas", label: "Vacunas", icon: Syringe },
];

const APPT_STATUS_CONFIG = {
  solicitado: { variant: "warning", label: "Solicitado" },
  confirmado: { variant: "success", label: "Confirmado" },
  reprogramado: { variant: "default", label: "Reprogramado" },
  cancelado: { variant: "danger", label: "Cancelado" },
};

const REASSIGNABLE_STATUSES = new Set(["solicitado", "confirmado", "reprogramado"]);

export function MiRegistroClient({ currentProfile }) {
  const {
    appointments = [],
    medicalRecords = [],
    vaccines = [],
    pets = [],
    veterinarians = [],
    reassignAppointmentVet,
  } = useApp();

  const isAdmin = currentProfile?.role === ROLES.ADMIN;

  // Para veterinario: siempre fijo a su propio perfil. Para administrador: selector de veterinario.
  const [selectedAdminVetId, setSelectedAdminVetId] = useState("");
  const [activeTab, setActiveTab] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal de derivación / reasignación
  const [reassigningAppt, setReassigningAppt] = useState(null);
  const [targetVetId, setTargetVetId] = useState("");
  const [reassignError, setReassignError] = useState("");
  const [isReassigning, setIsReassigning] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  useEffect(() => {
    if (isAdmin && !selectedAdminVetId && veterinarians.length > 0) {
      setSelectedAdminVetId(veterinarians[0].id);
    }
  }, [isAdmin, selectedAdminVetId, veterinarians]);

  const activeVetId = isAdmin ? selectedAdminVetId : currentProfile?.id;
  const activeVetAuthId = isAdmin ? null : currentProfile?.authUserId;

  const selectedVetObj = useMemo(() => {
    if (!isAdmin) return currentProfile;
    return (
      veterinarians.find((v) => String(v.id) === String(selectedAdminVetId)) ||
      null
    );
  }, [isAdmin, currentProfile, veterinarians, selectedAdminVetId]);

  const matchesActiveVet = useCallback(
    (record) => {
      if (!activeVetId) return false;
      const assignedId = record?.veterinarian_id || record?.vet_id;
      if (!assignedId) return false;
      return (
        String(assignedId) === String(activeVetId) ||
        (activeVetAuthId && String(assignedId) === String(activeVetAuthId))
      );
    },
    [activeVetId, activeVetAuthId]
  );

  const petsById = useMemo(() => {
    const map = new Map();
    pets.forEach((p) => {
      if (p?.id) map.set(p.id, p);
    });
    return map;
  }, [pets]);

  const myAppointments = useMemo(() => {
    return appointments.filter(matchesActiveVet);
  }, [appointments, matchesActiveVet]);

  const myMedicalRecords = useMemo(() => {
    return medicalRecords.filter(matchesActiveVet);
  }, [medicalRecords, matchesActiveVet]);

  const myVaccines = useMemo(() => {
    return vaccines.filter(matchesActiveVet);
  }, [vaccines, matchesActiveVet]);

  // Lista unificada normalizada para pestañas y búsqueda
  const unifiedActivities = useMemo(() => {
    const items = [];

    if (activeTab === "todos" || activeTab === "turnos") {
      myAppointments.forEach((appt) => {
        const pet = petsById.get(appt.pet_id);
        const statusCfg = APPT_STATUS_CONFIG[appt.status] || {
          variant: "default",
          label: appt.status || "Pendiente",
        };
        items.push({
          key: `appt-${appt.id}`,
          kind: "turno",
          kindLabel: "Turno",
          date: appt.appointment_date || "",
          time: appt.appointment_time || "",
          petId: appt.pet_id,
          petName: appt.pet_name || pet?.name || "Mascota",
          petSpecies: pet?.species || "",
          petPhoto: pet?.photo_url || "",
          ownerName: appt.client_name || pet?.owner_name || "Cliente",
          title: appt.reason || "Consulta programada",
          subtitle: appt.notes || "",
          statusLabel: statusCfg.label,
          statusVariant: statusCfg.variant,
          canReassign: REASSIGNABLE_STATUSES.has(appt.status),
          rawAppointment: appt,
        });
      });
    }

    if (activeTab === "todos" || activeTab === "revisiones") {
      myMedicalRecords.forEach((rec) => {
        const pet = petsById.get(rec.pet_id);
        items.push({
          key: `med-${rec.id}`,
          kind: "revision",
          kindLabel: "Revisión",
          date: rec.record_date ? String(rec.record_date).split("T")[0] : "",
          time: "",
          petId: rec.pet_id,
          petName: rec.pet_name || pet?.name || "Mascota",
          petSpecies: pet?.species || "",
          petPhoto: pet?.photo_url || "",
          ownerName: pet?.owner_name || "—",
          title: rec.title || rec.type || "Atención clínica",
          subtitle: rec.diagnosis || rec.description || "",
          statusLabel: rec.type || "Consulta",
          statusVariant: "info",
          canReassign: false,
          rawAppointment: null,
        });
      });
    }

    if (activeTab === "todos" || activeTab === "vacunas") {
      myVaccines.forEach((vcc) => {
        const pet = petsById.get(vcc.pet_id);
        items.push({
          key: `vcc-${vcc.id}`,
          kind: "vacuna",
          kindLabel: "Vacuna",
          date: vcc.application_date || "",
          time: "",
          petId: vcc.pet_id,
          petName: vcc.pet_name || pet?.name || "Mascota",
          petSpecies: pet?.species || "",
          petPhoto: pet?.photo_url || "",
          ownerName: vcc.owner_name || pet?.owner_name || "Dueño",
          title: vcc.vaccine_name || "Vacunación",
          subtitle: vcc.next_due_date
            ? `Próximo refuerzo: ${formatDate(vcc.next_due_date)}`
            : "",
          statusLabel: vcc.status === "pendiente" ? "Pendiente" : "Aplicada",
          statusVariant: vcc.status === "pendiente" ? "warning" : "success",
          canReassign: false,
          rawAppointment: null,
        });
      });
    }

    const q = searchTerm.trim().toLowerCase();
    const filtered = q
      ? items.filter(
          (item) =>
            item.petName.toLowerCase().includes(q) ||
            item.ownerName.toLowerCase().includes(q) ||
            item.title.toLowerCase().includes(q) ||
            item.subtitle.toLowerCase().includes(q)
        )
      : items;

    return filtered.sort((a, b) =>
      String(b.date || "").localeCompare(String(a.date || ""))
    );
  }, [
    activeTab,
    myAppointments,
    myMedicalRecords,
    myVaccines,
    petsById,
    searchTerm,
  ]);

  // Opciones de otros veterinarios activos (excluyendo al veterinario actual)
  const otherVetsOptions = useMemo(() => {
    return (veterinarians || [])
      .filter(
        (v) =>
          String(v.id) !== String(activeVetId) &&
          (!activeVetAuthId || String(v.id) !== String(activeVetAuthId))
      )
      .map((v) => ({
        value: String(v.id),
        label: v.full_name,
      }));
  }, [veterinarians, activeVetId, activeVetAuthId]);

  const handleOpenReassignModal = useCallback(
    (appt) => {
      setReassigningAppt(appt);
      setTargetVetId(otherVetsOptions[0]?.value || "");
      setReassignError("");
    },
    [otherVetsOptions]
  );

  const handleCloseReassignModal = useCallback(() => {
    if (isReassigning) return;
    setReassigningAppt(null);
    setTargetVetId("");
    setReassignError("");
  }, [isReassigning]);

  const handleConfirmReassign = async (e) => {
    e.preventDefault();
    if (!reassigningAppt || !targetVetId) {
      setReassignError("Seleccioná un veterinario destino.");
      return;
    }

    setIsReassigning(true);
    setReassignError("");

    try {
      const targetVet = await reassignAppointmentVet(
        reassigningAppt.id,
        targetVetId
      );
      setFeedbackMessage(
        `Turno de ${reassigningAppt.pet_name} derivado correctamente a ${targetVet.full_name}.`
      );
      setReassigningAppt(null);
      setTargetVetId("");
    } catch (err) {
      setReassignError(
        err?.message || "No se pudo derivar el turno. Intentá nuevamente."
      );
    } finally {
      setIsReassigning(false);
    }
  };

  const adminVetSelectOptions = useMemo(() => {
    return veterinarians.map((v) => ({
      value: String(v.id),
      label: v.full_name,
    }));
  }, [veterinarians]);

  return (
    <div className="space-y-6 p-2 sm:p-4 max-w-7xl mx-auto">
      {/* Encabezado */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-autumn-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-autumn-900 tracking-tight flex items-center gap-2.5">
            <ClipboardList className="w-7 h-7 text-autumn-600" aria-hidden="true" />
            <span>Mi Registro</span>
          </h1>
          <p className="text-xs sm:text-sm text-autumn-800/75 mt-1">
            Historial personal de turnos asignados, revisiones clínicas y vacunas aplicadas{" "}
            {selectedVetObj?.full_name ? (
              <>
                de <strong className="text-autumn-900">{selectedVetObj.full_name}</strong>.
              </>
            ) : (
              "."
            )}
          </p>
        </div>

        {isAdmin && (
          <div className="w-full lg:w-72">
            <Select
              label="Inspeccionar registro de:"
              options={
                adminVetSelectOptions.length > 0
                  ? adminVetSelectOptions
                  : [{ value: "", label: "Sin veterinarios activos" }]
              }
              value={selectedAdminVetId}
              onChange={(e) => setSelectedAdminVetId(e.target.value)}
            />
          </div>
        )}
      </header>

      {feedbackMessage && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 p-4 rounded-xl bg-sage-50 border border-sage-500/30 text-sage-800 text-xs sm:text-sm font-medium"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-sage-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage("")}
            className="text-xs font-bold text-sage-700 hover:underline shrink-0"
          >
            Ocultar
          </button>
        </div>
      )}

      {/* Tarjetas Resumen */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-autumn-200 p-4 shadow-autumn-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-autumn-700">
              Mis Turnos Asignados
            </p>
            <p className="text-2xl font-black text-autumn-900 mt-1">
              {myAppointments.length}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-autumn-100 text-autumn-600">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-autumn-200 p-4 shadow-autumn-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-autumn-700">
              Mis Revisiones
            </p>
            <p className="text-2xl font-black text-autumn-900 mt-1">
              {myMedicalRecords.length}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-sage-100 text-sage-700">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-autumn-200 p-4 shadow-autumn-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-autumn-700">
              Mis Vacunaciones
            </p>
            <p className="text-2xl font-black text-autumn-900 mt-1">
              {myVaccines.length}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amberGold-100 text-amberGold-600">
            <Syringe className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* Pestañas y Buscador */}
      <section className="bg-white rounded-2xl border border-autumn-200 p-4 shadow-autumn-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <nav
          aria-label="Filtrar actividades de mi registro"
          className="flex flex-wrap gap-1.5 bg-autumn-100/60 p-1 rounded-xl"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? "bg-white text-autumn-900 shadow-xs"
                    : "text-autumn-700 hover:text-autumn-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="w-full md:w-80">
          <Input
            icon={Search}
            placeholder="Buscar por mascota, dueño o motivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-xs"
          />
        </div>
      </section>

      {/* Listado de Actividades */}
      <section aria-live="polite" className="space-y-3">
        {unifiedActivities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-autumn-200 p-10 text-center space-y-2 shadow-autumn-sm">
            <UserCheck className="w-10 h-10 text-autumn-400 mx-auto" />
            <h2 className="text-base font-bold text-autumn-900">
              Sin actividades registradas en esta vista
            </h2>
            <p className="text-xs text-autumn-700 max-w-md mx-auto">
              Cuando te asignen turnos o registres historias clínicas y vacunas, aparecerán automáticamente aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {unifiedActivities.map((item) => (
              <article
                key={item.key}
                className="bg-white rounded-2xl border border-autumn-200 p-4 sm:p-5 shadow-autumn-sm hover:border-autumn-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <PetAvatar
                    src={item.petPhoto}
                    name={item.petName}
                    species={item.petSpecies}
                    size="md"
                  />

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="default" className="text-[10px]">
                        {item.kindLabel}
                      </Badge>
                      <Badge variant={item.statusVariant}>
                        {item.statusLabel}
                      </Badge>
                      <span className="text-xs text-autumn-700 font-medium inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-autumn-500" />
                        {item.date ? formatDate(item.date) : "Sin fecha"}
                        {item.time ? ` · ${item.time} hs` : ""}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-extrabold text-autumn-900 truncate">
                      {item.petName}{" "}
                      <span className="font-medium text-autumn-700 text-xs">
                        (Dueño: {item.ownerName})
                      </span>
                    </h3>

                    <p className="text-xs sm:text-sm font-semibold text-autumn-800">
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p className="text-xs text-autumn-700/80 line-clamp-2">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {item.kind === "turno" && item.canReassign && (
                  <div className="shrink-0 flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenReassignModal(item.rawAppointment)}
                      className="border-autumn-300 text-autumn-900 hover:bg-autumn-100 font-semibold"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Derivar / Reasignar Veterinario</span>
                    </Button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Modal de Derivación / Reasignación de Turno */}
      <Modal
        isOpen={Boolean(reassigningAppt)}
        onClose={handleCloseReassignModal}
        title={
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-autumn-600" />
            <span>Derivar / Reasignar Veterinario</span>
          </div>
        }
        maxWidth="max-w-md"
      >
        {reassigningAppt && (
          <form onSubmit={handleConfirmReassign} className="space-y-4 py-1">
            <div className="bg-autumn-50 border border-autumn-200 rounded-xl p-3.5 text-xs space-y-1">
              <div className="font-bold text-autumn-900 text-sm">
                {reassigningAppt.pet_name}
              </div>
              <div className="text-autumn-800">
                Fecha: {formatDate(reassigningAppt.appointment_date)} ·{" "}
                {reassigningAppt.appointment_time} hs
              </div>
              <div className="text-autumn-700 italic">
                Motivo: {reassigningAppt.reason}
              </div>
            </div>

            {reassignError && (
              <div
                role="alert"
                className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{reassignError}</span>
              </div>
            )}

            {otherVetsOptions.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-amberGold-50 border border-amberGold-200 text-amberGold-800 text-xs">
                No hay otros veterinarios activos disponibles en el sistema para derivar este turno.
              </div>
            ) : (
              <Select
                label="Nuevo Veterinario Asignado *"
                options={otherVetsOptions}
                value={targetVetId}
                onChange={(e) => setTargetVetId(e.target.value)}
                disabled={isReassigning}
                required
              />
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-autumn-100">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseReassignModal}
                disabled={isReassigning}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isReassigning || otherVetsOptions.length === 0}
                className="font-semibold"
              >
                {isReassigning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Reasignando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar Derivación</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

MiRegistroClient.propTypes = {
  currentProfile: PropTypes.shape({
    id: PropTypes.string.isRequired,
    authUserId: PropTypes.string,
    full_name: PropTypes.string,
    role: PropTypes.string,
  }).isRequired,
};
